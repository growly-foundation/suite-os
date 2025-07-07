"""
Example demonstrating distributed transaction fetching using Celery workers.

This script shows how to fetch transactions from a large contract (6 million transactions)
using the Celery-based approach for distributed processing.
"""

import asyncio
import aiohttp
import os
import sys
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime

# Add parent directory to path when script is run directly
if __name__ == "__main__":
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sys.path.insert(0, parent_dir)

from config.logging_config import get_logger
from dotenv import load_dotenv
from providers.etherscan import EtherscanProvider, FetchMode
from celery_tasks.coordinator import TransactionFetchCoordinator

load_dotenv()
logger = get_logger(__name__)

# Validate API key
etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
if not etherscan_api_key:
    logger.error("ETHERSCAN_API_KEY environment variable not set")
    raise ValueError("ETHERSCAN_API_KEY environment variable not set")

etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)

# Configuration
BLOCK_SIZE = 1_000_000  # Block size for each batch
WALLET_ADDRESS = "0x6Cb442acF35158D5eDa88fe602221b67B400Be3E"  # Example large contract
CHAIN_ID = 8453  # Base chain


async def get_start_block_and_date(
    wallet_address: str, chain_id: int
) -> Tuple[int, str]:
    """
    Fetch the first transaction to determine start block and date.

    Args:
        wallet_address: Wallet address to fetch transactions for
        chain_id: Blockchain chain ID

    Returns:
        Tuple of (start_block, start_date)
    """
    logger.info(f"Fetching first transaction data for {wallet_address}")
    logger.info(f"Chain ID: {chain_id}")

    async with aiohttp.ClientSession() as session:
        first_transaction = await etherscan_provider.fetch_transaction_batch(
            session,
            wallet_address,
            chain_id,
            0,
            "latest",
            1,  # Only get first transaction
        )

    start_block = first_transaction.last_block_number
    start_date = first_transaction.transactions[0]["block_time"]

    return start_block, start_date


async def get_latest_block_and_date(chain_id: int) -> Tuple[int, str]:
    """Get the latest block number and current date."""
    latest_block = await etherscan_provider.get_latest_block_number(chain_id)
    current_date = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
    return latest_block, current_date


def fetch_with_celery_workers(
    wallet_address: str,
    chain_id: int,
    start_block: int,
    end_block: int,
    block_size: int = BLOCK_SIZE,
) -> List[Dict]:
    """
    Fetch transactions using Celery workers for distributed processing.

    Args:
        wallet_address: The contract address to fetch transactions for
        chain_id: Blockchain chain ID
        start_block: Starting block number
        end_block: Ending block number
        block_size: Block size for each batch

    Returns:
        List of all transactions across all batches
    """
    logger.info("=== CELERY DISTRIBUTED FETCHING ===")
    logger.info(f"Contract: {wallet_address}")
    logger.info(f"Block range: {start_block:,} to {end_block:,}")
    logger.info(f"Total blocks: {end_block - start_block + 1:,}")
    logger.info(f"Block size per batch: {block_size:,}")

    # Calculate estimated number of batches
    total_blocks = end_block - start_block + 1
    estimated_batches = (total_blocks + block_size - 1) // block_size
    logger.info(f"Estimated batches: {estimated_batches}")

    # Initialize coordinator
    coordinator = TransactionFetchCoordinator(block_size=block_size)

    # Start distributed fetching
    start_time = datetime.now()
    logger.info(f"Starting distributed fetch at {start_time}")

    try:
        all_transactions = coordinator.fetch_large_contract_transactions(
            wallet_address=wallet_address,
            chain_id=chain_id,
            start_block=start_block,
            end_block=end_block,
            poll_interval=30,  # Check progress every 30 seconds
        )

        end_time = datetime.now()
        duration = end_time - start_time

        logger.info("=== FETCH RESULTS ===")
        logger.info(f"Total transactions fetched: {len(all_transactions):,}")
        logger.info(f"Total time: {duration}")
        logger.info(
            f"Average rate: {len(all_transactions) / duration.total_seconds():.2f} tx/sec"
        )

        return all_transactions

    except Exception as e:
        logger.error(f"Error during distributed fetch: {e}")
        raise


async def run_example():
    """Run the complete example demonstrating both approaches."""
    logger.info("Starting large contract transaction fetching example")

    # Step 1: Get the block range for the contract
    logger.info("Step 1: Getting contract block range...")
    start_block, start_date = await get_start_block_and_date(WALLET_ADDRESS, CHAIN_ID)
    latest_block_int, latest_block_date = await get_latest_block_and_date(CHAIN_ID)

    logger.info(f"Contract first transaction: Block {start_block:,} ({start_date})")
    logger.info(f"Latest block: {latest_block_int:,} ({latest_block_date})")

    total_blocks = latest_block_int - start_block + 1
    logger.info(f"Total block range: {total_blocks:,} blocks")

    # Step 2: Use Celery workers for distributed fetching
    logger.info("\nStep 2: Fetching with Celery workers...")

    # For demonstration, let's use a smaller range if the total is very large
    demo_end_block = min(
        start_block + 5_000_000, latest_block_int
    )  # Limit to 5M blocks for demo

    celery_transactions = fetch_with_celery_workers(
        wallet_address=WALLET_ADDRESS,
        chain_id=CHAIN_ID,
        start_block=start_block,
        end_block=demo_end_block,
        block_size=BLOCK_SIZE,
    )

    logger.info("\n=== EXAMPLE COMPLETE ===")
    logger.info(f"Successfully processed {len(celery_transactions):,} transactions")

    # Show sample transactions
    if celery_transactions:
        logger.info("\nSample transactions:")
        for i, tx in enumerate(celery_transactions[:3]):
            logger.info(
                f"  {i+1}. Block {tx.get('block_number')} - Hash: {tx.get('hash')[:20]}..."
            )


def main():
    """
    Main function that can be run in different modes:
    1. Full example (fetches actual data using Celery workers)
    2. Demo mode (shows the setup without heavy processing)
    """
    import argparse

    parser = argparse.ArgumentParser(
        description="Celery distributed transaction fetching example"
    )
    parser.add_argument(
        "--mode",
        choices=["demo", "full"],
        default="demo",
        help="Demo mode shows setup, full mode runs actual fetching",
    )
    parser.add_argument(
        "--wallet",
        default=WALLET_ADDRESS,
        help="Wallet address to fetch transactions for",
    )
    parser.add_argument(
        "--blocks", type=int, default=BLOCK_SIZE, help="Block size per batch"
    )

    args = parser.parse_args()

    if args.mode == "demo":
        logger.info("=== DEMO MODE ===")
        logger.info(
            "This demonstrates the Celery setup for distributed transaction fetching"
        )
        logger.info(f"Wallet: {args.wallet}")
        logger.info(f"Block size per batch: {args.blocks:,}")
        logger.info("\nTo run the full example:")
        logger.info("1. Start Redis: redis-server")
        logger.info(
            "2. Start Celery workers: celery -A celeryapp worker --loglevel=info"
        )
        logger.info("3. Run this script with --mode=full")

        # Just get the block range info
        asyncio.run(get_start_block_and_date(args.wallet, CHAIN_ID))

    else:
        logger.info("=== FULL MODE ===")
        logger.info("Running complete distributed fetching example")
        asyncio.run(run_example())


if __name__ == "__main__":
    main()
