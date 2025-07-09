"""
ETL API Routes

This module defines FastAPI routes for ETL operations.
"""

import os
import uuid
from typing import Optional, List
from datetime import datetime, timezone

from api.dependencies import get_catalog
from config.logging_config import get_logger
from config.redis_config import get_redis_manager, generate_task_status_key
from db.iceberg import load_table, reorder_records
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pipelines.raw.cursor import (
    get_cursor,
    update_cursor,
    calculate_time_based_start_block,
)
from pipelines.raw.transactions import load_transactions_with_safety
from pipelines.raw.contract_address_import import (
    ContractAddressImporter,
)
from providers.etherscan import EtherscanProvider, FetchMode, TimePeriod
from pydantic import BaseModel, Field, constr
from utils.blockchain import is_valid_address, extract_block_range

logger = get_logger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/etl", tags=["etl"])


# Request model for syncing transactions
class SyncTransactionsRequest(BaseModel):
    address: constr(min_length=40, max_length=42) = Field(
        ..., description="Contract or wallet address to sync"
    )
    chain_id: int = Field(
        8453, description="Blockchain ID (1=Ethereum, 8453=Base, etc.)"
    )
    mode: str = Field(
        "incremental",
        description="Sync mode: 'full', 'incremental', or 'time_range'",
    )
    time_period: Optional[str] = Field(
        None,
        description="Time period for time_range mode: '1d', '3d', '7d', '14d', '30d', '90d'. Defaults to '7d'",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "address": "0x1234567890123456789012345678901234567890",
                "chain_id": 8453,
                "mode": "time_range",
                "time_period": "7d",
            }
        }


# Request model for unique addresses extraction
class ExtractUniqueAddressesRequest(BaseModel):
    contract_address: constr(min_length=40, max_length=42) = Field(
        ..., description="Contract address to analyze"
    )
    chain_id: int = Field(
        8453, description="Blockchain ID (1=Ethereum, 8453=Base, etc.)"
    )
    user_limit: int = Field(
        100, ge=1, le=10000, description="Maximum number of unique addresses to return"
    )
    cache_ttl: int = Field(
        3600,
        ge=60,
        le=86400,
        description="Cache time-to-live in seconds (1 hour default, max 24 hours)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "contract_address": "0x1234567890123456789012345678901234567890",
                "chain_id": 8453,
                "user_limit": 100,
                "cache_ttl": 3600,
            }
        }


# Response model for sync status
class SyncStatusResponse(BaseModel):
    status: str
    message: str
    task_id: Optional[str] = None
    address: str
    chain_id: int
    mode: str
    transactions_count: Optional[int] = None


# Response model for unique addresses
class UniqueAddressesResponse(BaseModel):
    status: str
    message: str
    task_id: Optional[str] = None
    contract_address: str
    chain_id: int
    user_limit: int
    addresses: Optional[List[str]] = None
    total_addresses: Optional[int] = None
    blocks_processed: Optional[int] = None
    transactions_processed: Optional[int] = None
    start_block: Optional[int] = None
    end_block: Optional[int] = None
    last_updated: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    from_cache: bool = False


# Task status model
class TaskStatus(BaseModel):
    task_id: str
    status: str  # "running", "completed", "failed"
    message: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[dict] = None
    error: Optional[str] = None


async def _initialize_etl_tables(catalog, task_id):
    """Initialize and load required tables for ETL."""
    transactions_table = load_table(catalog, "raw", "transactions")
    cursor_table = load_table(catalog, "raw", "cursor")

    if not transactions_table or not cursor_table:
        logger.error(f"Task {task_id}: Failed to load tables")
        return None, None

    return transactions_table, cursor_table


