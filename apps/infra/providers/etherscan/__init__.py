"""
Etherscan Provider Package

This package provides modular access to Etherscan API operations with specialized providers
for different API modules and shared base functionality.
"""

from .account import EtherscanAccountProvider, TransactionBatch
from .base import EtherscanBaseProvider, EtherscanResponse
from models import FetchMode, TimePeriod
from .contract import EtherscanContractProvider
from .logs import EtherscanLogsProvider, LogsBatch
from .provider import EtherscanProvider
from .proxy import EtherscanProxyProvider
from ..models.etherscan import (
    EtherscanStatus,
    EtherscanTransaction,
    EtherscanProxyResponse,
    EtherscanLog,
    EtherscanApiResponse,
)

__all__ = [
    # Core providers
    "EtherscanProvider",
    "EtherscanAccountProvider",
    "EtherscanContractProvider",
    "EtherscanLogsProvider",
    "EtherscanProxyProvider",
    # Base classes and utilities
    "EtherscanBaseProvider",
    "EtherscanResponse",
    # Enums and data classes
    "FetchMode",
    "TimePeriod",
    "TransactionBatch",
    "LogsBatch",
    # Pydantic models
    "EtherscanStatus",
    "EtherscanTransaction",
    "EtherscanProxyResponse",
    "EtherscanLog",
    "EtherscanApiResponse",
]
