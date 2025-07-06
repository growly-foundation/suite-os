"""
Etherscan Account Provider

Provider for account-related Etherscan API operations.
Handles transaction fetching, pagination, and account-specific data.
"""

import asyncio
from dataclasses import dataclass
from typing import Dict, List, Optional

import aiohttp
from config.logging_config import get_logger

from .base import EtherscanBaseProvider, FetchMode

# Create a logger for this module
logger = get_logger(__name__)


@dataclass
class TransactionBatch:
    """Data class for transaction batch results."""

    transactions: List[Dict]
    last_block_number: int
    total_count: int


class EtherscanAccountProvider(EtherscanBaseProvider):
    """
    Account-specific provider for Etherscan API operations.

    Handles:
    - Transaction list fetching (txlist action)
    - Pagination and batch processing
    - Transaction enhancement and formatting
    """

    def __init__(self, api_key: str):
        """
        Initialize the account provider.

        Args:
            api_key: Etherscan API key
        """
        super().__init__(api_key)
        self.max_transactions_per_request = 10000

    def _get_account_params(
        self,
        chain_id: int,
        action: str,
        address: str,
        start_block: int = 0,
        end_block: str = "latest",
        page: int = 1,
        offset: int = 10000,
        sort: str = "asc",
    ) -> Dict:
        """
        Get parameters for account module requests.

        Args:
            chain_id: Blockchain chain ID
            action: Account action (e.g., "txlist")
            address: Wallet/contract address
            start_block: Starting block number
            end_block: Ending block number or "latest"
            page: Page number for pagination
            offset: Number of transactions per page
            sort: Sort order ("asc" or "desc")

        Returns:
            Dictionary with account-specific parameters
        """
        base_params = self._get_base_params(chain_id, "account", action)

        account_params = {
            "address": address,
            "startblock": start_block,
            "endblock": end_block,
            "page": page,
            "offset": offset,
            "sort": sort,
        }

        return {**base_params, **account_params}

    async def fetch_transaction_batch(
        self,
        session: aiohttp.ClientSession,
        address: str,
        chain_id: int,
        start_block: int = 0,
        end_block: str = "latest",
        limit: int = 10000,
    ) -> TransactionBatch:
        """
        Fetch a single batch of transactions from Etherscan API.

        Args:
            session: aiohttp session for making requests
            address: Wallet/contract address to fetch transactions for
            chain_id: Blockchain chain ID (1 for Ethereum mainnet)
            start_block: Starting block number
            end_block: Ending block number or "latest"
            limit: Maximum number of transactions to fetch

        Returns:
            TransactionBatch containing transactions and metadata
        """
        params = self._get_account_params(
            chain_id=chain_id,
            action="txlist",
            address=address,
            start_block=start_block,
            end_block=end_block,
            offset=limit,
        )

        logger.debug(f"Requesting transactions from block {start_block} to {end_block}")

        try:
            response = await self._make_request(session, params)

            if response.message == "No transactions found":
                logger.info(f"No transactions found from block {start_block}")
                return TransactionBatch([], start_block, 0)

            transactions = response.result or []
            logger.info(f"Received {len(transactions)} transactions from API")

            # Enhance each transaction with additional fields
            enhanced_transactions = [
                self._enhance_transaction(tx, chain_id) for tx in transactions
            ]

            last_block = 0
            if enhanced_transactions:
                last_block = int(enhanced_transactions[-1]["block_number"])
                logger.debug(f"Last block in batch: {last_block}")

            return TransactionBatch(
                enhanced_transactions, last_block, len(enhanced_transactions)
            )

        except Exception as e:
            logger.error(f"Error fetching transaction batch: {e}")
            raise

    async def get_all_transactions(
        self,
        address: str,
        chain_id: int,
        mode: FetchMode = FetchMode.FULL_REFRESH,
        last_block_number: Optional[int] = None,
    ) -> List:
        """
        Fetch all transactions for a given address.

        Args:
            address: Wallet/contract address to fetch transactions for
            chain_id: Blockchain chain ID (1 for Ethereum mainnet)
            mode: FetchMode.INCREMENTAL or FetchMode.FULL_REFRESH
            last_block_number: Starting block number for incremental mode
            return_full_objects: If True, return full transaction objects; if False, return only hashes

        Returns:
            List of transaction hashes or full transaction objects
        """
        logger.info(f"Starting transaction fetch for address: {address}")
        logger.info(f"Mode: {mode.value}")
        logger.info(f"Chain ID: {chain_id}")

        if not self._validate_chain_id(chain_id):
            raise ValueError(f"Unsupported chain ID: {chain_id}")

        all_transactions = []

        # Determine starting block
        if mode == FetchMode.INCREMENTAL and last_block_number is not None:
            next_block = last_block_number + 1
            logger.info(f"Starting from block: {next_block} (incremental mode)")
        else:
            next_block = 0
            logger.info("Starting from genesis block (full refresh mode)")

        async with aiohttp.ClientSession() as session:
            batch_count = 0

            while True:
                logger.info(
                    f"Fetching batch {batch_count + 1} starting from block {next_block}"
                )

                try:
                    batch = await self.fetch_transaction_batch(
                        session, address, chain_id, next_block, "latest"
                    )

                    if not batch.transactions:
                        logger.info("No more transactions found. Fetching complete.")
                        break

                    all_transactions.extend(batch.transactions)
                    batch_count += 1

                    logger.info(
                        f"Batch {batch_count}: Found {batch.total_count} transactions, "
                        f"up to block {batch.last_block_number}"
                    )

                    # If we got fewer than max transactions, we've reached the end
                    if batch.total_count < self.max_transactions_per_request:
                        logger.info(
                            f"Last batch (less than {self.max_transactions_per_request} transactions). "
                            f"Fetching complete."
                        )
                        break

                    # Prepare for next batch
                    next_block = batch.last_block_number + 1

                    # Rate limiting
                    await asyncio.sleep(0.2)

                except Exception as e:
                    logger.error(f"Error in batch {batch_count + 1}: {e}")
                    break

        total_transactions = len(all_transactions)
        logger.info(f"Fetching complete! Total transactions: {total_transactions}")

        return all_transactions