async def _determine_fetch_mode(
    cursor_table, chain_id, address, mode, time_period, task_id
):
    """Determine fetch mode and starting block for incremental sync."""
    # Get last block number for incremental mode
    last_block_number = None
    period = None

    if mode == "full":
        fetch_mode = FetchMode.FULL_REFRESH
    elif mode == "time_range":
        fetch_mode = FetchMode.TIME_RANGE
        period = (
            TimePeriod.from_string(time_period) if time_period else TimePeriod.DAYS_7
        )
    else:
        fetch_mode = FetchMode.INCREMENTAL

    if fetch_mode == FetchMode.INCREMENTAL:
        cursor_data = get_cursor(cursor_table, chain_id, address)
        if cursor_data is not None:
            try:
                # cursor_data is now a tuple (start_block, end_block)
                _, end_block = cursor_data
                last_block_number = int(end_block)
                logger.info(
                    f"Task {task_id}: Starting from block {last_block_number} (incremental mode)"
                )
            except (ValueError, TypeError):
                logger.warning(
                    f"Task {task_id}: Invalid block number in cursor: {cursor_data}"
                )
                last_block_number = None
                fetch_mode = FetchMode.FULL_REFRESH
        else:
            logger.info(f"Task {task_id}: No cursor found, using full refresh mode")
            fetch_mode = FetchMode.FULL_REFRESH
    elif fetch_mode == FetchMode.TIME_RANGE:
        logger.info(f"Task {task_id}: Using time-range mode ({period.value})")

    return fetch_mode, last_block_number, period


async def _check_running_task(
    redis_manager,
    chain_id: int,
    contract_address: str,
    user_limit: int,
) -> Optional[str]:
    """
    Check if there's already a running task or very recent task for the same contract and parameters.

    This prevents race conditions where consecutive requests might create duplicate tasks
    before the first one updates its status to "running".

    Args:
        redis_manager: Redis manager instance
        chain_id: Blockchain chain ID
        contract_address: Contract address
        user_limit: Maximum number of unique addresses

    Returns:
        Task ID if found, None otherwise
    """
    try:
        # Generate a search pattern for task status keys
        pattern = "task_status:*"
        task_keys = await redis_manager.keys(pattern)

        current_time = datetime.now()

        for task_key in task_keys:
            task_data = await redis_manager.get_json(task_key)
            if not task_data:
                continue

            # Check if task has matching parameters
            metadata = task_data.get("metadata", {})
            if (
                metadata.get("contract_address") == contract_address
                and metadata.get("chain_id") == chain_id
                and metadata.get("user_limit") == user_limit
            ):
                task_status = task_data.get("status")

                # Check for running tasks
                if task_status == "running":
                    task_id = task_key.split(":")[-1] if ":" in task_key else task_key
                    logger.info(f"Found running task {task_id} for same parameters")
                    return task_id

                # Check for very recent tasks (within last 30 seconds) to prevent race conditions
                created_at_str = task_data.get("created_at")
                if created_at_str and task_status in [
                    "running",
                    None,
                ]:  # None status = just created
                    try:
                        created_at = datetime.fromisoformat(
                            created_at_str.replace("Z", "+00:00")
                        )
                        time_diff = (
                            current_time - created_at.replace(tzinfo=None)
                        ).total_seconds()

                        if time_diff < 30:  # Task created within last 30 seconds
                            task_id = (
                                task_key.split(":")[-1] if ":" in task_key else task_key
                            )
                            logger.info(
                                f"Found recent task {task_id} created {time_diff:.1f}s ago with same parameters"
                            )
                            return task_id
                    except (ValueError, AttributeError) as e:
                        logger.debug(f"Error parsing created_at for task: {e}")
                        continue

        return None

    except Exception as e:
        logger.warning(f"Error checking for running tasks: {e}")
        return None


async def _update_task_status(
    redis_manager,
    task_id: str,
    status: str,
    message: str,
    result: Optional[dict] = None,
    error: Optional[str] = None,
    metadata: Optional[dict] = None,
):
    """Update task status in Redis."""
    try:
        task_key = generate_task_status_key(task_id)
        task_data = {
            "task_id": task_id,
            "status": status,
            "message": message,
            "created_at": datetime.now().isoformat(),
            "completed_at": (
                datetime.now().isoformat()
                if status in ["completed", "failed"]
                else None
            ),
            "result": result,
            "error": error,
            "metadata": metadata or {},  # Store request parameters and other metadata
        }

        await redis_manager.set_json(task_key, task_data, ex=86400)  # 24 hour TTL
        logger.info(f"Updated task {task_id} status to {status}")

    except Exception as e:
        logger.error(f"Failed to update task status for {task_id}: {e}")


