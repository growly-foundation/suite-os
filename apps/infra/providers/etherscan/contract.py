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


class EtherscanContractProvider(EtherscanBaseProvider):
    """
    Contract-specific provider for Etherscan API operations.

    Handles:
    - Contract ABI fetching (getabi action)
    """

    def __init__(self, api_key: str):
        """
        Initialize the contract provider.

        Args:
            api_key: Etherscan API key
        """
        super().__init__(api_key)

    def _get_contract_params(
        self, chain_id: int, action: str, address: str, **kwargs
    ) -> Dict:
        """
        Get parameters for contract module requests.

        Args:
            chain_id: Blockchain chain ID
            action: Contract action (e.g., "getabi", "getsourcecode")
            address: Contract address
            **kwargs: Additional contract-specific parameters

        Returns:
            Dictionary with contract-specific parameters
        """
        base_params = self._get_base_params(chain_id, "contract", action)

        contract_params = {"address": address, **kwargs}

        return {**base_params, **contract_params}

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

        if not self._validate_chain_id(chain_id):
            logger.warning(f"Chain ID {chain_id} not supported for ABI fetching")
            return "{}"

        params = self._get_contract_params(
            chain_id=chain_id, action="getabi", address=address
        )

        try:
            async with aiohttp.ClientSession() as session:
                response = await self._make_request(session, params)

                if response.status == "1" and response.message == "OK":
                    logger.info(f"Successfully fetched ABI for contract {address}")
                    return response.result or "{}"
                else:
                    logger.warning(f"Etherscan API error: {response.message}")
                    return "{}"

        except Exception as e:
            logger.error(f"Error fetching ABI from Etherscan: {e}")
            return "{}"
