#!/usr/bin/env python3
"""
Transactions Table Handler

This module provides functions for interacting with the transactions table:
- Loading transaction data
- Processing transactions
"""

import traceback

from config.logging_config import get_logger
from db.iceberg import (
    append_data,
    get_record_by_filter,
    load_table,
    overwrite_data,
    upsert_data,
)
from pipelines.raw.cursor import check_cursor_before_load

# Create a logger for this module
logger = get_logger(__name__)


def load_transactions_with_safety(
    catalog, database, chain_id, contract_address, data, load_type="append"
):
    """
    Load transaction data into the transactions table with safety checks.
    Always checks the cursor first, regardless of load type.

    Args:
        catalog: Iceberg catalog
        database: Database name
        chain_id: Blockchain chain ID
        contract_address: Contract address
        data: List of dictionaries containing the transaction data
        load_type: Type of load operation ("append", "overwrite", "upsert")

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Always check the cursor first as a safety measure
        last_block = check_cursor_before_load(
            catalog, database, chain_id, contract_address
        )
        logger.info(
            f"Safety check: Last processed block for {contract_address} was {last_block}"
        )

        # Load the transactions table
        table = load_table(catalog, database, "transactions")
        if not table:
            logger.error("Failed to load transactions table")
            return False

        # Get the schema
        schema = table.schema().as_arrow()

        # Perform the requested load operation
        if load_type == "overwrite":
            overwrite_data(table, data, schema)
        elif load_type == "upsert":
            upsert_data(
                table, data, schema, join_cols=["chain_id", "block_number", "hash"]
            )
        else:  # Default to append
            append_data(table, data, schema)

        return True
    except Exception as e:
        logger.error(f"Error loading transaction data: {e}")
        logger.debug(traceback.format_exc())
        return False


def get_transactions_by_contract(table, chain_id, contract_address):
    """
    Get all transactions for a specific contract address.

    Args:
        table: Iceberg transactions table
        chain_id: Blockchain chain ID
        contract_address: Contract address to get transactions for

    Returns:
        pandas.DataFrame: Filtered transactions or None if an error occurs
    """

    def filter_by_chain_and_contract(df):
        return df[
            (df["chain_id"] == chain_id)
            & (df["contract_address"] == contract_address.lower())
        ]

    try:
        # Get filtered transactions
        filtered = get_record_by_filter(table, filter_by_chain_and_contract)

        if filtered is not None:
            logger.info(f"Found {len(filtered)} transactions for {contract_address}")

        return filtered

    except Exception as e:
        logger.error(f"Error getting transactions: {e}")
        logger.debug(traceback.format_exc())
        return None
