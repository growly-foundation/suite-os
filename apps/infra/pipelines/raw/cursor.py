#!/usr/bin/env python3
"""
Cursor Table Handler

This module provides functions for interacting with the cursor table:
- Getting the last processed block for a contract
- Updating the cursor position
- Safety checks
"""

import datetime
import traceback

from config.logging_config import get_logger
from db.iceberg import get_record_by_filter, load_table, update_or_insert_record

# Create a logger for this module
logger = get_logger(__name__)


def get_cursor(table, chain_id, contract_address):
    """
    Get the last processed block number for a specific contract address from the cursor table.

    Args:
        table: Iceberg cursor table
        chain_id: Blockchain chain ID
        contract_address: Contract address to get cursor for

    Returns:
        str: The last processed block number or None if not found
    """

    def filter_by_chain_and_contract(df):
        return df[
            (df["chain_id"] == chain_id)
            & (df["contract_address"] == contract_address.lower())
        ]

    try:
        # Get the filtered record
        filtered = get_record_by_filter(table, filter_by_chain_and_contract)

        if filtered is None:
            return None

        # Get the block_number
        block_number = filtered.iloc[0]["block_number"]
        logger.info(f"Last processed block number found: {block_number}")
        return block_number

    except Exception as e:
        logger.error(f"Error getting cursor: {e}")
        logger.debug(traceback.format_exc())
        return None


def update_cursor(catalog, database, chain_id, contract_address, block_number):
    """
    Update or insert the cursor for a specific contract address.

    Args:
        catalog: Iceberg catalog
        database: Database name
        chain_id: Blockchain chain ID
        contract_address: Contract address to update cursor for
        block_number: New block number to set

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Load the cursor table
        cursor_table = load_table(catalog, database, "cursor")
        if not cursor_table:
            logger.error("Failed to load cursor table")
            return False

        # Get current timestamp
        current_time = datetime.datetime.now()

        # Create cursor data
        cursor_data = [
            {
                "chain_id": chain_id,
                "contract_address": contract_address.lower(),
                "block_number": str(block_number),
                "updated_at": current_time,
            }
        ]

        # Get schema
        cursor_schema = cursor_table.schema().as_arrow()

        # Check if cursor exists function
        def cursor_exists(table):
            return get_cursor(table, chain_id, contract_address) is not None

        # Update or insert the record
        success = update_or_insert_record(
            cursor_table,
            cursor_data,
            cursor_schema,
            ["chain_id", "contract_address"],
            cursor_exists,
        )

        if success:
            logger.info(
                f"Cursor for chain_id={chain_id}, contract_address={contract_address} set to block_number={block_number}"
            )

        return success

    except Exception as e:
        logger.error(f"Error updating cursor: {e}")
        logger.debug(traceback.format_exc())
        return False


def check_cursor_before_load(catalog, database, chain_id, contract_address):
    """
    Check the cursor for a specific contract address before loading data.
    This is a safety check that should be called regardless of the load option.

    Args:
        catalog: Iceberg catalog
        database: Database name
        chain_id: Blockchain chain ID
        contract_address: Contract address to check cursor for

    Returns:
        str: The last processed block number or None if not found
    """
    try:
        # Load the cursor table
        cursor_table = load_table(catalog, database, "cursor")
        if not cursor_table:
            logger.error("Failed to load cursor table")
            return None

        # Get the cursor
        return get_cursor(cursor_table, chain_id, contract_address)
    except Exception as e:
        logger.error(f"Error checking cursor: {e}")
        logger.debug(traceback.format_exc())
        return None
