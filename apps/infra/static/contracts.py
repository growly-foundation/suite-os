#!/usr/bin/env python3
"""
Static Contract Data

This module provides a reference list of known contract addresses across different chains.
Each contract has:
- chain_id: The blockchain ID (e.g., 1 for Ethereum mainnet)
- contract_address: The address of the contract
- name: A human-readable name for the contract
- category: The category of the contract (e.g., DEX, Lending)
"""

from config.logging_config import get_logger
from utils.blockchain import normalize_address_with_prefix

logger = get_logger(__name__)

# Dictionary of known contracts by chain_id and address
# TODO: It should be queryable from the database
KNOWN_CONTRACTS = {
    # Ethereum Mainnet (chain_id = 1)
    1: {},
    # Base (chain_id = 8453)
    8453: {
        # MCV2_Bond - normalized to lowercase
        "0xc5a076cad94176c2996b32d8466be1ce757faa27": {
            "name": "MCV2_Bond",
            "dapp": "MintClub",
            "category": "DeFi",
        },
        # MCV2_ZapV1 - normalized to lowercase
        "0x91523b39813f3f4e406ece406d0beaaa9de251fa": {
            "name": "MCV2_ZapV1",
            "dapp": "MintClub",
            "category": "DeFi",
        },
        # MCV2_Locker - already lowercase
        "0xa3dcf3ca587d9929d540868c924f208726dc9ab6": {
            "name": "MCV2_Locker",
            "dapp": "MintClub",
            "category": "DeFi",
        },
        # Aerodrome Router - normalized to lowercase
        "0x6cb442acf35158d5eda88fe602221b67b400be3e": {
            "name": "Router",
            "dapp": "Aerodrome",
            "category": "DEX",
        },
        # Morpho Bundler - normalized to lowercase
        "0x6bfd8137e702540e7a42b74178a4a49ba43920c4": {
            "name": "Bundler3",
            "dapp": "Morpho",
            "category": "Lending",
        },
        # Across Bridge - normalized to lowercase
        "0x09aea4b2242abc8bb4bb78d537a67a245a7bec64": {
            "name": "Base Spoke Pool Proxy",
            "dapp": "Across",
            "category": "Bridge",
        },
    },
}


def get_contract_info(chain_id, contract_address):
    """
    Get information about a known contract.

    Args:
        chain_id: Chain ID (e.g., 1 for Ethereum mainnet)
        contract_address: Contract address (lowercase)

    Returns:
        dict: Contract information or None if not found
    """
    try:
        if chain_id is None or contract_address is None:
            return None

        # Convert chain_id to int if it's a string
        if isinstance(chain_id, str):
            try:
                chain_id = int(chain_id)
            except (ValueError, TypeError):
                return None

        # Ensure contract_address is a string and lowercase
        if not isinstance(contract_address, str):
            return None

        contract_address = normalize_address_with_prefix(contract_address)

        # Get contracts for the chain
        chain_contracts = KNOWN_CONTRACTS.get(chain_id, {})

        # Return contract info or None
        contract_info = chain_contracts.get(contract_address)

        if contract_info:
            logger.info(
                f"Found contract info for {chain_id}:{contract_address} - {contract_info.get('name')}"
            )
            # Return a copy to prevent modification of the original
            return dict(contract_info)
        else:
            logger.debug(f"No contract info found for {chain_id}:{contract_address}")
            return None
    except Exception as e:
        # If anything goes wrong, return None
        logger.error(f"Error in get_contract_info: {e}")
        return None


def is_known_contract(chain_id, contract_address):
    """
    Check if a contract address is known.

    Args:
        chain_id: Chain ID (e.g., 1 for Ethereum mainnet)
        contract_address: Contract address (lowercase)

    Returns:
        bool: True if the contract is known, False otherwise
    """
    try:
        if chain_id is None or contract_address is None:
            return False

        # Convert chain_id to int if it's a string
        if isinstance(chain_id, str):
            try:
                chain_id = int(chain_id)
            except (ValueError, TypeError):
                return False

        # Ensure contract_address is a string and lowercase
        if not isinstance(contract_address, str):
            return False

        contract_address = normalize_address_with_prefix(contract_address)

        # Get contract info using the enhanced function
        contract_info = get_contract_info(chain_id, contract_address)
        is_known = contract_info is not None

        if is_known:
            logger.info(
                f"Contract {contract_address} is known: {contract_info.get('name')}"
            )
        else:
            logger.debug(f"Contract {contract_address} is not known")

        return is_known
    except Exception as e:
        # If anything goes wrong, return False
        logger.error(f"Error in is_known_contract: {e}")
        return False


def get_all_contracts(chain_id=None):
    """
    Get all known contracts for a specific chain or all chains.

    Args:
        chain_id: Chain ID to filter by, or None to get all contracts

    Returns:
        dict: Dictionary of contract addresses to contract info
    """
    if chain_id is not None:
        return KNOWN_CONTRACTS.get(chain_id, {})

    # Combine all contracts across chains
    all_contracts = {}
    for cid, contracts in KNOWN_CONTRACTS.items():
        for address, info in contracts.items():
            all_contracts[f"{cid}:{address}"] = {
                **info,
                "chain_id": cid,
                "contract_address": address,
            }

    return all_contracts
