#!/usr/bin/env python3
"""
Cursor Table Handler

This module provides functions for interacting with the cursor table:
- Getting the last processed block for a contract
- Updating the cursor position
- Safety checks
"""

import os
import traceback
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from config.logging_config import get_logger
from db.iceberg import get_record_by_filter, load_table, update_or_insert_record
from models import TimePeriod

# Create a logger for this module
logger = get_logger(__name__)


def get_cursor(table, chain_id, contract_address) -> Optional[Tuple[str, str]]:
    """
    Get the last processed block range for a specific contract address from the cursor table.

    Args:
        table: Iceberg cursor table
        chain_id: Blockchain chain ID
        contract_address: Contract address to get cursor for

    Returns:
        Tuple[str, str]: (start_block, end_block) or None if not found
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

        # Get the start_block and end_block
        start_block = filtered.iloc[0]["start_block"]
        end_block = filtered.iloc[0]["end_block"]
        logger.info(
            f"Cursor found - start_block: {start_block}, end_block: {end_block}"
        )
        return (start_block, end_block)

    except Exception as e:
        logger.error(f"Error getting cursor: {e}")
        logger.debug(traceback.format_exc())
        return None


def get_last_end_block(table, chain_id, contract_address) -> Optional[str]:
    """
    Get only the last processed end block for backward compatibility.

    Args:
        table: Iceberg cursor table
        chain_id: Blockchain chain ID
        contract_address: Contract address to get cursor for

    Returns:
        str: The last processed end block number or None if not found
    """
    cursor_data = get_cursor(table, chain_id, contract_address)
    if cursor_data:
        return cursor_data[1]  # Return end_block
    return None


async def update_cursor(
    catalog, database, chain_id, contract_address, end_block, start_block=None
):
    """
    Update or insert the cursor for a specific contract address.

    The start_block represents the minimum block of lifetime coverage (earliest data we have),
    not just the start of the current operation.

    Args:
        catalog: Iceberg catalog
        database: Database name
        chain_id: Blockchain chain ID
        contract_address: Contract address to update cursor for
        end_block: New end block number to set (highest block processed in this operation)
        start_block: Start block of current operation (optional, used to determine lifetime min)

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Load the cursor table
        cursor_table = load_table(catalog, database, "cursor")
        if not cursor_table:
            logger.error("Failed to load cursor table")
            return False

        # Get existing cursor to determine lifetime minimum start_block
        existing_cursor = get_cursor(cursor_table, chain_id, contract_address)

        if existing_cursor:
            existing_start_block, _ = existing_cursor

            # Determine the lifetime minimum start_block
            if start_block is not None:
                # Compare current operation start_block with existing lifetime minimum
                lifetime_min_start = str(
                    min(int(existing_start_block), int(start_block))
                )
                logger.info(
                    f"Comparing start blocks - existing: {existing_start_block}, "
                    f"current: {start_block}, lifetime min: {lifetime_min_start}"
                )
            else:
                # No start_block provided, keep existing lifetime minimum
                lifetime_min_start = existing_start_block
                logger.info(
                    f"No start_block provided, keeping existing lifetime minimum: {lifetime_min_start}"
                )

        else:
            # No existing cursor - this is the first operation
            if start_block is not None:
                lifetime_min_start = str(start_block)
                logger.info(
                    f"First operation for this contract, setting lifetime start_block to: {lifetime_min_start}"
                )
            else:
                # Default to genesis if no start_block provided for first operation
                lifetime_min_start = "0"
                logger.info(
                    f"First operation with no start_block provided, defaulting to genesis: {lifetime_min_start}"
                )

        # Get current timestamp
        current_time = datetime.now()

        # Create cursor data
        cursor_data = [
            {
                "chain_id": chain_id,
                "contract_address": contract_address.lower(),
                "start_block": lifetime_min_start,
                "end_block": str(end_block),
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
                f"Cursor for chain_id={chain_id}, contract_address={contract_address} "
                f"updated - lifetime_start_block={lifetime_min_start}, end_block={end_block}"
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
        Tuple[str, str]: (start_block, end_block) or None if not found
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


def check_for_data_overlap(
    catalog, database, chain_id, contract_address, new_start_block, new_end_block
):
    """
    Check if new data will overlap with existing data coverage.

    This is used to determine if we need upsert (overlap) vs append (no overlap).

    Args:
        catalog: Iceberg catalog
        database: Database name
        chain_id: Blockchain chain ID
        contract_address: Contract address to check
        new_start_block: Start block of new data being fetched
        new_end_block: End block of new data being fetched

    Returns:
        bool: True if overlap detected (need upsert), False if no overlap (can append)
    """
    try:
        # Get existing cursor coverage
        cursor_data = check_cursor_before_load(
            catalog, database, chain_id, contract_address
        )

        if not cursor_data:
            # No existing data, no overlap possible
            logger.info(f"No existing data for {contract_address}, no overlap")
            return False

        existing_start_block, existing_end_block = cursor_data

        # Convert to integers for comparison
        try:
            existing_start = int(existing_start_block)
            existing_end = int(existing_end_block)
            new_start = int(new_start_block)
            new_end = int(new_end_block)
        except (ValueError, TypeError):
            logger.warning(
                "Invalid block numbers for overlap check, defaulting to upsert for safety"
            )
            return True  # Default to upsert for safety

        # Check for overlap
        # Overlap occurs if: new_start <= existing_end AND new_end >= existing_start
        overlap = new_start <= existing_end and new_end >= existing_start

        if overlap:
            logger.info(
                f"Data overlap detected for {contract_address}: "
                f"existing range [{existing_start}, {existing_end}], "
                f"new range [{new_start}, {new_end}] - will use upsert"
            )
        else:
            logger.info(
                f"No data overlap for {contract_address}: "
                f"existing range [{existing_start}, {existing_end}], "
                f"new range [{new_start}, {new_end}] - can use append"
            )

        return overlap

    except Exception as e:
        logger.error(f"Error checking for data overlap: {e}")
        logger.debug(traceback.format_exc())
        # Default to upsert for safety when we can't determine overlap
        return True


async def calculate_time_based_start_block(
    chain_id: int, time_period: TimePeriod, context: str = "operation"
) -> str:
    """
    Calculate the starting block number for time-based fetch modes.

    Args:
        chain_id: Blockchain chain ID
        time_period: TimePeriod enum specifying how far back to look
        context: Context string for logging (e.g., "Task task_id", "ETL operation")

    Returns:
        Block number from the specified time period ago as string, or "0" if calculation fails
    """
    try:
        # Calculate timestamp for the specified period ago
        period_ago = datetime.now(timezone.utc) - timedelta(days=time_period.days)
        timestamp_period_ago = int(period_ago.timestamp())

        logger.info(
            f"{context}: Calculating time-based start_block for {time_period.value} "
            f"({time_period.days} days ago) - timestamp {timestamp_period_ago}"
        )

        # Get API key and create provider
        etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
        if not etherscan_api_key:
            logger.error(
                f"{context}: ETHERSCAN_API_KEY not set, falling back to genesis block"
            )
            return "0"

        # Import here to avoid circular imports
        from providers.etherscan import EtherscanProvider

        provider = EtherscanProvider(api_key=etherscan_api_key)
        block_number_str = await provider.block.get_block_number_by_timestamp(
            timestamp_period_ago, chain_id
        )

        # Convert to string
        if block_number_str and block_number_str != "{}":
            logger.info(
                f"{context}: Time-based start_block calculated for {time_period.value}: {block_number_str}"
            )
            return str(block_number_str)
        else:
            logger.warning(
                f"{context}: Could not determine block number for {time_period.value} ago, using genesis"
            )
            return "0"

    except Exception as e:
        logger.error(f"{context}: Error calculating time-based start block: {e}")
        logger.info(f"{context}: Falling back to genesis block")
        return "0"
