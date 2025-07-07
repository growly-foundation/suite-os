"""
Celery tasks for distributed transaction fetching.
"""

import asyncio
import aiohttp
import os
import sys
from typing import Dict, List, Optional, Tuple

# Add parent directory to path for imports
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, parent_dir)

from config.logging_config import get_logger
from providers.etherscan import EtherscanProvider
from .app import app

logger = get_logger(__name__)

# Initialize etherscan provider
etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
if not etherscan_api_key:
    raise ValueError("ETHERSCAN_API_KEY environment variable not set")

etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)


@app.task(bind=True, retry_backoff=True, retry_kwargs={"max_retries": 3})
def fetch_transaction_batch_task(
    self,
    wallet_address: str,
    chain_id: int,
    start_block: int,
    end_block: int,
    batch_id: Optional[str] = None,
) -> Dict:
    """
    Celery task to fetch a batch of transactions for a given address and block range.

    Args:
        wallet_address: The wallet/contract address to fetch transactions for
        chain_id: Blockchain chain ID (e.g., 1 for Ethereum, 8453 for Base)
        start_block: Starting block number for this batch
        end_block: Ending block number for this batch
        batch_id: Optional identifier for this batch

    Returns:
        Dict containing:
        - transactions: List of transaction data
        - start_block: Starting block number
        - end_block: Ending block number
        - batch_id: Batch identifier
        - total_count: Number of transactions fetched
    """
    try:
        logger.info(
            f"Task {self.request.id}: Fetching transactions for {wallet_address} "
            f"from block {start_block} to {end_block} (batch_id: {batch_id})"
        )

        # Run the async function in a new event loop
        result = asyncio.run(
            _fetch_transaction_batch_async(
                wallet_address, chain_id, start_block, end_block
            )
        )

        batch_result = {
            "transactions": result.transactions,
            "start_block": start_block,
            "end_block": end_block,
            "batch_id": batch_id,
            "total_count": result.total_count,
            "last_block_number": result.last_block_number,
            "task_id": self.request.id,
        }

        logger.info(
            f"Task {self.request.id}: Successfully fetched {result.total_count} transactions "
            f"for batch {batch_id}"
        )

        return batch_result

    except Exception as exc:
        logger.error(
            f"Task {self.request.id}: Error fetching transactions for batch {batch_id}: {exc}"
        )
        # Retry the task if it fails
        raise self.retry(exc=exc, countdown=60)


async def _fetch_transaction_batch_async(
    wallet_address: str, chain_id: int, start_block: int, end_block: int
):
    """
    Async helper function to fetch transaction batch.

    Args:
        wallet_address: The wallet/contract address to fetch transactions for
        chain_id: Blockchain chain ID
        start_block: Starting block number
        end_block: Ending block number

    Returns:
        TransactionBatch object with fetched transactions
    """
    async with aiohttp.ClientSession() as session:
        batch = await etherscan_provider.fetch_transaction_batch(
            session=session,
            address=wallet_address,
            chain_id=chain_id,
            start_block=start_block,
            end_block=str(end_block),
            limit=10000,  # Max transactions per request
        )

        return batch
