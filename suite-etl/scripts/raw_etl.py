#!/usr/bin/env python3
"""
Apache Iceberg Table Operations with AWS Integration

This script demonstrates how to:
1. Connect to AWS Glue Iceberg tables using PyIceberg
2. Fetch Ethereum transaction data from Etherscan
3. Convert and append data to Iceberg tables
4. Read data from Iceberg tables

Usage:
    python main.py <wallet_address> [--chain-id CHAIN_ID] [--mode {full,incremental}]
                  [--no-read] [--catalog CATALOG] [--bucket BUCKET]
                  [--database DATABASE] [--table TABLE] [--region REGION]

Example:
    python main.py 0x55Fce96D44c96Ef27f296aEB37aD0eb360505015 --chain-id 1 --mode full

Requirements:
- AWS credentials configured
- ETHERSCAN_API_KEY environment variable set
"""

import os
import sys
import asyncio
import argparse

# Add parent directory to path when script is run directly
if __name__ == "__main__":
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sys.path.insert(0, parent_dir)

from dotenv import load_dotenv
from providers.etherscan_provider import EtherscanProvider, FetchMode
from utils.aws_config import initialize_catalog
from db.iceberg import load_table, reorder_records, append_data, read_table_data
from pipelines.raw.cursor import get_cursor, update_cursor
from utils.logging_config import get_logger

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


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Fetch Ethereum transaction data and store in Iceberg tables"
    )

    # Required arguments
    parser.add_argument(
        "wallet_address", help="Ethereum wallet address to fetch transactions for"
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
        choices=["full", "incremental"],
        default="incremental",
        help="Fetch mode: full refresh or incremental (default: incremental)",
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


async def main():
    """
    Main function to orchestrate Iceberg table operations.

    This function:
    1. Parses command-line arguments
    2. Initializes the AWS catalog
    3. Loads the Iceberg table
    4. Fetches Ethereum transaction data from Etherscan
    5. Appends the transaction data to the Iceberg table (unless read-only)
    6. Updates the cursor table with the latest block number
    7. Reads and displays the table data (if not disabled)
    """
    # Parse command-line arguments
    args = parse_arguments()
    logger.info(f"Starting with arguments: {args}")

    # Normalize wallet address (lowercase)
    wallet_address = args.wallet_address.lower()

    # Initialize AWS resources (skip if read-only)
    catalog = None
    table = None
    schema = None
    cursor_table = None

    if not args.read_only:
        logger.info(f"Initializing catalog: {args.catalog}")
        catalog = initialize_catalog(args.catalog, args.bucket, args.region)
        if not catalog:
            logger.error("Failed to initialize catalog. Exiting.")
            return

        # Load the table
        logger.info(f"Loading table: {args.database}.{args.table}")
        table = load_table(catalog, args.database, args.table)
        if not table:
            logger.error("Failed to load table. Exiting.")
            return
        schema = table.schema()

        # Load the cursor table for incremental mode
        if args.mode == "incremental":
            logger.info("Loading cursor table for incremental mode")
            cursor_table = load_table(catalog, args.database, "cursor")
            if not cursor_table:
                logger.warning(
                    "Failed to load cursor table. Falling back to full refresh mode."
                )
                args.mode = "full"

    # Determine fetch mode
    fetch_mode = (
        FetchMode.FULL_REFRESH if args.mode == "full" else FetchMode.INCREMENTAL
    )

    # Get last block number for incremental mode
    last_block_number = None
    if fetch_mode == FetchMode.INCREMENTAL and not args.read_only:
        logger.info(f"Getting last block number for {wallet_address}")
        last_block_number = get_cursor(cursor_table, args.chain_id, wallet_address)
        if last_block_number is not None:
            try:
                last_block_number = int(last_block_number)
            except ValueError:
                logger.warning(f"Invalid block number in cursor: {last_block_number}")
                last_block_number = None

        if last_block_number is None:
            logger.warning(
                "Could not determine last block number for incremental mode."
            )
            logger.info("Falling back to full refresh mode.")
            fetch_mode = FetchMode.FULL_REFRESH

    # Fetch Ethereum transaction data
    etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
    if not etherscan_api_key:
        logger.error("ETHERSCAN_API_KEY environment variable not set. Exiting.")
        return

    logger.info(f"Fetching Ethereum transaction data for {wallet_address}")
    logger.info(f"Chain ID: {args.chain_id}")
    logger.info(f"Mode: {args.mode}")
    if fetch_mode == FetchMode.INCREMENTAL and last_block_number is not None:
        logger.info(f"Starting from block: {last_block_number}")

    etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)
    transactions = await etherscan_provider.get_all_transactions_full(
        address=wallet_address,
        chain_id=args.chain_id,
        mode=fetch_mode,
        last_block_number=last_block_number,
    )

    if not transactions:
        logger.info("No transactions found. Exiting.")
        return

    logger.info(f"Retrieved {len(transactions)} transactions")

    # Get the highest block number from the transactions
    highest_block_number = None
    if transactions:
        try:
            block_numbers = [int(tx.get("block_number", 0)) for tx in transactions]
            highest_block_number = max(block_numbers)
            logger.info(f"Highest block number in transactions: {highest_block_number}")
        except (ValueError, TypeError) as e:
            logger.error(f"Error determining highest block number: {e}")

    # Display sample data in read-only mode
    if args.read_only:
        logger.info("Running in read-only mode")
        logger.info("Sample transaction data (last 5 transactions):")
        for i, tx in enumerate(transactions[-5:]):
            logger.info(f"Transaction {i+1}:")
            for key, value in tx.items():
                logger.debug(f"  {key}: {value}")

        logger.info(f"Total transactions: {len(transactions)}")
        logger.info("Read-only mode: Data not written to Iceberg table")
    else:
        # Process and append data
        logger.info(f"Processing {len(transactions)} transactions...")
        transactions = reorder_records(transactions, schema)
        append_data(table, transactions, schema.as_arrow())

        # Update cursor with the highest block number
        if highest_block_number is not None:
            logger.info(f"Updating cursor with block number: {highest_block_number}")
            update_cursor(
                catalog,
                args.database,
                args.chain_id,
                wallet_address,
                highest_block_number,
            )

        # Read and print table data (if not disabled)
        if not args.no_read:
            logger.info("Reading table data...")
            read_table_data(table)

    logger.info("Operation completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())
