"""
Analytics Package

This package provides blockchain analytics functionality organized by entity type:
- wallet_analytics: Functions for analyzing wallet interactions
- contract_analytics: Functions for analyzing contract usage and interactions
- utils: Shared utilities and debugging functions
"""

# Import wallet analytics functions
from .wallet_analytics import get_wallet_contract_interactions

# Import contract analytics functions
from .contract_analytics import (
    get_contract_summary,
    get_contract_addresses_interactions,
    get_contract_function_interactions,
)

# Export all functions for easy access
__all__ = [
    # Wallet analytics
    "get_wallet_contract_interactions",
    # Contract analytics
    "get_contract_summary",
    "get_contract_addresses_interactions",
    "get_contract_function_interactions",
]
