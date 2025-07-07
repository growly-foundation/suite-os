#!/usr/bin/env python3
"""
Apache Iceberg Table Operations with AWS Integration

This script demonstrates how to:
1. Connect to AWS Glue Iceberg tables using PyIceberg
2. Fetch Ethereum transaction data from Etherscan
3. Convert and append data to Iceberg tables
4. Read data from Iceberg tables

Usage:
    python main.py <wallet_address> [--chain-id CHAIN_ID] [--mode {full,incremental,time_range}]
                  [--time-period {1d,3d,7d,14d,30d,90d}] [--no-read] [--catalog CATALOG] [--bucket BUCKET]
                  [--database DATABASE] [--table TABLE] [--region REGION]

Example:
    python main.py 0x55Fce96D44c96Ef27f296aEB37aD0eb360505015 --chain-id 1 --mode full

Requirements:
- AWS credentials configured
- ETHERSCAN_API_KEY environment variable set
"""

import argparse
import asyncio
import os
import sys
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

# Add parent directory to path when script is run directly
if __name__ == "__main__":
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sys.path.insert(0, parent_dir)

from config.aws_config import initialize_catalog
from config.logging_config import get_logger
from db.iceberg import (
    load_table,
    read_table_data,
    reorder_records,
)
from dotenv import load_dotenv
from pipelines.raw.cursor import (
    get_cursor,
    update_cursor,
    calculate_time_based_start_block,
)
from pipelines.raw.transactions import load_transactions_with_safety
from providers.etherscan import EtherscanProvider, FetchMode, TimePeriod
from utils.blockchain import extract_block_range

# Create a logger for this module
logger = get_logger(__name__)

# Load environment variables
load_dotenv()

# Default AWS Configuration
DEFAULT_REGION = "ap-southeast-1"
DEFAULT_CATALOG = "s3tablescatalog"
DEFAULT_TABLE_BUCKET = "suite"
DEFAULT_DATABASE = "raw"
DEFAULT_TABLE_NAME = "transactions"


@dataclass
class ETLResources:
    """Container for ETL resources."""

    catalog: Optional[Any] = None
    table: Optional[Any] = None
    schema: Optional[Any] = None
    cursor_table: Optional[Any] = None


@dataclass
class FetchConfig:
    """Configuration for transaction fetching."""

    mode: FetchMode
    last_block_number: Optional[int] = None
    time_period: Optional[TimePeriod] = None


def valid_ethereum_address(address: str) -> str:
    """Validate Ethereum address format."""
    if not address.startswith("0x"):
        raise argparse.ArgumentTypeError("Address must start with '0x'")
    if len(address) != 42:
        raise argparse.ArgumentTypeError("Address must be 42 characters long")
    try:
        int(address[2:], 16)
    except ValueError:
        raise argparse.ArgumentTypeError(
            "Address must contain only hexadecimal characters"
        )
    return address.lower()


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Fetch Ethereum transaction data and store in Iceberg tables"
    )

    # Required arguments
    parser.add_argument(
        "wallet_address",
        type=valid_ethereum_address,
        help="Ethereum wallet address to fetch transactions for",
    )

    # Optional arguments
    parser.add_argument(
        "--chain-id",
        type=int,
        default=8453,
        help="Blockchain chain ID (default: 8453 for Base mainnet)",
    )
    parser.add_argument(
        "--mode",
        choices=["full", "incremental", "time_range"],
        default="incremental",
        help="Fetch mode: full refresh, incremental, or time_range (default: incremental)",
    )
    parser.add_argument(
        "--time-period",
        choices=["1d", "3d", "7d", "14d", "30d", "90d"],
        default="7d",
        help="Time period for time_range mode (default: 7d)",
    )
    parser.add_argument(
        "--no-read", action="store_true", help="Skip reading table data after append"
    )
    parser.add_argument(
        "--read-only",
        action="store_true",
        help="Only fetch and display data without writing to Iceberg",
    )

    # AWS configuration
    parser.add_argument(
        "--catalog",
        default=DEFAULT_CATALOG,
        help=f"AWS Glue catalog name (default: {DEFAULT_CATALOG})",
    )
    parser.add_argument(
        "--bucket",
        default=DEFAULT_TABLE_BUCKET,
        help=f"S3 bucket name (default: {DEFAULT_TABLE_BUCKET})",
    )
    parser.add_argument(
        "--database",
        default=DEFAULT_DATABASE,
        help=f"Database name (default: {DEFAULT_DATABASE})",
    )
    parser.add_argument(
        "--table",
        default=DEFAULT_TABLE_NAME,
        help=f"Table name (default: {DEFAULT_TABLE_NAME})",
    )
    parser.add_argument(
        "--region",
        default=DEFAULT_REGION,
        help=f"AWS region (default: {DEFAULT_REGION})",
    )

    return parser.parse_args()


