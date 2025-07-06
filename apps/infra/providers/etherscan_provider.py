"""
Etherscan Provider

A provider for fetching Ethereum transaction data from Etherscan API v2.
This provider focuses solely on Etherscan API operations without Web3 dependencies.
"""

import asyncio
import re
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

import aiohttp
from config.logging_config import get_logger

# Create a logger for this module
logger = get_logger(__name__)


class FetchMode(Enum):
    """Enumeration for different fetch modes."""

    INCREMENTAL = "incremental"
    FULL_REFRESH = "full_refresh"


@dataclass
class TransactionBatch:
    """Data class for transaction batch results."""

    transactions: List[Dict]
    last_block_number: int
    total_count: int


class EtherscanProvider:
    """
    Ethereum transaction data provider using Etherscan API v2.

    This provider handles:
    - Fetching transaction data from Etherscan API
    - Pagination and rate limiting
    - Data enhancement with additional fields
    - Both hash-only and full transaction object responses
    """

    def __init__(self, api_key: str):
        """
        Initialize the Etherscan provider.

        Args:
            api_key: Etherscan API key
        """
        self.api_key = api_key
        self.base_url = "https://api.etherscan.io/v2/api"
        self.max_transactions_per_request = 10000
        logger.info("Initialized Etherscan provider")

    def _camel_to_snake(self, name: str) -> str:
        """
        Convert camelCase string to snake_case.

        Args:
            name: String in camelCase format

        Returns:
            String in snake_case format
        """
        # Handle edge cases for specific Etherscan fields to match DDL schema
        if name == "timeStamp":
            return "timestamp"
        if name == "isError":
            return "is_error"

        # For txreceipt_status, keep as-is (it's already in the correct format)
        if name == "txreceipt_status":
            return "txreceipt_status"

        # Insert an underscore before any uppercase letter that follows a lowercase letter
        s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
        # Insert an underscore before any uppercase letter that follows a lowercase letter or digit
        return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()

    def _convert_keys_to_snake_case(self, data: Dict) -> Dict:
        """
        Convert all keys in a dictionary from camelCase to snake_case.

        Args:
            data: Dictionary with camelCase keys

        Returns:
            Dictionary with snake_case keys
        """
        converted = {}
        for key, value in data.items():
            snake_key = self._camel_to_snake(key)
            converted[snake_key] = value
        return converted

    def _enhance_transaction(self, tx: Dict, chain_id: int) -> Dict:
        """
        Add additional fields to a transaction object and convert keys to snake_case.

        Args:
            tx: Raw transaction from Etherscan API
            chain_id: Blockchain chain ID

        Returns:
            Enhanced transaction with additional fields and snake_case keys matching DDL schema
        """
        # Convert camelCase keys to snake_case
        enhanced_tx = self._convert_keys_to_snake_case(tx)

        # Add chain_id
        enhanced_tx["chain_id"] = chain_id

        # Add block_time (convert from Unix timestamp to timestamp format)
        timestamp_unix = int(enhanced_tx["timestamp"])
        block_timestamp = datetime.fromtimestamp(timestamp_unix)
        enhanced_tx["block_time"] = block_timestamp

        # Add block_date (date only)
        enhanced_tx["block_date"] = block_timestamp.date()

        return enhanced_tx

    async def fetch_transaction_batch(
        self,
        session: aiohttp.ClientSession,
        address: str,
        chain_id: int,
        start_block: int = 0,
        end_block: str = "latest",
    ) -> TransactionBatch:
        """
        Fetch a single batch of transactions from Etherscan API.

        Args:
            session: aiohttp session for making requests
            address: Wallet/contract address to fetch transactions for
            chain_id: Blockchain chain ID (1 for Ethereum mainnet)
            start_block: Starting block number
            end_block: Ending block number or "latest"

        Returns:
            TransactionBatch containing transactions and metadata
        """
        params = {
            "chainid": chain_id,
            "module": "account",
            "action": "txlist",
            "address": address,
            "startblock": start_block,
            "endblock": end_block,
            "page": 1,
            "offset": self.max_transactions_per_request,
            "sort": "asc",
            "apikey": self.api_key,
        }

        logger.debug(f"Requesting transactions from block {start_block} to {end_block}")

        async with session.get(self.base_url, params=params) as response:
            if response.status != 200:
                logger.error(f"API request failed with status {response.status}")
                raise Exception(f"API request failed with status {response.status}")

            data = await response.json()

            if data.get("status") != "1":
                if data.get("message") == "No transactions found":
                    logger.info(f"No transactions found from block {start_block}")
                    return TransactionBatch([], start_block, 0)
                logger.error(f"API error: {data.get('message', 'Unknown error')}")
                raise Exception(f"API error: {data.get('message', 'Unknown error')}")

            transactions = data.get("result", [])
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

    async def get_all_transactions(
        self,
        address: str,
        chain_id: int,
        mode: FetchMode = FetchMode.FULL_REFRESH,
        last_block_number: Optional[int] = None,
        return_full_objects: bool = True,
    ) -> List:
        """
        Fetch all transactions for a given address.

        Args:
            address: Wallet/contract address to fetch transactions for
            chain_id: Blockchain chain ID (1 for Ethereum mainnet)
            mode: FetchMode.INCREMENTAL or FetchMode.FULL_REFRESH
            last_block_number: Starting block number for incremental mode
            return_full_objects: If True, return full transaction objects; if False, return only hashes. Default is True.

        Returns:
            List of transaction hashes or full transaction objects
        """
        logger.info(f"Starting transaction fetch for address: {address}")
        logger.info(f"Mode: {mode.value}")
        logger.info(f"Chain ID: {chain_id}")

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

        if return_full_objects:
            return all_transactions
        else:
            # Return only transaction hashes
            return [tx["hash"] for tx in all_transactions]

    async def get_all_transactions_full(
        self,
        address: str,
        chain_id: int,
        mode: FetchMode = FetchMode.FULL_REFRESH,
        last_block_number: Optional[int] = None,
    ) -> List[Dict]:
        """
        Fetch all full transaction objects for a given address.

        Args:
            address: Wallet/contract address to fetch transactions for
            chain_id: Blockchain chain ID (1 for Ethereum mainnet)
            mode: FetchMode.INCREMENTAL or FetchMode.FULL_REFRESH
            last_block_number: Starting block number for incremental mode

        Returns:
            List of enhanced transaction objects
        """
        return await self.get_all_transactions(
            address=address,
            chain_id=chain_id,
            mode=mode,
            last_block_number=last_block_number,
            return_full_objects=True,
        )

    def get_provider_info(self) -> Dict:
        """
        Get information about this provider.

        Returns:
            Dictionary with provider information
        """
        info = {
            "provider": "Etherscan",
            "api_version": "v2",
            "base_url": self.base_url,
            "max_transactions_per_request": self.max_transactions_per_request,
        }
        logger.debug(f"Provider info: {info}")
        return info

    async def get_contract_abi(self, address: str, chain_id: int) -> str:
        """
        Fetch contract ABI from Etherscan API.

        Args:
            address: Contract address
            chain_id: Blockchain chain ID (1 for Ethereum mainnet, 8453 for Base)

        Returns:
            Contract ABI as a JSON string, or empty JSON object string if not found
        """
        logger.info(f"Fetching ABI for contract {address} on chain {chain_id}")

        # Only Ethereum mainnet and Base are supported
        if chain_id not in [1, 8453]:
            logger.warning(f"Chain ID {chain_id} not supported for ABI fetching")
            return "{}"

        params = {
            "chainid": chain_id,
            "module": "contract",
            "action": "getabi",
            "address": address,
            "apikey": self.api_key,
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params) as response:
                    if response.status != 200:
                        logger.error(
                            f"API request failed with status {response.status}"
                        )
                        return "{}"

                    data = await response.json()

                    if data.get("status") == "1" and data.get("message") == "OK":
                        logger.info(f"Successfully fetched ABI for contract {address}")
                        return data.get("result", "{}")
                    else:
                        logger.warning(f"Etherscan API error: {data.get('message')}")
                        return "{}"
        except Exception as e:
            logger.error(f"Error fetching ABI from Etherscan: {e}")
            return "{}"
