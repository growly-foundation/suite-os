"""
Etherscan Contract Provider

Provider for contract-related Etherscan API operations.
Handles ABI fetching and other contract-specific data.
"""

from typing import Dict

import aiohttp
from config.logging_config import get_logger

from .base import EtherscanBaseProvider

# Create a logger for this module
logger = get_logger(__name__)


class EtherscanBlockProvider(EtherscanBaseProvider):
    """
    Block-specific provider for Etherscan API operations.

    Handles:
    - Contract blockNumber from timestamp
    """

    def __init__(self, api_key: str):
        """
        Initialize the contract provider.

        Args:
            api_key: Etherscan API key
        """
        super().__init__(api_key)

    def _get_block_params(
        self, chain_id: int, action: str, timestamp: int, **kwargs
    ) -> Dict:
        """
        Get parameters for contract module requests.

        Args:
            chain_id: Blockchain chain ID
            action: Block action (e.g., "getblocknobytime")
            timestamp: Timestamp in seconds

        Returns:
            Dictionary with block-specific parameters
        """
        base_params = self._get_base_params(chain_id, "block", action)

        block_params = {
            "timestamp": timestamp,
            "closest": "before",
            "apikey": self.api_key,
            **kwargs,
        }

        return {**base_params, **block_params}

    async def get_block_number_by_timestamp(self, timestamp: int, chain_id: int) -> str:
        """
        Fetch block number from Etherscan API.

        Args:
            timestamp: Timestamp in seconds
            chain_id: Blockchain chain ID (1 for Ethereum mainnet, 8453 for Base)

        Returns:
            Contract ABI as a JSON string, or empty JSON object string if not found
        """
        logger.info(
            f"Fetching block number for timestamp {timestamp} on chain {chain_id}"
        )

        if not self._validate_chain_id(chain_id):
            logger.warning(
                f"Chain ID {chain_id} not supported for block number fetching"
            )
            return "{}"

        params = self._get_block_params(
            chain_id=chain_id, action="getblocknobytime", timestamp=timestamp
        )

        try:
            async with aiohttp.ClientSession() as session:
                response = await self._make_request(session, params)

                if response.status == "1" and response.message == "OK":
                    logger.info(
                        f"Successfully fetched block number for timestamp {timestamp}"
                    )
                    return response.result or "{}"
                else:
                    logger.warning(f"Etherscan API error: {response.message}")
                    return "{}"

        except Exception as e:
            logger.error(f"Error fetching block number from Etherscan: {e}")
            return "{}"