# Background task to import contract addresses
async def import_contract_addresses_task(
    catalog,
    contract_address: str,
    chain_id: int,
    user_limit: int,
    cache_ttl: int,
    task_id: str,
):
    """
    Background task to import unique addresses that have interacted with a contract.

    Uses a decoupled approach:
    1. Fast address extraction and immediate caching for quick API response
    2. Separate database persistence that doesn't block the user

    Args:
        catalog: Iceberg catalog from app.state
        contract_address: Contract address to analyze
        chain_id: Blockchain ID
        user_limit: Maximum number of unique addresses to return
        cache_ttl: Cache time-to-live in seconds
        task_id: Task identifier for tracking
    """
    redis_manager = await get_redis_manager()

    # Store task metadata including request parameters
    task_metadata = {
        "contract_address": contract_address,
        "chain_id": chain_id,
        "user_limit": user_limit,
        "cache_ttl": cache_ttl,
    }

    try:
        logger.info(
            f"Starting unique addresses extraction task {task_id} "
            f"for {contract_address} on chain {chain_id}, limit: {user_limit}"
        )

        # Task status is already set to "running" by the endpoint
        # Update status to indicate we're proceeding with the import
        await _update_task_status(
            redis_manager,
            task_id,
            "running",
            f"Proceeding with address import for {contract_address}",
            metadata=task_metadata,
        )

        # Get Etherscan API key
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        if not etherscan_api_key:
            error_msg = "ETHERSCAN_API_KEY not set"
            logger.error(f"Task {task_id}: {error_msg}")
            await _update_task_status(
                redis_manager,
                task_id,
                "failed",
                error_msg,
                error=error_msg,
                metadata=task_metadata,
            )
            return

        # Initialize providers
        etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)
        extractor = ContractAddressImporter(redis_manager, etherscan_provider)

        # Check if we have cached results first
        cached_result = await extractor.get_cached_result(chain_id, contract_address)
        if cached_result:
            logger.info(
                f"Task {task_id}: Found cached result with {cached_result.total_addresses} addresses"
            )

            result_data = {
                "addresses": cached_result.addresses,
                "total_addresses": cached_result.total_addresses,
                "blocks_processed": cached_result.blocks_processed,
                "transactions_processed": cached_result.transactions_processed,
                "start_block": cached_result.start_block,
                "end_block": cached_result.end_block,
                "last_updated": cached_result.last_updated.isoformat(),
                "expires_at": (
                    cached_result.expires_at.isoformat()
                    if cached_result.expires_at
                    else None
                ),
                "from_cache": True,
            }

            await _update_task_status(
                redis_manager,
                task_id,
                "completed",
                f"Retrieved {cached_result.total_addresses} unique addresses from cache",
                result=result_data,
                metadata=task_metadata,
            )
            return

        # PHASE 1: Fast address extraction (no database blocking)
        logger.info(f"Task {task_id}: Starting fast address extraction phase")
        result = await extractor.import_addresses_fast(
            chain_id=chain_id,
            contract_address=contract_address,
            user_limit=user_limit,
            task_id=task_id,
        )

        # PHASE 2: Immediate caching for fast API response
        logger.info(f"Task {task_id}: Caching results for immediate availability")
        cache_success = await extractor.cache_result(
            chain_id, contract_address, result, cache_ttl
        )

        if not cache_success:
            logger.warning(f"Task {task_id}: Failed to cache results")

        # Calculate expires_at based on cache_ttl
        expires_at_timestamp = datetime.now(timezone.utc).timestamp() + cache_ttl
        expires_at_iso = datetime.fromtimestamp(
            expires_at_timestamp, tz=timezone.utc
        ).isoformat()

        # Prepare result data for API response
        result_data = {
            "addresses": result.addresses,
            "total_addresses": result.total_addresses,
            "blocks_processed": result.blocks_processed,
            "transactions_processed": result.transactions_processed,
            "start_block": result.start_block,
            "end_block": result.end_block,
            "last_updated": result.last_updated.isoformat(),
            "expires_at": expires_at_iso,
            "from_cache": False,
        }

        # Update task status to completed (API can respond immediately)
        await _update_task_status(
            redis_manager,
            task_id,
            "completed",
            f"Imported {result.total_addresses} unique addresses successfully",
            result=result_data,
            metadata=task_metadata,
        )

        logger.info(
            f"Task {task_id}: Address extraction completed successfully. "
            f"Found {result.total_addresses} addresses from {result.transactions_processed} transactions"
        )

        # PHASE 3: Background database persistence (non-blocking)
        logger.info(f"Task {task_id}: Starting background database persistence")
        try:
            db_success = await extractor.persist_to_database(
                catalog, result, chain_id, contract_address, task_id
            )

            if db_success:
                logger.info(
                    f"Task {task_id}: Database persistence completed successfully"
                )
            else:
                logger.warning(
                    f"Task {task_id}: Database persistence failed, but results are cached"
                )

        except Exception as db_error:
            # Database errors don't fail the overall task since results are already cached
            logger.error(f"Task {task_id}: Database persistence error: {db_error}")
            logger.info(
                f"Task {task_id}: Results remain available from cache despite database error"
            )

    except Exception as e:
        error_msg = f"Error in contract address import task: {e}"
        logger.error(f"Task {task_id}: {error_msg}")
        await _update_task_status(
            redis_manager,
            task_id,
            "failed",
            error_msg,
            error=str(e),
            metadata=task_metadata,
        )