def initialize_resources(args) -> Optional[ETLResources]:
    """
    Initialize AWS resources including catalog, table, and cursor table.

    Args:
        args: Parsed command line arguments

    Returns:
        ETLResources object or None if initialization fails
    """
    if args.read_only:
        logger.info("Running in read-only mode, skipping AWS resource initialization")
        return ETLResources()

    logger.info(f"Initializing catalog: {args.catalog}")
    catalog = initialize_catalog(args.catalog, args.bucket, args.region)
    if not catalog:
        logger.error("Failed to initialize catalog")
        return None

    # Load the main table
    logger.info(f"Loading table: {args.database}.{args.table}")
    table = load_table(catalog, args.database, args.table)
    if not table:
        logger.error("Failed to load table")
        return None

    schema = table.schema()

    # Load the cursor table for incremental mode
    cursor_table = None
    if args.mode == "incremental":
        logger.info("Loading cursor table for incremental mode")
        cursor_table = load_table(catalog, args.database, "cursor")
        if not cursor_table:
            logger.warning(
                "Failed to load cursor table. Will fall back to full refresh mode."
            )

    return ETLResources(
        catalog=catalog, table=table, schema=schema, cursor_table=cursor_table
    )


def determine_fetch_mode(
    args, resources: ETLResources, wallet_address: str, chain_id: int
) -> FetchConfig:
    """
    Determine the fetch mode and last block number based on arguments and available data.

    Args:
        args: Parsed command line arguments
        resources: ETL resources
        wallet_address: Wallet address to check
        chain_id: Blockchain chain ID

    Returns:
        FetchConfig object with mode and last block number
    """
    # Start with the requested mode
    if args.mode == "full":
        mode = FetchMode.FULL_REFRESH
    elif args.mode == "time_range":
        mode = FetchMode.TIME_RANGE
    else:
        mode = FetchMode.INCREMENTAL

    last_block_number = None
    time_period = None

    # For time_range mode, get the time period
    if mode == FetchMode.TIME_RANGE:
        time_period = TimePeriod.from_string(args.time_period)
        logger.info(f"Using time-range mode ({time_period.value})")

    # For incremental mode, try to get the last block number
    if mode == FetchMode.INCREMENTAL and not args.read_only:
        if resources.cursor_table is None:
            logger.warning(
                "No cursor table available, falling back to full refresh mode"
            )
            mode = FetchMode.FULL_REFRESH
        else:
            logger.info(f"Getting last block number for {wallet_address}")
            cursor_data = get_cursor(resources.cursor_table, chain_id, wallet_address)

            if cursor_data is not None:
                try:
                    # cursor_data is now a tuple (start_block, end_block)
                    start_block, end_block = cursor_data
                    last_block_number = int(end_block)
                    logger.info(
                        f"Found cursor - start_block: {start_block}, end_block: {end_block}"
                    )
                except (ValueError, TypeError):
                    logger.warning(f"Invalid block number in cursor: {cursor_data}")
                    last_block_number = None

            if last_block_number is None:
                logger.warning(
                    "Could not determine last block number for incremental mode"
                )
                logger.info("Falling back to full refresh mode")
                mode = FetchMode.FULL_REFRESH

    return FetchConfig(
        mode=mode, last_block_number=last_block_number, time_period=time_period
    )


async def fetch_transactions(
    wallet_address: str, chain_id: int, fetch_config: FetchConfig
) -> Tuple[List[Dict[str, Any]], Optional[int]]:
    """
    Fetch Ethereum transaction data from Etherscan.

    Args:
        wallet_address: Wallet address to fetch transactions for
        chain_id: Blockchain chain ID
        fetch_config: Fetch configuration

    Returns:
        Tuple of (transactions list, highest block number)
    """
    # Validate API key
    etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
    if not etherscan_api_key:
        logger.error("ETHERSCAN_API_KEY environment variable not set")
        raise ValueError("ETHERSCAN_API_KEY environment variable not set")

    # Log fetch details
    logger.info(f"Fetching Ethereum transaction data for {wallet_address}")
    logger.info(f"Chain ID: {chain_id}")
    logger.info(f"Mode: {fetch_config.mode.value}")
    if (
        fetch_config.mode == FetchMode.INCREMENTAL
        and fetch_config.last_block_number is not None
    ):
        logger.info(f"Starting from block: {fetch_config.last_block_number}")
    elif fetch_config.mode == FetchMode.TIME_RANGE and fetch_config.time_period:
        logger.info(f"Time period: {fetch_config.time_period.value}")

    # Fetch transactions
    etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)
    transactions = await etherscan_provider.get_all_transactions(
        address=wallet_address,
        chain_id=chain_id,
        mode=fetch_config.mode,
        last_block_number=fetch_config.last_block_number,
        time_period=fetch_config.time_period,
    )

    if not transactions:
        logger.info("No transactions found")
        return [], None

    logger.info(f"Retrieved {len(transactions)} transactions")

    # Get the highest block number from the transactions
    highest_block_number = None
    if transactions:
        lowest_block_number, highest_block_number = extract_block_range(transactions)
        if highest_block_number is not None:
            logger.info(f"Highest block number in transactions: {highest_block_number}")
        else:
            logger.error("No valid block numbers found in transactions")

    return transactions, highest_block_number


