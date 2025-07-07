#!/usr/bin/env python3
"""
Transactions Table Handler

This module provides functions for interacting with the transactions table:
- Loading transaction data with automatic duplicate detection
- Processing transactions with smart upsert/append logic
"""

import traceback

from config.logging_config import get_logger
from db.iceberg import (
    append_data,
    load_table,
    upsert_data,
)
from pipelines.raw.cursor import check_cursor_before_load, check_for_data_overlap
from utils.blockchain import extract_block_range

# Create a logger for this module
logger = get_logger(__name__)


def load_transactions_with_safety(
    catalog, database, chain_id, contract_address, data, force_upsert=False
):
    """
    Load transaction data into the transactions table with automatic overlap detection.

    This function automatically determines whether to use upsert or append based on:
    - Data overlap detection (prevents duplicates)
    - Performance considerations (append when safe)
    - Safety overrides (force_upsert for guaranteed deduplication)

    Args:
        catalog: Iceberg catalog
        database: Database name
        chain_id: Blockchain chain ID
        contract_address: Contract address
        data: List of dictionaries containing the transaction data
        force_upsert: If True, always use upsert regardless of overlap detection

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Always check the cursor first as a safety measure
        cursor_data = check_cursor_before_load(
            catalog, database, chain_id, contract_address
        )
        if cursor_data:
            start_block, end_block = cursor_data
            logger.info(
                f"Safety check: Existing coverage for {contract_address}: [{start_block}, {end_block}]"
            )
        else:
            logger.info(f"Safety check: No existing data for {contract_address}")

        # Load the transactions table
        table = load_table(catalog, database, "transactions")
        if not table:
            logger.error("Failed to load transactions table")
            return False

        # Get the schema
        schema = table.schema().as_arrow()

        # Determine the operation method
        should_upsert = force_upsert

        if not force_upsert and data:
            # Get block range from the new data
            try:
                lowest_block_number, highest_block_number = extract_block_range(data)
                if lowest_block_number is not None and highest_block_number is not None:
                    # Check for overlap with existing data
                    should_upsert = check_for_data_overlap(
                        catalog,
                        database,
                        chain_id,
                        contract_address,
                        lowest_block_number,
                        highest_block_number,
                    )
                else:
                    logger.warning("No valid block numbers found in data")
                    should_upsert = True  # Safe default
            except Exception as e:
                logger.warning(
                    f"Error analyzing block range: {e}, defaulting to upsert for safety"
                )
                should_upsert = True  # Safe default

        # Perform the operation
        if should_upsert:
            logger.info(
                f"Using UPSERT for {len(data)} transactions (duplicate prevention)"
            )
            upsert_data(
                table, data, schema, join_cols=["chain_id", "block_number", "hash"]
            )
        else:
            logger.info(
                f"Using APPEND for {len(data)} transactions (no overlap detected)"
            )
            append_data(table, data, schema)

        return True

    except Exception as e:
        logger.error(f"Error loading transaction data: {e}")
        logger.debug(traceback.format_exc())
        return False


def load_transactions_simple(catalog, database, data, operation="auto"):
    """
    Simple transaction loading function for cases where you want explicit control.

    Args:
        catalog: Iceberg catalog
        database: Database name
        data: List of dictionaries containing the transaction data
        operation: "auto" (smart detection), "upsert" (force upsert), "append" (force append)

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Load the transactions table
        table = load_table(catalog, database, "transactions")
        if not table:
            logger.error("Failed to load transactions table")
            return False

        # Get the schema
        schema = table.schema().as_arrow()

        # Perform the operation
        if operation == "upsert":
            logger.info(f"Force UPSERT for {len(data)} transactions")
            upsert_data(
                table, data, schema, join_cols=["chain_id", "block_number", "hash"]
            )
        elif operation == "append":
            logger.info(f"Force APPEND for {len(data)} transactions")
            append_data(table, data, schema)
        else:
            # Default to upsert for safety when no overlap detection available
            logger.info(
                f"Auto mode - using UPSERT for {len(data)} transactions (safe default)"
            )
            upsert_data(
                table, data, schema, join_cols=["chain_id", "block_number", "hash"]
            )

        return True

    except Exception as e:
        logger.error(f"Error loading transaction data: {e}")
        logger.debug(traceback.format_exc())
        return False