# Background task to sync transactions
async def sync_transactions_task(
    catalog,
    address: str,
    chain_id: int,
    mode: str,
    time_period: Optional[str],
    task_id: str,
):
    """
    Background task to sync transactions for a contract or wallet address.

    Args:
        catalog: Iceberg catalog from app.state
        address: Contract or wallet address
        chain_id: Blockchain ID
        mode: Sync mode ('full', 'incremental', or 'time_range')
        time_period: Time period for time_range mode
        task_id: Task identifier for tracking
    """
    try:
        logger.info(
            f"Starting sync task {task_id} for {address} on chain {chain_id}, mode: {mode}"
        )

        transactions_table, cursor_table = await _initialize_etl_tables(
            catalog, task_id
        )
        if not transactions_table:
            return

        fetch_mode, last_block_number, period = await _determine_fetch_mode(
            cursor_table, chain_id, address, mode, time_period, task_id
        )

        # Fetch transactions from Etherscan
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        if not etherscan_api_key:
            logger.error(f"Task {task_id}: ETHERSCAN_API_KEY not set")
            return

        etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)
        transactions = await etherscan_provider.get_all_transactions(
            address=address,
            chain_id=chain_id,
            mode=fetch_mode,
            last_block_number=last_block_number,
            time_period=period,
        )

        if not transactions:
            logger.info(f"Task {task_id}: No transactions found")
            return

        logger.info(f"Task {task_id}: Retrieved {len(transactions)} transactions")

        # Get highest block number
        highest_block_number = None
        lowest_block_number = None
        if transactions:
            try:
                lowest_block_number, highest_block_number = extract_block_range(
                    transactions
                )
                if lowest_block_number is not None and highest_block_number is not None:
                    logger.info(
                        f"Task {task_id}: Block range: {lowest_block_number} to {highest_block_number}"
                    )
            except Exception as e:
                logger.error(f"Task {task_id}: Error determining block numbers: {e}")

        # Process and insert data using consolidated safety function
        schema = transactions_table.schema()
        transactions = reorder_records(transactions, schema)

        # Use the consolidated function with automatic overlap detection
        success = load_transactions_with_safety(
            catalog, "raw", chain_id, address, transactions
        )

        if not success:
            logger.error(f"Task {task_id}: Failed to load transaction data")
            return

        # Update cursor
        if highest_block_number is not None:
            logger.info(
                f"Task {task_id}: Updating cursor to block {highest_block_number}"
            )

            # Calculate start_block based on fetch mode
            start_block = None
            if fetch_mode == FetchMode.FULL_REFRESH:
                start_block = "0"  # From genesis
            elif fetch_mode == FetchMode.TIME_RANGE:
                # Calculate time-based start block using the new flexible function
                start_block = await calculate_time_based_start_block(
                    chain_id, period, f"Task {task_id}"
                )
            # For incremental mode, let update_cursor use previous end_block as start_block

            await update_cursor(
                catalog,
                "raw",
                chain_id,
                address,
                highest_block_number,
                start_block=start_block,
            )

        logger.info(
            f"Task {task_id}: Sync completed successfully, {len(transactions)} transactions processed"
        )

    except Exception as e:
        logger.error(f"Task {task_id}: Error in sync task: {e}")


