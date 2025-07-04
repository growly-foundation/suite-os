#!/usr/bin/env python3
"""
Blockchain Utilities

This module provides utility functions for blockchain operations:
- Address validation
- Contract detection
- Timeframe conversion
"""

import re
import os
from web3 import Web3
from datetime import datetime, timedelta
from utils.logging_config import get_logger

logger = get_logger(__name__)

# Get Ethereum node URL from environment variable or use a default value
ETH_NODE_URL = os.getenv("WEB3_PROVIDER_URL", "https://base.llamarpc.com")
web3 = Web3(Web3.HTTPProvider(ETH_NODE_URL))


def is_valid_address(address):
    """
    Check if an address is a valid Ethereum address.

    Args:
        address: The address to validate

    Returns:
        bool: True if address is valid, False otherwise
    """
    if not address:
        return False

    # Check if address has valid format
    return web3.is_address(address)


def is_contract_address(address, chain_id=1):
    """
    Check if an address is a contract address.

    Args:
        address: The address to check
        chain_id: Chain ID (default: 1 for Ethereum mainnet)

    Returns:
        bool: True if address is a contract, False if EOA (user wallet)
    """
    try:
        # Convert address to checksum format
        checksum_address = web3.to_checksum_address(address)

        # Get code at address - if empty, it's not a contract
        code = web3.eth.get_code(checksum_address)
        return len(code) > 0
    except Exception as e:
        logger.error(f"Error checking if address is contract: {e}")
        return False


def normalize_address(address):
    """
    Normalize an Ethereum address to lowercase without '0x' prefix.

    Args:
        address: The address to normalize

    Returns:
        str: Normalized address
    """
    if not address:
        return ""

    # Remove '0x' prefix if present and convert to lowercase
    if address.startswith("0x"):
        address = address[2:]

    return address.lower()


def normalize_address_with_prefix(address):
    """
    Normalize an Ethereum address to lowercase with '0x' prefix.
    This is useful for filtering in DataFrames where the original data has the 0x prefix.

    Args:
        address: The address to normalize

    Returns:
        str: Normalized address with 0x prefix
    """
    if not address:
        return ""

    # Convert to lowercase
    address = address.lower()

    # Ensure it has 0x prefix
    if not address.startswith("0x"):
        address = "0x" + address

    return address


def get_time_window_filter(time_window):
    """
    Convert a time window string to a datetime range.

    Args:
        time_window: String like '24h', '48h', '7d', '1w', '1m'

    Returns:
        tuple: (start_datetime, end_datetime) or (None, None) if invalid
    """
    if not time_window:
        return None, None

    # Regular expression to match time window format
    match = re.match(r"^(\d+)([hdwm])$", time_window)
    if not match:
        return None, None

    value = int(match.group(1))
    unit = match.group(2)

    end_time = datetime.now()

    if unit == "h":
        start_time = end_time - timedelta(hours=value)
    elif unit == "d":
        start_time = end_time - timedelta(days=value)
    elif unit == "w":
        start_time = end_time - timedelta(weeks=value)
    elif unit == "m":
        start_time = end_time - timedelta(days=value * 30)  # Approximation
    else:
        return None, None

    return start_time, end_time
