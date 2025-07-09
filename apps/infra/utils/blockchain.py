#!/usr/bin/env python3
"""
Blockchain Utilities

This module provides utility functions for blockchain operations:
- Address validation
- Contract detection
- Timeframe conversion
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from config.logging_config import get_logger
from models import TimePeriod
from web3 import Web3

logger = get_logger(__name__)

ETH_NODE_URL = "https://eth.llamarpc.com"
BASE_NODE_URL = "https://base.llamarpc.com"

# Common blockchain address patterns
ETHEREUM_ADDRESS_PATTERN = re.compile(r"^0x[a-fA-F0-9]{40}$")


# Initialize web3 instances for different chains
def get_web3_for_chain(chain_id=8453):
    """
    Get a Web3 instance for the specified chain.

    Args:
        chain_id: Blockchain ID (default: 1 for Ethereum mainnet)

    Returns:
        Web3 instance for the specified chain
    """
    # Try to get from environment variables first
    env_rpc_url = os.getenv("WEB3_PROVIDER_URL")

    # Use chain-specific endpoints if environment variable not set
    if not env_rpc_url:
        if chain_id == 1:  # Ethereum Mainnet
            rpc_url = ETH_NODE_URL
        elif chain_id == 8453:  # Base
            rpc_url = BASE_NODE_URL
        else:
            # Default to the global BASE_NODE_URL
            rpc_url = BASE_NODE_URL
            logger.warning(
                f"No specific RPC URL for chain_id {chain_id}, using default"
            )
    else:
        rpc_url = env_rpc_url

    return Web3(Web3.HTTPProvider(rpc_url))


def is_valid_address(address: str, chain_id: int) -> bool:
    """
    Validate blockchain address format.

    Args:
        address: The address to validate
        chain_id: The blockchain ID (1=Ethereum, 8453=Base, etc.)

    Returns:
        bool: True if address is valid, False otherwise
    """
    if not address or not isinstance(address, str):
        return False

    # For Ethereum-compatible chains (Ethereum, Base, etc.)
    if chain_id in [1, 8453, 137, 42161, 10]:  # Common EVM chains
        return bool(ETHEREUM_ADDRESS_PATTERN.match(address))

    # Add other chain validations here as needed
    logger.warning(f"No validation implemented for chain_id: {chain_id}")
    return False


def is_contract_address(address, chain_id=8453):
    """
    Check if an address is a contract address.

    Args:
        address: The address to check
        chain_id: Chain ID (default: 8453 for Base)

    Returns:
        bool: True if address is a contract, False if EOA (user wallet)
    """
    try:
        # Get the appropriate Web3 instance for the chain
        w3 = get_web3_for_chain(chain_id)

        # Convert address to checksum format
        checksum_address = w3.to_checksum_address(address)

        # Get code at address - if empty, it's not a contract
        code = w3.eth.get_code(checksum_address)
        return len(code) > 0
    except Exception as e:
        logger.error(f"Error checking if address is contract: {e}")
        return False


def is_proxy_contract(address, abi_json=None, chain_id=8453):
    """
    Check if a contract is a proxy contract.

    Args:
        address: The contract address to check
        abi_json: Optional ABI JSON string for the contract
        chain_id: Chain ID (default: 8453 for Base)

    Returns:
        bool: True if the contract is a proxy, False otherwise
    """
    try:
        # Get the appropriate Web3 instance for the chain
        w3 = get_web3_for_chain(chain_id)

        # Convert address to checksum format
        checksum_address = w3.to_checksum_address(address)

        # Check if it's a contract first
        code = w3.eth.get_code(checksum_address)
        if len(code) == 0:
            logger.debug(f"Address {address} is not a contract")
            return False

        # Parse ABI if provided
        if abi_json:
            try:
                abi = json.loads(abi_json)

                # Check for common proxy patterns in the ABI
                proxy_functions = [
                    "implementation",
                    "getImplementation",
                    "upgradeTo",
                    "delegate",
                ]
                for item in abi:
                    if item.get("type") == "function":
                        if item.get("name") in proxy_functions:
                            logger.info(
                                f"Contract {address} identified as proxy via ABI function: {item.get('name')}"
                            )
                            return True
            except json.JSONDecodeError:
                logger.warning(f"Invalid ABI JSON for contract {address}")

        # Check for EIP-1967 proxy storage slot
        try:
            # EIP-1967 implementation slot
            slot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
            impl_address = w3.eth.get_storage_at(checksum_address, slot)
            # If the slot has a non-zero value, it might be a proxy
            if impl_address and int(impl_address.hex(), 16) != 0:
                logger.info(
                    f"Contract {address} identified as proxy via EIP-1967 storage slot"
                )
                return True
        except Exception as e:
            logger.debug(f"Error checking EIP-1967 storage slot: {e}")

        # Check for EIP-1822 proxy (UUPS)
        try:
            # EIP-1822 implementation slot
            slot = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
            impl_address = w3.eth.get_storage_at(checksum_address, slot)
            if impl_address and int(impl_address.hex(), 16) != 0:
                logger.info(
                    f"Contract {address} identified as proxy via EIP-1822 storage slot"
                )
                return True
        except Exception as e:
            logger.debug(f"Error checking EIP-1822 storage slot: {e}")

        return False
    except Exception as e:
        logger.error(f"Error checking if contract is proxy for {address}: {e}")
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


def get_time_filter_from_period(
    time_period: TimePeriod, end_time: datetime = None
) -> tuple[datetime, datetime]:
    """
    Convert a TimePeriod enum to a datetime range.

    This is the new recommended way to handle time filtering.

    Args:
        time_period: TimePeriod enum value
        end_time: End time for the range (defaults to now)

    Returns:
        tuple: (start_datetime, end_datetime)
    """
    return time_period.to_datetime_range(end_time)


def extract_block_range(
    transactions: List[Dict],
) -> Tuple[Optional[int], Optional[int]]:
    """
    Extract the minimum and maximum block numbers from a list of transactions.

    Args:
        transactions: List of transaction dictionaries

    Returns:
        Tuple[Optional[int], Optional[int]]: (lowest_block_number, highest_block_number)
                                            Returns (None, None) if no valid block numbers found
    """
    if not transactions:
        return None, None

    block_numbers = []
    for tx in transactions:
        try:
            block_num = int(tx.get("block_number", 0))
            if block_num > 0:  # Exclude invalid block numbers
                block_numbers.append(block_num)
        except (ValueError, TypeError):
            logger.warning(
                f"Invalid block number in transaction: {tx.get('block_number')}"
            )
            continue

    if not block_numbers:
        logger.warning("No valid block numbers found in transactions")
        return None, None

    lowest_block_number = min(block_numbers)
    highest_block_number = max(block_numbers)

    return lowest_block_number, highest_block_number