@router.post("/addresses/import", response_model=UniqueAddressesResponse)
async def extract_unique_addresses(
    request: ExtractUniqueAddressesRequest,
    background_tasks: BackgroundTasks,
    catalog=Depends(get_catalog),
):
    """
    Import unique addresses that have interacted with a smart contract.

    This endpoint starts a background task to:
    1. Fetch transactions from the contract address
    2. Import unique addresses (from + to fields)
    3. Store raw transaction data in raw.transactions table
    4. Update raw.cursor table with processing progress
    5. Cache results in Redis with configurable TTL

    The process works backward from the latest block to find the most recent
    unique addresses up to the specified limit.
    """
    # Validate address
    if not is_valid_address(request.contract_address, request.chain_id):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Normalize address
    contract_address = request.contract_address.lower()

    # Check for running tasks BEFORE generating task ID to prevent race conditions
    try:
        redis_manager = await get_redis_manager()
        running_task_id = await _check_running_task(
            redis_manager, request.chain_id, contract_address, request.user_limit
        )
        if running_task_id:
            logger.info(
                f"Returning running task {running_task_id} for {contract_address}"
            )
            return UniqueAddressesResponse(
                status="running",
                message=f"Address import already running for {contract_address}",
                task_id=running_task_id,
                contract_address=contract_address,
                chain_id=request.chain_id,
                user_limit=request.user_limit,
                from_cache=False,
            )
    except Exception as e:
        logger.warning(f"Error checking for running tasks: {e}")
        # Continue with task creation if duplicate check fails

    # Generate task ID only after duplicate check
    task_id = str(uuid.uuid4())

    # Check for existing cached results
    try:
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")

        if etherscan_api_key:
            etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)
            extractor = ContractAddressImporter(redis_manager, etherscan_provider)

            cached_result = await extractor.get_cached_result(
                request.chain_id, contract_address
            )
            if cached_result:
                logger.info(f"Returning cached result for {contract_address}")
                return UniqueAddressesResponse(
                    status="completed",
                    message="Retrieved imported addresses from cache",
                    task_id=None,  # No task needed for cached results
                    contract_address=contract_address,
                    chain_id=request.chain_id,
                    user_limit=request.user_limit,
                    addresses=cached_result.addresses[
                        : request.user_limit
                    ],  # Respect current limit
                    total_addresses=min(
                        cached_result.total_addresses, request.user_limit
                    ),
                    blocks_processed=cached_result.blocks_processed,
                    transactions_processed=cached_result.transactions_processed,
                    start_block=cached_result.start_block,
                    end_block=cached_result.end_block,
                    last_updated=cached_result.last_updated,
                    expires_at=cached_result.expires_at,
                    from_cache=True,
                )
    except Exception as e:
        logger.warning(f"Error checking cache for {contract_address}: {e}")
        # Continue with background task if cache check fails

    # Double-check for running tasks after cache check to handle race conditions
    try:
        running_task_id = await _check_running_task(
            redis_manager, request.chain_id, contract_address, request.user_limit
        )
        if running_task_id:
            logger.info(
                f"Returning running task {running_task_id} for {contract_address} (double-check)"
            )
            return UniqueAddressesResponse(
                status="running",
                message=f"Address import already running for {contract_address}",
                task_id=running_task_id,
                contract_address=contract_address,
                chain_id=request.chain_id,
                user_limit=request.user_limit,
                from_cache=False,
            )
    except Exception as e:
        logger.warning(f"Error in second duplicate check: {e}")

    # Immediately create task status entry to prevent race conditions with consecutive requests
    task_metadata = {
        "contract_address": contract_address,
        "chain_id": request.chain_id,
        "user_limit": request.user_limit,
        "cache_ttl": request.cache_ttl,
    }

    await _update_task_status(
        redis_manager,
        task_id,
        "running",
        f"Initializing address import for {contract_address}",
        metadata=task_metadata,
    )

    # Start background task
    background_tasks.add_task(
        import_contract_addresses_task,
        catalog,
        contract_address=contract_address,
        chain_id=request.chain_id,
        user_limit=request.user_limit,
        cache_ttl=request.cache_ttl,
        task_id=task_id,
    )

    # Return immediate response
    return UniqueAddressesResponse(
        status="started",
        message="Address import started in the background",
        task_id=task_id,
        contract_address=contract_address,
        chain_id=request.chain_id,
        user_limit=request.user_limit,
        from_cache=False,
    )


