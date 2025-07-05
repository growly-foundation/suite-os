#!/usr/bin/env python3
"""
Wallet Analytics Module

This module provides functions to analyze wallet interactions with blockchain data:
- Wallet interactions with contracts
- Wallet transaction patterns
- Wallet behavior analysis
"""

import polars as pl
from utils.logging_config import get_logger
from db.iceberg import load_table
from utils.blockchain import (
    get_time_window_filter,
    normalize_address,
    normalize_address_with_prefix,
)
from static.contracts import get_contract_info
from pyiceberg.expressions import (
    GreaterThanOrEqual,
    LessThanOrEqual,
    And,
    Reference,
    EqualTo,
    literal,
)

logger = get_logger(__name__)


def get_wallet_contract_interactions(
    catalog, chain_id, wallet_address, time_window=None
):
    """
    Get a list of contracts that a wallet has interacted with in a given time window.

    For wallet addresses, we look at the 'from' field to find transactions initiated by the wallet.
    The 'to' field contains the contracts the wallet interacted with.

    Args:
        catalog: Iceberg catalog
        chain_id: Chain ID (e.g., 1 for Ethereum mainnet)
        wallet_address: Wallet address to analyze
        time_window: Time window string ('24h', '48h', '7d', etc.) or None for all time

    Returns:
        polars.DataFrame: DataFrame of contracts and interaction counts with total_count added
    """
    try:
        # Load transactions table
        table = load_table(catalog, "raw", "transactions")
        if not table:
            logger.error("Failed to load transactions table")
            return None

        # Get time window filter
        start_time, end_time = get_time_window_filter(time_window)

        # Convert datetime to date for filtering on block_date
        start_date = start_time.date() if start_time else None
        end_date = end_time.date() if end_time else None

        # Build query with time filter if specified
        query = table.scan()

        # Filter by chain_id at the Iceberg level for better performance
        chain_id_ref = Reference("chain_id")
        query = query.filter(EqualTo(chain_id_ref, literal(chain_id)))

        if start_date and end_date:
            # Use block_date for partition pruning with proper literal types
            block_date_ref = Reference("block_date")
            start_filter = GreaterThanOrEqual(block_date_ref, literal(start_date))
            end_filter = LessThanOrEqual(block_date_ref, literal(end_date))
            date_filter = And(start_filter, end_filter)

            # Apply the filter
            query = query.filter(date_filter)

        # Convert to polars DataFrame - using correct conversion method
        arrow_table = query.to_arrow()
        transactions_pl = pl.from_arrow(arrow_table)

        # Log the number of transactions loaded
        logger.info(
            f"Loaded {len(transactions_pl)} transactions for chain_id {chain_id}"
        )

        # Check if we have any data
        if len(transactions_pl) == 0:
            logger.warning(f"No transactions found for chain_id {chain_id}")
            return pl.DataFrame(
                {
                    "contract_address": [],
                    "contract_address_normalized": [],
                    "interaction_count": [],
                    "chain_id": [],
                    "contract_name": [],
                    "contract_category": [],
                    "dapp": [],
                    "total_count": [],
                }
            ).with_columns(pl.lit(0).alias("total_count"))

        # Normalize the wallet address
        normalized_wallet = normalize_address(wallet_address)
        logger.info(f"Normalized wallet address: {normalized_wallet}")

        # For filtering, we need the address with 0x prefix
        normalized_wallet_with_prefix = normalize_address_with_prefix(wallet_address)
        logger.info(
            f"Using normalized wallet with prefix for filtering: {normalized_wallet_with_prefix}"
        )

        # Normalize addresses in the dataframe for comparison
        # Keep the 0x prefix for proper matching with blockchain data
        query = transactions_pl.with_columns(
            [
                pl.col("from")
                .map_elements(lambda x: x.lower() if x else "", return_dtype=pl.Utf8)
                .alias("from_normalized"),
                pl.col("to")
                .map_elements(lambda x: x.lower() if x else "", return_dtype=pl.Utf8)
                .alias("to_normalized"),
            ]
        )

        # Further refine time filtering if needed using block_time for more precise filtering
        if start_time and end_time:
            query = query.with_columns(
                pl.col("block_time").cast(pl.Datetime).alias("ts")
            )
            query = query.filter(
                (pl.col("ts") >= start_time) & (pl.col("ts") <= end_time)
            )
            logger.info(f"Applied time filter: {start_time} to {end_time}")

        # We need to consider both:
        # 1. Transactions where the wallet is the sender (from field)
        # 2. Transactions where the wallet is the recipient (to field)

        # First, find transactions initiated by the wallet
        outgoing_txs = query.filter(
            pl.col("from_normalized") == normalized_wallet_with_prefix
        )
        outgoing_count = len(outgoing_txs)
        logger.info(
            f"Found {outgoing_count} outgoing transactions from wallet {normalized_wallet_with_prefix}"
        )

        # Then, find transactions where the wallet received funds
        incoming_txs = query.filter(
            pl.col("to_normalized") == normalized_wallet_with_prefix
        )
        incoming_count = len(incoming_txs)
        logger.info(
            f"Found {incoming_count} incoming transactions to wallet {normalized_wallet_with_prefix}"
        )

        # Combine both types of interactions
        all_interactions = pl.concat(
            [
                # For outgoing transactions, the contract is in the 'to' field
                outgoing_txs.select(
                    pl.col("to").alias("contract_address"),
                    pl.col("to_normalized").alias("contract_address_normalized"),
                    pl.lit("outgoing").alias("direction"),
                    pl.col("chain_id"),
                    pl.col("block_time"),
                    pl.col("hash"),
                    pl.col("value"),
                ),
                # For incoming transactions, the contract is in the 'from' field
                incoming_txs.select(
                    pl.col("from").alias("contract_address"),
                    pl.col("from_normalized").alias("contract_address_normalized"),
                    pl.lit("incoming").alias("direction"),
                    pl.col("chain_id"),
                    pl.col("block_time"),
                    pl.col("hash"),
                    pl.col("value"),
                ),
            ]
        )

        total_interactions = len(all_interactions)
        logger.info(f"Total interactions (incoming + outgoing): {total_interactions}")

        if total_interactions == 0:
            logger.warning(f"No transactions found for wallet {wallet_address}")
            return pl.DataFrame(
                {
                    "contract_address": [],
                    "contract_address_normalized": [],
                    "interaction_count": [],
                    "chain_id": [],
                    "contract_name": [],
                    "contract_category": [],
                    "dapp": [],
                }
            ).with_columns(pl.lit(0).alias("total_count"))

        # Group by contract addresses and count interactions
        # Use n_unique instead of count_distinct for direction counting
        result = (
            all_interactions.group_by("contract_address", "contract_address_normalized")
            .agg(
                pl.count().alias("interaction_count"),
                pl.first("chain_id").alias("chain_id"),
                pl.col("direction").n_unique().alias("direction_count"),
                pl.first("direction").alias("primary_direction"),
            )
            .sort("interaction_count", descending=True)
        )

        # Log the number of unique contracts
        total_count = len(result)
        logger.info(f"Wallet interacted with {total_count} unique addresses")

        # Enhance with contract metadata
        # First convert to a list of dictionaries to process
        contracts_data = result.select(
            ["chain_id", "contract_address_normalized"]
        ).to_dicts()

        # Create contract info mappings with proper error handling
        contract_info_map = {}
        for row in contracts_data:
            try:
                chain_id_val = row.get("chain_id")
                contract_addr = row.get("contract_address_normalized", "")

                # Make sure we're using the same format as in the contracts.py file
                # Remove 0x prefix if present for lookup in static/contracts.py
                lookup_addr = normalize_address(contract_addr)

                if chain_id_val is not None and lookup_addr:
                    contract_info = get_contract_info(chain_id_val, lookup_addr)
                    if contract_info is not None:
                        contract_info_map[contract_addr] = contract_info
                    else:
                        contract_info_map[contract_addr] = {
                            "name": "Unknown Contract",
                            "category": "Unknown",
                            "dapp": "Unknown",
                        }
                else:
                    logger.warning(
                        f"Invalid row data: chain_id={chain_id_val}, address={contract_addr}"
                    )
            except Exception as e:
                logger.warning(f"Error getting contract info: {e}")
                # Ensure we have a valid entry even if there's an error
                if (
                    "contract_address_normalized" in row
                    and row["contract_address_normalized"]
                ):
                    contract_info_map[row["contract_address_normalized"]] = {
                        "name": "Unknown Contract",
                        "category": "Unknown",
                        "dapp": "Unknown",
                    }

        # Add contract name, category and dapp columns with safe handling
        result = result.with_columns(
            [
                pl.col("contract_address_normalized")
                .map_elements(
                    lambda addr: (
                        contract_info_map.get(addr, {}).get("name", "Unknown Contract")
                        if addr
                        else "Unknown Contract"
                    ),
                    return_dtype=pl.Utf8,
                )
                .alias("contract_name"),
                pl.col("contract_address_normalized")
                .map_elements(
                    lambda addr: (
                        contract_info_map.get(addr, {}).get("category", "Unknown")
                        if addr
                        else "Unknown"
                    ),
                    return_dtype=pl.Utf8,
                )
                .alias("contract_category"),
                pl.col("contract_address_normalized")
                .map_elements(
                    lambda addr: (
                        contract_info_map.get(addr, {}).get("dapp", "Unknown")
                        if addr
                        else "Unknown"
                    ),
                    return_dtype=pl.Utf8,
                )
                .alias("dapp"),
            ]
        )

        # Add total_count as a column
        result = result.with_columns(pl.lit(total_count).alias("total_count"))

        return result
    except Exception as e:
        logger.error(f"Error analyzing wallet interactions: {e}")
        # Return an empty DataFrame with the expected schema
        return pl.DataFrame(
            {
                "contract_address": [],
                "contract_address_normalized": [],
                "interaction_count": [],
                "chain_id": [],
                "contract_name": [],
                "contract_category": [],
                "dapp": [],
                "total_count": [],
            }
        ).with_columns(pl.lit(0).alias("total_count"))
