"""
ETL API Routes

This module defines FastAPI routes for ETL operations.
"""

import os
import uuid
from typing import Optional

from api.dependencies import get_catalog
from config.logging_config import get_logger
from db.iceberg import load_table, reorder_records
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pipelines.raw.cursor import (
    get_cursor,
    update_cursor,
    calculate_time_based_start_block,
)
from pipelines.raw.transactions import load_transactions_with_safety
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


# Response model for sync status
class SyncStatusResponse(BaseModel):
    status: str
    message: str
    task_id: Optional[str] = None
    address: str
    chain_id: int
    mode: str
    transactions_count: Optional[int] = None


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