@router.get("/addresses/import/{task_id}", response_model=UniqueAddressesResponse)
async def get_unique_addresses_status(task_id: str):
    """
    Get the status and results of a unique addresses extraction task.
    """
    try:
        redis_manager = await get_redis_manager()
        task_key = generate_task_status_key(task_id)
        task_data = await redis_manager.get_json(task_key)

        if not task_data:
            raise HTTPException(status_code=404, detail="Task not found")

        # Extract basic task info
        status = task_data.get("status", "unknown")
        message = task_data.get("message", "")
        result = task_data.get("result", {})
        error = task_data.get("error")
        metadata = task_data.get("metadata", {})

        # Build response based on status
        if status == "failed":
            return UniqueAddressesResponse(
                status="failed",
                message=f"Task failed: {error or message}",
                task_id=task_id,
                contract_address=metadata.get("contract_address", ""),
                chain_id=metadata.get("chain_id", 0),
                user_limit=metadata.get("user_limit", 0),
                from_cache=False,
            )
        elif status == "running":
            return UniqueAddressesResponse(
                status="running",
                message=message,
                task_id=task_id,
                contract_address=metadata.get("contract_address", ""),
                chain_id=metadata.get("chain_id", 0),
                user_limit=metadata.get("user_limit", 0),
                from_cache=False,
            )
        elif status == "completed" and result:
            # Parse result data
            last_updated = None
            expires_at = None

            if result.get("last_updated"):
                try:
                    last_updated = datetime.fromisoformat(result["last_updated"])
                except (ValueError, TypeError) as e:
                    logger.debug(f"Failed to parse last_updated: {e}")
                    pass

            if result.get("expires_at"):
                try:
                    expires_at = datetime.fromisoformat(result["expires_at"])
                except (ValueError, TypeError) as e:
                    logger.debug(f"Failed to parse expires_at: {e}")
                    pass

            return UniqueAddressesResponse(
                status="completed",
                message=message,
                task_id=task_id,
                contract_address=metadata.get("contract_address", ""),
                chain_id=metadata.get("chain_id", 0),
                user_limit=metadata.get("user_limit", 0),
                addresses=result.get("addresses", []),
                total_addresses=result.get("total_addresses", 0),
                blocks_processed=result.get("blocks_processed", 0),
                transactions_processed=result.get("transactions_processed", 0),
                start_block=result.get("start_block", 0),
                end_block=result.get("end_block", 0),
                last_updated=last_updated,
                expires_at=expires_at,
                from_cache=result.get("from_cache", False),
            )
        else:
            return UniqueAddressesResponse(
                status=status,
                message=message,
                task_id=task_id,
                contract_address=metadata.get("contract_address", ""),
                chain_id=metadata.get("chain_id", 0),
                user_limit=metadata.get("user_limit", 0),
                from_cache=False,
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving task status for {task_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/sync", response_model=SyncStatusResponse)
async def sync_transactions(
    request: SyncTransactionsRequest,
    background_tasks: BackgroundTasks,
    catalog=Depends(get_catalog),
):
    """
    Sync transactions for a contract or wallet address.

    This endpoint starts a background task to fetch transactions from Etherscan
    and store them in the raw.transactions table.
    """
    # Validate address
    if not is_valid_address(request.address, request.chain_id):
        raise HTTPException(status_code=400, detail="Invalid blockchain address")

    # Validate mode
    if request.mode not in ["full", "incremental", "time_range"]:
        raise HTTPException(
            status_code=400,
            detail="Mode must be 'full', 'incremental', or 'time_range'",
        )

    # Validate time_period if provided
    if request.time_period:
        try:
            TimePeriod.from_string(request.time_period)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid time_period. Must be one of: 1d, 3d, 7d, 14d, 30d, 90d",
            )

    # Normalize address
    address = request.address.lower()

    task_id = str(uuid.uuid4())

    # Start background task
    background_tasks.add_task(
        sync_transactions_task,
        catalog,
        address=address,
        chain_id=request.chain_id,
        mode=request.mode,
        time_period=request.time_period,
        task_id=task_id,
    )

    # Return immediate response
    return SyncStatusResponse(
        status="started",
        message="Transaction sync started in the background",
        task_id=task_id,
        address=address,
        chain_id=request.chain_id,
        mode=request.mode,
    )


@router.get("/sync/{task_id}", response_model=SyncStatusResponse)
async def get_sync_status(task_id: str, catalog=Depends(get_catalog)):
    """
    Get the status of a sync task.
    """
    # Query task status from database/cache
    # Return actual status, progress, and completion details
    # For now, you could store task status in a simple in-memory dict
    # or use Redis/database for persistence

    # Example implementation:
    # task_status = get_task_status_from_store(task_id)
    # if not task_status:
    #     raise HTTPException(status_code=404, detail="Task not found")
    # return task_status

    raise HTTPException(
        status_code=501, detail="Task status tracking not implemented yet"
    )
