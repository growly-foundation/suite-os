"""
Etherscan Proxy Provider

Provider for proxy-related Etherscan API operations.
Handles blockchain data like block numbers, gas prices, and other network information.
"""

from typing import Dict, Optional

import aiohttp
from config.logging_config import get_logger

from .base import EtherscanBaseProvider

# Create a logger for this module
logger = get_logger(__name__)


class EtherscanProxyProvider(EtherscanBaseProvider):
    """
    Proxy-specific provider for Etherscan API operations.

    Handles:
    - Latest block number fetching (eth_blockNumber action)
    """

    def __init__(self, api_key: str):
        """
        Initialize the proxy provider.

        Args:
            api_key: Etherscan API key
        """
        super().__init__(api_key)

    def _get_proxy_params(self, chain_id: int, action: str, **kwargs) -> Dict:
        """
        Get parameters for proxy module requests.

        Args:
            chain_id: Blockchain chain ID
            action: Proxy action (e.g., "eth_blockNumber", "eth_gasPrice")
            **kwargs: Additional proxy-specific parameters

        Returns:
            Dictionary with proxy-specific parameters
        """
        base_params = self._get_base_params(chain_id, "proxy", action)

        # Add any additional proxy parameters
        proxy_params = {**kwargs}

        return {**base_params, **proxy_params}

    async def get_latest_block_number(self, chain_id: int) -> Optional[int]:
        """
        Fetch the latest block number from Etherscan API.

        Args:
            chain_id: Blockchain chain ID (1 for Ethereum mainnet, 8453 for Base)

        Returns:
            Latest block number as integer, or None if failed
        """
        logger.info(f"Fetching latest block number on chain {chain_id}")

        if not self._validate_chain_id(chain_id):
            logger.warning(
                f"Chain ID {chain_id} not supported for block number fetching"
            )
            return None

        params = self._get_proxy_params(chain_id=chain_id, action="eth_blockNumber")

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params) as response:
                    if response.status != 200:
                        logger.error(
                            f"API request failed with status {response.status}"
                        )
                        return None

                    data = await response.json()

                    if data.get("jsonrpc") == "2.0":
                        hex_result = data.get("result", "0x0")
                        block_number = int(hex_result, 16)
                        logger.info(f"Latest block number: {block_number}")
                        return block_number
                    else:
                        logger.warning(f"Etherscan API error: {data.get('result')}")
                        return None

        except Exception as e:
            logger.error(f"Error fetching latest block number from Etherscan: {e}")
            return None
