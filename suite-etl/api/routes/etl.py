"""
ETL API Routes

This module defines FastAPI routes for ETL operations.
"""

import os
import asyncio
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query, Request
from pydantic import BaseModel, constr, Field

from api.dependencies import get_catalog
from utils.logging_config import get_logger
from utils.blockchain import is_valid_address
from providers.etherscan_provider import EtherscanProvider, FetchMode
from db.iceberg import load_table, reorder_records, append_data
from pipelines.raw.cursor import get_cursor, update_cursor

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
    mode: str = Field("incremental", description="Sync mode: 'full' or 'incremental'")

    class Config:
        json_schema_extra = {
            "example": {
                "address": "0xa3dcf3ca587d9929d540868c924f208726dc9ab6",
                "chain_id": 8453,
                "mode": "incremental",
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


# Background task to sync transactions
async def sync_transactions_task(
    catalog, address: str, chain_id: int, mode: str, task_id: str
):
    """
    Background task to sync transactions for a contract or wallet address.

    Args:
        catalog: Iceberg catalog from app.state
        address: Contract or wallet address
        chain_id: Blockchain ID
        mode: Sync mode ('full' or 'incremental')
        task_id: Task identifier for tracking
    """
    try:
        logger.info(
            f"Starting sync task {task_id} for {address} on chain {chain_id}, mode: {mode}"
        )

        # Load tables
        transactions_table = load_table(catalog, "raw", "transactions")
        cursor_table = load_table(catalog, "raw", "cursor")

        if not transactions_table or not cursor_table:
            logger.error(f"Task {task_id}: Failed to load tables")
            return

        # Get last block number for incremental mode
        last_block_number = None
        fetch_mode = FetchMode.FULL_REFRESH if mode == "full" else FetchMode.INCREMENTAL

        if fetch_mode == FetchMode.INCREMENTAL:
            last_block_number = get_cursor(cursor_table, chain_id, address)
            if last_block_number is not None:
                try:
                    last_block_number = int(last_block_number)
                    logger.info(
                        f"Task {task_id}: Starting from block {last_block_number}"
                    )
                except ValueError:
                    logger.warning(
                        f"Task {task_id}: Invalid block number in cursor: {last_block_number}"
                    )
                    last_block_number = None
                    fetch_mode = FetchMode.FULL_REFRESH
            else:
                logger.info(f"Task {task_id}: No cursor found, using full refresh mode")
                fetch_mode = FetchMode.FULL_REFRESH

        # Fetch transactions from Etherscan
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        if not etherscan_api_key:
            logger.error(f"Task {task_id}: ETHERSCAN_API_KEY not set")
            return

        etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)
        transactions = await etherscan_provider.get_all_transactions_full(
            address=address,
            chain_id=chain_id,
            mode=fetch_mode,
            last_block_number=last_block_number,
        )

        if not transactions:
            logger.info(f"Task {task_id}: No transactions found")
            return

        logger.info(f"Task {task_id}: Retrieved {len(transactions)} transactions")

        # Get highest block number
        highest_block_number = None
        if transactions:
            try:
                block_numbers = [int(tx.get("block_number", 0)) for tx in transactions]
                highest_block_number = max(block_numbers)
                logger.info(
                    f"Task {task_id}: Highest block number: {highest_block_number}"
                )
            except (ValueError, TypeError) as e:
                logger.error(
                    f"Task {task_id}: Error determining highest block number: {e}"
                )

        # Process and append data
        schema = transactions_table.schema()
        transactions = reorder_records(transactions, schema)
        append_data(transactions_table, transactions, schema.as_arrow())

        # Update cursor
        if highest_block_number is not None:
            logger.info(
                f"Task {task_id}: Updating cursor to block {highest_block_number}"
            )
            update_cursor(catalog, "raw", chain_id, address, highest_block_number)

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
    if not is_valid_address(request.address):
        raise HTTPException(status_code=400, detail="Invalid blockchain address")

    # Validate mode
    if request.mode not in ["full", "incremental"]:
        raise HTTPException(
            status_code=400, detail="Mode must be 'full' or 'incremental'"
        )

    # Normalize address
    address = request.address.lower()

    # Generate task ID
    import uuid

    task_id = str(uuid.uuid4())

    # Start background task
    background_tasks.add_task(
        sync_transactions_task,
        catalog,
        address=address,
        chain_id=request.chain_id,
        mode=request.mode,
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
async def get_sync_status(task_id: str):
    """
    Get the status of a sync task.

    Note: This is a placeholder implementation. In a production environment,
    you would store task status in a database or cache.
    """
    # In a real implementation, you would check a database or cache for task status
    # For now, we'll just return a generic response
    return SyncStatusResponse(
        status="unknown",
        message="Task status tracking not implemented yet",
        task_id=task_id,
        address="unknown",
        chain_id=0,
        mode="unknown",
    )
