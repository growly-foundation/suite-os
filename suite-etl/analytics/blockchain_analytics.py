#!/usr/bin/env python3
"""
Blockchain Analytics Module

This module provides functions to analyze blockchain data stored in Iceberg tables:
- Wallet interactions with contracts
- Contract usage analytics
- Fee generation analytics
"""

import polars as pl
from datetime import datetime, date
from utils.logging_config import get_logger
from db.iceberg import load_table
from utils.blockchain import (
    get_time_window_filter,
    normalize_address,
    normalize_address_with_prefix,
)
from static.contracts import get_contract_info, is_known_contract
from pyiceberg.expressions import (
    GreaterThanOrEqual,
    LessThanOrEqual,
    And,
    Reference,
    EqualTo,
    literal,
)
from pyiceberg.types import DateType
import pyiceberg.expressions as exp

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


def get_contract_analytics(catalog, chain_id, contract_address, time_window=None):
    """
    Get comprehensive analytics for a contract in a given time window.

    For contract addresses, we look at the 'to' field to find transactions sent to the contract.
    The 'from' field contains the wallets that interacted with the contract.

    Args:
        catalog: Iceberg catalog
        chain_id: Chain ID (e.g., 1 for Ethereum mainnet)
        contract_address: Contract address to analyze
        time_window: Time window string ('24h', '48h', '7d', etc.) or None for all time

    Returns:
        dict: Comprehensive analytics including:
            - unique_users: Number of unique addresses that interacted with the contract
            - transaction_count: Total number of transactions
            - total_fees_eth: Total fees generated in ETH
            - daily_activity: Transaction count aggregated by day
            - top_users: List of addresses with the most interactions
            - value_flow: Analysis of value flowing in/out of the contract
            - method_distribution: Distribution of function calls (if available)
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

        # Normalize the contract address
        normalized_contract = normalize_address(contract_address)
        logger.info(f"Normalized contract address: {normalized_contract}")

        # For filtering, we need the address with 0x prefix
        normalized_contract_with_prefix = normalize_address_with_prefix(
            contract_address
        )
        logger.info(
            f"Using normalized contract with prefix for filtering: {normalized_contract_with_prefix}"
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

        # For contract addresses, we're interested in transactions where the contract is in the 'to' field
        # (i.e., transactions sent to the contract)
        query = query.filter(pl.col("to_normalized") == normalized_contract_with_prefix)

        # Log the number of transactions after filtering
        tx_count = len(query)
        logger.info(
            f"Found {tx_count} transactions to contract {normalized_contract_with_prefix}"
        )

        if tx_count == 0:
            logger.warning(f"No transactions found for contract {contract_address}")
            return {
                "basic_metrics": {
                    "unique_users": 0,
                    "transaction_count": 0,
                    "total_fees_eth": 0,
                    "total_value_eth": 0,
                },
                "time_window": time_window,
                "chain_id": chain_id,
                "contract_address": contract_address,
                "daily_activity": [],
                "top_users": [],
                "user_segments": [],
                "method_distribution": [],
            }

        # Calculate basic metrics
        unique_users = query.select(pl.col("from_normalized").n_unique()).item()
        transaction_count = len(query)

        # Calculate gas fees
        query = query.with_columns(
            [
                # Convert gas_used and gas_price to numeric values
                pl.col("gas_used")
                .cast(pl.Float64)
                .fill_null(0)
                .alias("gas_used_float"),
                pl.col("gas_price")
                .cast(pl.Float64)
                .fill_null(0)
                .alias("gas_price_float"),
                # Convert value to numeric
                pl.col("value").cast(pl.Float64).fill_null(0).alias("value_float"),
            ]
        )

        # Calculate fee in ETH and value in ETH
        query = query.with_columns(
            [
                (pl.col("gas_used_float") * pl.col("gas_price_float") / 1e18).alias(
                    "fee_eth"
                ),
                (pl.col("value_float") / 1e18).alias("value_eth"),
            ]
        )

        total_fees = query.select(pl.sum("fee_eth")).item()
        total_value = query.select(pl.sum("value_eth")).item()

        # 1. Daily Activity Analysis
        # Extract date from block_date and group by date
        daily_activity = (
            query.group_by("block_date")
            .agg(
                [
                    pl.count().alias("tx_count"),
                    pl.n_unique("from_normalized").alias("unique_users"),
                    pl.sum("value_eth").alias("total_value_eth"),
                    pl.sum("fee_eth").alias("total_fees_eth"),
                ]
            )
            .sort("block_date")
        )

        # 2. Top Users Analysis
        top_users = (
            query.group_by("from_normalized")
            .agg(
                [
                    pl.count().alias("tx_count"),
                    pl.sum("value_eth").alias("total_value_eth"),
                    pl.first("from").alias("from_address"),
                ]
            )
            .sort("tx_count", descending=True)
            .head(10)
            .select(["from_address", "tx_count", "total_value_eth"])
        )

        # 3. Method Analysis (if function_name is available)
        method_distribution = None
        try:
            # Check if function_name column exists
            if "function_name" in query.columns:
                # Log sample data to understand what we're working with
                sample_data = query.select("function_name").head(3)
                logger.info(f"Sample function_name data: {sample_data}")

                # Create a simple count by function name
                method_distribution = (
                    query.select("function_name")
                    .group_by("function_name")
                    .count()
                    .rename({"count": "call_count"})
                    .sort("call_count", descending=True)
                )

                # Fill nulls with "Unknown"
                if method_distribution.shape[0] > 0:
                    method_distribution = method_distribution.with_columns(
                        pl.col("function_name").fill_null("Unknown")
                    )

                # Log the structure to verify
                logger.info(
                    f"Method distribution columns: {method_distribution.columns}"
                )
                logger.info(
                    f"Method distribution sample: {method_distribution.head(2)}"
                )
        except Exception as e:
            logger.error(f"Error creating method distribution: {e}")
            method_distribution = None

        # 4. User Segments - New vs Returning Users
        # For this, we'll check if users have multiple transactions
        user_segments = (
            query.group_by("from_normalized")
            .agg(pl.count().alias("tx_count"))
            .with_columns(
                pl.when(pl.col("tx_count") == 1)
                .then(pl.lit("single_interaction"))
                .otherwise(pl.lit("repeat_user"))
                .alias("user_type")
            )
            .group_by("user_type")
            .agg(pl.count().alias("user_count"))
        )

        # Convert all analytics data to Python native types for JSON serialization
        # For method_distribution, ensure it has the right structure
        method_dist_dicts = []
        try:
            if method_distribution is not None and method_distribution.shape[0] > 0:
                # Convert to a list of dictionaries manually
                for i in range(method_distribution.shape[0]):
                    try:
                        row = method_distribution.row(i, named=True)
                        fn_name = str(row.get("function_name", "Unknown"))
                        # Safely convert call_count to integer
                        try:
                            call_count = int(row.get("call_count", 1))
                        except (TypeError, ValueError):
                            call_count = 1

                        method_dist_dicts.append(
                            {"function_name": fn_name, "call_count": call_count}
                        )
                    except Exception as e:
                        logger.warning(
                            f"Error processing method distribution row {i}: {e}"
                        )
        except Exception as e:
            logger.error(f"Error converting method distribution to dicts: {e}")
            method_dist_dicts = []

        return {
            "basic_metrics": {
                "unique_users": unique_users,
                "transaction_count": transaction_count,
                "total_fees_eth": float(total_fees) if total_fees else 0,
                "total_value_eth": float(total_value) if total_value else 0,
            },
            "time_window": time_window,
            "chain_id": chain_id,
            "contract_address": contract_address,
            "daily_activity": (
                daily_activity.to_dicts() if daily_activity.shape[0] > 0 else []
            ),
            "top_users": top_users.to_dicts() if top_users.shape[0] > 0 else [],
            "user_segments": (
                user_segments.to_dicts() if user_segments.shape[0] > 0 else []
            ),
            "method_distribution": method_dist_dicts,
        }
    except Exception as e:
        logger.error(f"Error analyzing contract: {e}")
        return None


def get_contract_interacting_addresses(
    catalog, chain_id, contract_address, time_window=None, limit=100, offset=0
):
    """
    Get a list of unique addresses that have interacted with a contract within a time window.

    Args:
        catalog: Iceberg catalog
        chain_id: Chain ID (e.g., 1 for Ethereum mainnet)
        contract_address: Contract address to analyze
        time_window: Time window string ('24h', '48h', '7d', etc.) or None for all time
        limit: Maximum number of addresses to return
        offset: Offset for pagination

    Returns:
        dict: Dictionary containing:
            - total_count: Total number of unique addresses
            - addresses: List of address details including:
                - address: The wallet address
                - tx_count: Number of transactions with the contract
                - first_interaction: Timestamp of first interaction
                - last_interaction: Timestamp of last interaction
                - total_value: Total value transferred to the contract
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

        # Normalize the contract address
        normalized_contract = normalize_address(contract_address)
        logger.info(f"Normalized contract address: {normalized_contract}")

        # For filtering, we need the address with 0x prefix
        normalized_contract_with_prefix = normalize_address_with_prefix(
            contract_address
        )
        logger.info(
            f"Using normalized contract with prefix for filtering: {normalized_contract_with_prefix}"
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

        # For contract addresses, we're interested in transactions where the contract is in the 'to' field
        # (i.e., transactions sent to the contract)
        query = query.filter(pl.col("to_normalized") == normalized_contract_with_prefix)

        # Log the number of transactions after filtering
        tx_count = len(query)
        logger.info(
            f"Found {tx_count} transactions to contract {normalized_contract_with_prefix}"
        )

        if tx_count == 0:
            logger.warning(f"No transactions found for contract {contract_address}")
            return {
                "contract_address": contract_address,
                "chain_id": chain_id,
                "time_window": time_window,
                "total_count": 0,
                "offset": offset,
                "limit": limit,
                "addresses": [],
            }

        # Convert value to numeric
        query = query.with_columns(
            [
                pl.col("value").cast(pl.Float64).fill_null(0).alias("value_float"),
                pl.col("block_time").cast(pl.Datetime).alias("block_time_dt"),
            ]
        )

        # Calculate value in ETH
        query = query.with_columns([(pl.col("value_float") / 1e18).alias("value_eth")])

        # Calculate total unique addresses
        total_unique_addresses = query.select(
            pl.col("from_normalized").n_unique()
        ).item()
        logger.info(
            f"Found {total_unique_addresses} unique addresses interacting with contract"
        )

        # Group by address and calculate metrics
        address_metrics = (
            query.group_by("from", "from_normalized")
            .agg(
                [
                    pl.count().alias("tx_count"),
                    pl.min("block_time_dt").alias("first_interaction"),
                    pl.max("block_time_dt").alias("last_interaction"),
                    pl.sum("value_eth").alias("total_value_eth"),
                ]
            )
            .sort("tx_count", descending=True)
        )

        # Apply pagination using slice instead of offset/limit methods
        # Polars uses slice with start and length
        end_index = offset + limit
        address_metrics_paginated = address_metrics.slice(offset, limit)

        logger.info(
            f"Returning {len(address_metrics_paginated)} addresses (offset={offset}, limit={limit})"
        )

        # Convert to list of dictionaries
        address_list = []
        try:
            if address_metrics_paginated.shape[0] > 0:
                for i in range(address_metrics_paginated.shape[0]):
                    try:
                        row = address_metrics_paginated.row(i, named=True)
                        address_list.append(
                            {
                                "address": row.get("from", ""),
                                "tx_count": int(row.get("tx_count", 0)),
                                "first_interaction": str(
                                    row.get("first_interaction", "")
                                ),
                                "last_interaction": str(
                                    row.get("last_interaction", "")
                                ),
                                "total_value_eth": float(row.get("total_value_eth", 0)),
                            }
                        )
                    except Exception as e:
                        logger.warning(f"Error processing address row {i}: {e}")
        except Exception as e:
            logger.error(f"Error converting address metrics to list: {e}")

        return {
            "contract_address": contract_address,
            "chain_id": chain_id,
            "time_window": time_window,
            "total_count": total_unique_addresses,
            "offset": offset,
            "limit": limit,
            "addresses": address_list,
        }
    except Exception as e:
        logger.error(f"Error getting contract interacting addresses: {e}")
        return None


def debug_check_address_normalization(address):
    """
    Debug function to check how an address is normalized.

    Args:
        address: The address to normalize

    Returns:
        dict: Dictionary containing original and normalized addresses
    """
    from utils.blockchain import normalize_address, normalize_address_with_prefix
    from static.contracts import get_contract_info, is_known_contract

    logger = get_logger(__name__)

    # Standard normalization (removes 0x prefix)
    normalized = normalize_address(address)

    # For filtering, we need to keep the 0x prefix
    normalized_for_filtering = normalize_address_with_prefix(address)

    # Just lowercase (keeps 0x prefix if present)
    just_lowercase = address.lower() if address else ""

    # Check if this is a known contract on chain 8453
    chain_id = 8453
    is_known = is_known_contract(chain_id, normalized)
    contract_info = get_contract_info(chain_id, normalized)

    logger.info(f"Address normalization debug:")
    logger.info(f"  Original: {address}")
    logger.info(f"  Normalized (no prefix): {normalized}")
    logger.info(f"  Normalized (with prefix): {normalized_for_filtering}")
    logger.info(f"  Just lowercase: {just_lowercase}")
    logger.info(f"  Is known contract on chain {chain_id}: {is_known}")
    logger.info(f"  Contract info: {contract_info}")

    return {
        "original": address,
        "normalized_no_prefix": normalized,
        "normalized_with_prefix": normalized_for_filtering,
        "just_lowercase": just_lowercase,
        "is_known_contract": is_known,
        "contract_info": contract_info,
    }
