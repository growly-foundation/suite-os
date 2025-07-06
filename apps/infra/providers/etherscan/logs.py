"""
Etherscan Logs Provider

Provider for logs-related Etherscan API operations.
Handles event log fetching, topic filtering, and address-specific log queries.
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
class LogsBatch:
    """Data class for logs batch results."""

    logs: List[Dict]
    last_block_number: int
    total_count: int


class EtherscanLogsProvider(EtherscanBaseProvider):
    """
    Logs-specific provider for Etherscan API operations.

    Handles:
    - Event logs by address (getLogs action)
    - Event logs by topics with filtering
    - Event logs by address with topic filtering
    - Pagination and result processing
    """

    def __init__(self, api_key: str):
        """
        Initialize the logs provider.

        Args:
            api_key: Etherscan API key
        """
        super().__init__(api_key)
        self.max_logs_per_request = 10000

    def _get_logs_params(
        self,
        chain_id: int,
        from_block: int,
        to_block: str = "latest",
        address: Optional[str] = None,
        topics: Optional[Dict[str, str]] = None,
        topic_operators: Optional[Dict[str, str]] = None,
        page: int = 1,
        offset: int = 10000,
    ) -> Dict:
        """
        Get parameters for logs module requests.

        Args:
            chain_id: Blockchain chain ID
            from_block: Starting block number
            to_block: Ending block number or "latest"
            address: Contract address to filter logs (optional)
            topics: Dictionary of topics to filter by (topic0, topic1, topic2, topic3)
            topic_operators: Dictionary of topic operators (topic0_1_opr, topic1_2_opr, etc.)
            page: Page number for pagination
            offset: Number of logs per page (max 10000)

        Returns:
            Dictionary with logs-specific parameters
        """
        base_params = self._get_base_params(chain_id, "logs", "getLogs")

        logs_params = {
            "fromBlock": from_block,
            "toBlock": to_block,
            "page": page,
            "offset": min(offset, self.max_logs_per_request),
        }

        # Add address filter if provided
        if address:
            logs_params["address"] = address

        # Add topic filters if provided
        if topics:
            for topic_key, topic_value in topics.items():
                if topic_key in ["topic0", "topic1", "topic2", "topic3"]:
                    logs_params[topic_key] = topic_value

        # Add topic operators if provided
        if topic_operators:
            for operator_key, operator_value in topic_operators.items():
                if operator_value in ["and", "or"]:
                    logs_params[operator_key] = operator_value

        return {**base_params, **logs_params}

    def _enhance_log(self, log: Dict, chain_id: int) -> Dict:
        """
        Add additional fields to a log object and convert keys to snake_case.

        Args:
            log: Raw log from Etherscan API
            chain_id: Blockchain chain ID

        Returns:
            Enhanced log with additional fields and snake_case keys
        """
        # Convert camelCase keys to snake_case
        enhanced_log = self._convert_keys_to_snake_case(log)

        # Add chain_id
        enhanced_log["chain_id"] = chain_id
        enhanced_log["block_number"] = int(enhanced_log["block_number"], 16)

        # Add block_time and block_date if timestamp exists
        if "timestamp" in enhanced_log:
            try:
                timestamp_unix = int(enhanced_log["timestamp"], 16)
                from datetime import datetime

                block_timestamp = datetime.fromtimestamp(timestamp_unix)
                enhanced_log["block_time"] = block_timestamp
                enhanced_log["block_date"] = block_timestamp.date()
            except (ValueError, OSError):
                pass  # Keep as None if conversion fails

        return enhanced_log

    async def fetch_logs_batch(
        self,
        session: aiohttp.ClientSession,
        chain_id: int,
        from_block: int,
        to_block: str = "latest",
        address: Optional[str] = None,
        topics: Optional[Dict[str, str]] = None,
        topic_operators: Optional[Dict[str, str]] = None,
        limit: int = 10000,
    ) -> LogsBatch:
        """
        Fetch a single batch of logs from Etherscan API.

        Args:
            session: aiohttp session for making requests
            chain_id: Blockchain chain ID
            from_block: Starting block number
            to_block: Ending block number or "latest"
            address: Contract address to filter logs (optional)
            topics: Dictionary of topics to filter by (optional)
            topic_operators: Dictionary of topic operators (optional)
            limit: Maximum number of logs to fetch

        Returns:
            LogsBatch containing logs and metadata
        """
        params = self._get_logs_params(
            chain_id=chain_id,
            from_block=from_block,
            to_block=to_block,
            address=address,
            topics=topics,
            topic_operators=topic_operators,
            page=1,  # Always use page 1 for block-based pagination
            offset=limit,
        )

        logger.debug(f"Requesting logs from block {from_block} to {to_block}")

        try:
            response = await self._make_request(session, params)

            if response.message == "No logs found":
                logger.info(f"No logs found from block {from_block}")
                return LogsBatch([], from_block, 0)

            logs = response.result or []
            logger.info(f"Received {len(logs)} logs from API")

            # Enhance each log with additional fields
            enhanced_logs = [self._enhance_log(log, chain_id) for log in logs]

            last_block = from_block
            if enhanced_logs:
                last_block = int(enhanced_logs[-1]["block_number"])
                logger.debug(f"Last block in batch: {last_block}")

            return LogsBatch(enhanced_logs, last_block, len(enhanced_logs))

        except Exception as e:
            logger.error(f"Error fetching logs batch: {e}")
            raise

    async def get_logs_by_address(
        self,
        chain_id: int,
        address: str,
        from_block: int,
        to_block: str = "latest",
        mode: FetchMode = FetchMode.FULL_REFRESH,
        last_block_number: Optional[int] = None,
    ) -> List[Dict]:
        """
        Get all event logs by contract address with automatic pagination.

        Args:
            chain_id: Blockchain chain ID (1 for Ethereum mainnet, 8453 for Base)
            address: Contract address to check for logs
            from_block: Starting block number
            to_block: Ending block number or "latest"
            mode: FetchMode.INCREMENTAL or FetchMode.FULL_REFRESH
            last_block_number: Starting block number for incremental mode

        Returns:
            List of enhanced log dictionaries

        Raises:
            ValueError: If chain_id is not supported
            Exception: If API request fails
        """
        if not self._validate_chain_id(chain_id):
            raise ValueError(f"Unsupported chain ID: {chain_id}")

        logger.info(f"Starting logs fetch for address: {address}")
        logger.info(f"Mode: {mode.value}")
        logger.info(f"Chain ID: {chain_id}")

        # Determine starting block
        if mode == FetchMode.INCREMENTAL and last_block_number is not None:
            next_block = last_block_number + 1
            logger.info(f"Starting from block: {next_block} (incremental mode)")
        else:
            next_block = from_block
            logger.info(f"Starting from block: {next_block} (full refresh mode)")

        all_logs = []

        async with aiohttp.ClientSession() as session:
            batch_count = 0

            while True:
                logger.info(
                    f"Fetching batch {batch_count + 1} starting from block {next_block}"
                )

                try:
                    batch = await self.fetch_logs_batch(
                        session=session,
                        chain_id=chain_id,
                        from_block=next_block,
                        to_block=to_block,
                        address=address,
                        limit=self.max_logs_per_request,
                    )

                    if not batch.logs:
                        logger.info("No more logs found. Fetching complete.")
                        break

                    all_logs.extend(batch.logs)
                    batch_count += 1

                    logger.info(
                        f"Batch {batch_count}: Found {batch.total_count} logs, "
                        f"up to block {batch.last_block_number}"
                    )

                    # If we got fewer than max logs, we've reached the end
                    if batch.total_count < self.max_logs_per_request:
                        logger.info(
                            f"Last batch (less than {self.max_logs_per_request} logs). "
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

        total_logs = len(all_logs)
        logger.info(f"Fetching complete! Total logs: {total_logs}")

        return all_logs

    async def get_logs_by_topics(
        self,
        chain_id: int,
        from_block: int,
        to_block: str = "latest",
        topics: Dict[str, str] = None,
        topic_operators: Optional[Dict[str, str]] = None,
        mode: FetchMode = FetchMode.FULL_REFRESH,
        last_block_number: Optional[int] = None,
    ) -> List[Dict]:
        """
        Get all event logs filtered by topics with automatic pagination.

        Args:
            chain_id: Blockchain chain ID (1 for Ethereum mainnet, 8453 for Base)
            from_block: Starting block number
            to_block: Ending block number or "latest"
            topics: Dictionary of topics to filter by (e.g., {"topic0": "0xabc...", "topic1": "0xdef..."})
            topic_operators: Dictionary of topic operators (e.g., {"topic0_1_opr": "and", "topic1_2_opr": "or"})
            mode: FetchMode.INCREMENTAL or FetchMode.FULL_REFRESH
            last_block_number: Starting block number for incremental mode

        Returns:
            List of enhanced log dictionaries

        Raises:
            ValueError: If chain_id is not supported or invalid topic operators
            Exception: If API request fails
        """
        if not self._validate_chain_id(chain_id):
            raise ValueError(f"Unsupported chain ID: {chain_id}")

        if not topics:
            raise ValueError("Topics must be provided for topic-based log fetching")

        # Validate topic operators if provided
        if topic_operators:
            valid_operators = ["and", "or"]
            for operator_key, operator_value in topic_operators.items():
                if operator_value not in valid_operators:
                    raise ValueError(
                        f"Invalid topic operator '{operator_value}'. Must be one of: {valid_operators}"
                    )

        logger.info(f"Starting logs fetch by topics")
        logger.info(f"Mode: {mode.value}")
        logger.info(f"Chain ID: {chain_id}")
        logger.info(f"Topics: {topics}")

        # Determine starting block
        if mode == FetchMode.INCREMENTAL and last_block_number is not None:
            next_block = last_block_number + 1
            logger.info(f"Starting from block: {next_block} (incremental mode)")
        else:
            next_block = from_block
            logger.info(f"Starting from block: {next_block} (full refresh mode)")

        all_logs = []

        async with aiohttp.ClientSession() as session:
            batch_count = 0

            while True:
                logger.info(
                    f"Fetching batch {batch_count + 1} starting from block {next_block}"
                )

                try:
                    batch = await self.fetch_logs_batch(
                        session=session,
                        chain_id=chain_id,
                        from_block=next_block,
                        to_block=to_block,
                        topics=topics,
                        topic_operators=topic_operators,
                        limit=self.max_logs_per_request,
                    )

                    if not batch.logs:
                        logger.info("No more logs found. Fetching complete.")
                        break

                    all_logs.extend(batch.logs)
                    batch_count += 1

                    logger.info(
                        f"Batch {batch_count}: Found {batch.total_count} logs, "
                        f"up to block {batch.last_block_number}"
                    )

                    # If we got fewer than max logs, we've reached the end
                    if batch.total_count < self.max_logs_per_request:
                        logger.info(
                            f"Last batch (less than {self.max_logs_per_request} logs). "
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

        total_logs = len(all_logs)
        logger.info(f"Fetching complete! Total logs: {total_logs}")

        return all_logs

    async def get_logs_by_address_and_topics(
        self,
        chain_id: int,
        address: str,
        from_block: int,
        to_block: str = "latest",
        topics: Dict[str, str] = None,
        topic_operators: Optional[Dict[str, str]] = None,
        mode: FetchMode = FetchMode.FULL_REFRESH,
        last_block_number: Optional[int] = None,
    ) -> List[Dict]:
        """
        Get all event logs by address filtered by topics with automatic pagination.

        Args:
            chain_id: Blockchain chain ID (1 for Ethereum mainnet, 8453 for Base)
            address: Contract address to check for logs
            from_block: Starting block number
            to_block: Ending block number or "latest"
            topics: Dictionary of topics to filter by (e.g., {"topic0": "0xabc...", "topic1": "0xdef..."})
            topic_operators: Dictionary of topic operators (e.g., {"topic0_1_opr": "and", "topic1_2_opr": "or"})
            mode: FetchMode.INCREMENTAL or FetchMode.FULL_REFRESH
            last_block_number: Starting block number for incremental mode

        Returns:
            List of enhanced log dictionaries

        Raises:
            ValueError: If chain_id is not supported or invalid topic operators
            Exception: If API request fails
        """
        if not self._validate_chain_id(chain_id):
            raise ValueError(f"Unsupported chain ID: {chain_id}")

        if not topics:
            raise ValueError("Topics must be provided for topic-based log fetching")

        # Validate topic operators if provided
        if topic_operators:
            valid_operators = ["and", "or"]
            for operator_key, operator_value in topic_operators.items():
                if operator_value not in valid_operators:
                    raise ValueError(
                        f"Invalid topic operator '{operator_value}'. Must be one of: {valid_operators}"
                    )

        logger.info(f"Starting logs fetch for address {address} with topic filters")
        logger.info(f"Mode: {mode.value}")
        logger.info(f"Chain ID: {chain_id}")
        logger.info(f"Topics: {topics}")

        # Determine starting block
        if mode == FetchMode.INCREMENTAL and last_block_number is not None:
            next_block = last_block_number + 1
            logger.info(f"Starting from block: {next_block} (incremental mode)")
        else:
            next_block = from_block
            logger.info(f"Starting from block: {next_block} (full refresh mode)")

        all_logs = []

        async with aiohttp.ClientSession() as session:
            batch_count = 0

            while True:
                logger.info(
                    f"Fetching batch {batch_count + 1} starting from block {next_block}"
                )

                try:
                    batch = await self.fetch_logs_batch(
                        session=session,
                        chain_id=chain_id,
                        from_block=next_block,
                        to_block=to_block,
                        address=address,
                        topics=topics,
                        topic_operators=topic_operators,
                        limit=self.max_logs_per_request,
                    )

                    if not batch.logs:
                        logger.info("No more logs found. Fetching complete.")
                        break

                    all_logs.extend(batch.logs)
                    batch_count += 1

                    logger.info(
                        f"Batch {batch_count}: Found {batch.total_count} logs, "
                        f"up to block {batch.last_block_number}"
                    )

                    # If we got fewer than max logs, we've reached the end
                    if batch.total_count < self.max_logs_per_request:
                        logger.info(
                            f"Last batch (less than {self.max_logs_per_request} logs). "
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

        total_logs = len(all_logs)
        logger.info(f"Fetching complete! Total logs: {total_logs}")

        return all_logs
