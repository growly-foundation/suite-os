import aiohttp
import asyncio
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

load_dotenv()
logger = get_logger(__name__)

# Validate API key
etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
if not etherscan_api_key:
    logger.error("ETHERSCAN_API_KEY environment variable not set")
    raise ValueError("ETHERSCAN_API_KEY environment variable not set")

etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)

BLOCK_RANGE = 1_000_000


async def get_start_block_and_date(
    wallet_address: str, chain_id: int
) -> Tuple[int, str]:
    """
    Fetch Ethereum transaction data from Etherscan.

    Args:
        wallet_address: Wallet address to fetch transactions for
        chain_id: Blockchain chain ID
        fetch_config: Fetch configuration

    Returns:
        Tuple of (transactions list, highest block number)
    """

    # Log fetch details
    logger.info(f"Fetching Ethereum transaction data for {wallet_address}")
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
    latest_block = await etherscan_provider.get_latest_block_number(chain_id)
    current_date = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
    return latest_block, current_date


async def main():
    start_block, start_date = await get_start_block_and_date(
        "0x6Cb442acF35158D5eDa88fe602221b67B400Be3E", 8453
    )
    print(start_block, start_date)
    latest_block_int, latest_block_date = await get_latest_block_and_date(8453)
    print(latest_block_int, latest_block_date)


if __name__ == "__main__":
    asyncio.run(main())
