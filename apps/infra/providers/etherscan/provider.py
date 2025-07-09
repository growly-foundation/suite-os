"""
Unified Etherscan Provider

A unified provider that combines all Etherscan API modules (account, contract, proxy)
and maintains backward compatibility with the original EtherscanProvider interface.
"""

from typing import Dict

from config.logging_config import get_logger

from .account import EtherscanAccountProvider
from .block import EtherscanBlockProvider
from .contract import EtherscanContractProvider
from .logs import EtherscanLogsProvider
from .proxy import EtherscanProxyProvider

# Create a logger for this module
logger = get_logger(__name__)


class EtherscanProvider:
    """
    Unified Etherscan provider that combines all API modules.

    This class provides backward compatibility with the original EtherscanProvider
    while leveraging the new modular architecture. It delegates operations to
    the appropriate specialized providers.
    """

    def __init__(self, api_key: str):
        """
        Initialize the unified Etherscan provider.

        Args:
            api_key: Etherscan API key
        """
        self.api_key = api_key

        # Initialize specialized providers
        self.account = EtherscanAccountProvider(api_key)
        self.contract = EtherscanContractProvider(api_key)
        self.proxy = EtherscanProxyProvider(api_key)
        self.block = EtherscanBlockProvider(api_key)
        self.logs = EtherscanLogsProvider(api_key)

        # Backward compatibility attributes
        self.base_url = self.account.base_url
        self.max_transactions_per_request = self.account.max_transactions_per_request

        logger.info("Initialized unified Etherscan provider")

    # Account module methods
    async def fetch_transaction_batch(self, *args, **kwargs):
        """Delegate to account provider."""
        return await self.account.fetch_transaction_batch(*args, **kwargs)

    async def get_all_transactions(self, *args, **kwargs):
        """Delegate to account provider."""
        return await self.account.get_all_transactions(*args, **kwargs)

    async def get_contract_abi(self, *args, **kwargs):
        """Delegate to contract provider."""
        return await self.contract.get_contract_abi(*args, **kwargs)

    async def get_logs_by_address(self, *args, **kwargs):
        """Delegate to logs provider."""
        return await self.logs.get_logs_by_address(*args, **kwargs)

    async def get_latest_block_number(self, *args, **kwargs):
        """Delegate to proxy provider."""
        return await self.proxy.get_latest_block_number(*args, **kwargs)

    async def get_block_number_by_timestamp(self, *args, **kwargs):
        """Delegate to block provider."""
        return await self.block.get_block_number_by_timestamp(*args, **kwargs)

    # Utility methods
    def _camel_to_snake(self, name: str) -> str:
        """Delegate to account provider."""
        return self.account._camel_to_snake(name)

    def _convert_keys_to_snake_case(self, data: Dict) -> Dict:
        """Delegate to account provider for backward compatibility."""
        return self.account._convert_keys_to_snake_case(data)

    def _enhance_transaction(self, tx: Dict, chain_id: int) -> Dict:
        """Delegate to account provider for backward compatibility."""
        return self.account._enhance_transaction(tx, chain_id)