def display_read_only_data(transactions: List[Dict[str, Any]]) -> None:
    """
    Display sample transaction data in read-only mode.

    Args:
        transactions: List of transaction dictionaries
    """
    logger.info("Running in read-only mode")
    logger.info("Sample transaction data (last 5 transactions):")

    for i, tx in enumerate(transactions[-5:]):
        logger.info(f"Transaction {i+1}:")
        for key, value in tx.items():
            logger.debug(f"  {key}: {value}")

    logger.info(f"Total transactions: {len(transactions)}")
    logger.info("Read-only mode: Data not written to Iceberg table")


async def process_transactions(
    transactions: List[Dict[str, Any]],
    highest_block_number: Optional[int],
    resources: ETLResources,
    args,
    wallet_address: str,
    fetch_config: FetchConfig,
) -> None:
    """
    Process and write transactions to Iceberg table.

    Args:
        transactions: List of transaction dictionaries
        highest_block_number: Highest block number in transactions
        resources: ETL resources
        args: Parsed command line arguments
        wallet_address: Wallet address
        fetch_config: Fetch configuration with mode and time period
    """
    # Get block range for logging
    lowest_block_number = None
    if transactions and highest_block_number is not None:
        try:
            lowest_block_number, _ = extract_block_range(transactions)
            if lowest_block_number is not None:
                logger.info(
                    f"Processing block range: {lowest_block_number} to {highest_block_number}"
                )
        except Exception as e:
            logger.error(f"Error determining block range: {e}")

    # Process and insert data using consolidated safety function
    logger.info(f"Processing {len(transactions)} transactions...")
    processed_transactions = reorder_records(transactions, resources.schema)

    # Use the consolidated function with automatic overlap detection
    success = load_transactions_with_safety(
        resources.catalog,
        args.database,
        args.chain_id,
        wallet_address,
        processed_transactions,
    )

    if not success:
        logger.error("Failed to load transaction data")
        return

    # Update cursor with the highest block number
    if highest_block_number is not None:
        logger.info(f"Updating cursor with block number: {highest_block_number}")

        # Calculate start_block based on fetch mode
        start_block = None
        if args.mode == "full":
            start_block = "0"  # From genesis
        elif args.mode == "time_range":
            # Calculate time-based start block using the new flexible function
            time_period = fetch_config.time_period or TimePeriod.DAYS_7
            start_block = await calculate_time_based_start_block(
                args.chain_id, time_period, "ETL script"
            )
        # For incremental mode, let update_cursor use previous end_block as start_block

        await update_cursor(
            resources.catalog,
            args.database,
            args.chain_id,
            wallet_address,
            highest_block_number,
            start_block=start_block,
        )

    # Read and print table data (if not disabled)
    if not args.no_read:
        logger.info("Reading table data...")
        read_table_data(resources.table)


async def main():
    """
    Main function to orchestrate Iceberg table operations.

    This function coordinates the ETL process by:
    1. Parsing command-line arguments
    2. Initializing AWS resources
    3. Determining fetch mode and configuration
    4. Fetching transaction data from Etherscan
    5. Processing and storing data (unless read-only mode)
    """
    # Parse command-line arguments
    args = parse_arguments()
    logger.info(f"Starting ETL process with arguments: {args}")

    # Normalize wallet address (lowercase)
    wallet_address = args.wallet_address.lower()

    try:
        # Initialize AWS resources
        resources = initialize_resources(args)
        if resources is None:
            logger.error("Failed to initialize resources. Exiting.")
            return

        # Determine fetch mode and configuration
        fetch_config = determine_fetch_mode(
            args, resources, wallet_address, args.chain_id
        )

        # Fetch transactions
        transactions, highest_block_number = await fetch_transactions(
            wallet_address, args.chain_id, fetch_config
        )

        if not transactions:
            logger.info("No transactions found. Exiting.")
            return

        # Process data based on mode
        if args.read_only:
            display_read_only_data(transactions)
        else:
            await process_transactions(
                transactions,
                highest_block_number,
                resources,
                args,
                wallet_address,
                fetch_config,
            )

        logger.info("Operation completed successfully.")

    except Exception as e:
        logger.error(f"ETL process failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
