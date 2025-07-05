#!/usr/bin/env python3
"""
Contract Analytics Module

This module provides functions to analyze contract interactions with blockchain data:
- Contract usage analytics
- Fee generation analytics
- User interaction patterns with contracts
- Contract interacting addresses
"""

import polars as pl
from utils.logging_config import get_logger
from db.iceberg import load_table
from utils.blockchain import (
    normalize_address,
    normalize_address_with_prefix,
)
from analytics.helpers import _apply_time_window_filter

logger = get_logger(__name__)


def _calculate_basic_metrics(query):
    """
    Calculate basic metrics for contract analytics.

    Args:
        query: Polars DataFrame with transaction data

    Returns:
        dict: Basic metrics including unique_users, transaction_count, total_fees_eth, total_value_eth
    """
    try:
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

        return {
            "unique_users": unique_users,
            "transaction_count": transaction_count,
            "total_fees_eth": float(total_fees) if total_fees else 0,
            "total_value_eth": float(total_value) if total_value else 0,
        }, query
    except Exception as e:
        logger.error(f"Error calculating basic metrics: {e}")
        return {
            "unique_users": 0,
            "transaction_count": 0,
            "total_fees_eth": 0,
            "total_value_eth": 0,
        }, query


def _analyze_daily_activity(query):
    """
    Analyze daily activity patterns for contract analytics.

    Args:
        query: Polars DataFrame with transaction data (must include fee_eth and value_eth columns)

    Returns:
        list: Daily activity data as list of dictionaries
    """
    try:
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

        return daily_activity.to_dicts() if daily_activity.shape[0] > 0 else []
    except Exception as e:
        logger.error(f"Error analyzing daily activity: {e}")
        return []


def _analyze_top_users(query):
    """
    Analyze top users for contract analytics.

    Args:
        query: Polars DataFrame with transaction data (must include value_eth column)

    Returns:
        list: Top users data as list of dictionaries
    """
    try:
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

        return top_users.to_dicts() if top_users.shape[0] > 0 else []
    except Exception as e:
        logger.error(f"Error analyzing top users: {e}")
        return []


def _analyze_method_distribution(query):
    """
    Analyze method distribution for contract analytics.

    Args:
        query: Polars DataFrame with transaction data

    Returns:
        list: Method distribution data as list of dictionaries including:
            - function_name: Name of the function/method
            - call_count: Total number of calls to this method
            - unique_addresses: List of unique addresses that called this method
            - unique_address_count: Number of unique addresses that called this method
    """
    try:
        # Check if function_name column exists
        if "function_name" not in query.columns:
            return []

        # Log sample data to understand what we're working with
        sample_data = query.select("function_name").head(3)
        logger.info(f"Sample function_name data: {sample_data}")

        # Group by function name and aggregate both count and unique addresses
        method_distribution = (
            query.select(["function_name", "from", "from_normalized"])
            .group_by("function_name")
            .agg(
                [
                    pl.count().alias("call_count"),
                    pl.col("from").unique().alias("unique_addresses"),
                    pl.col("from_normalized").n_unique().alias("unique_address_count"),
                ]
            )
            .sort("call_count", descending=True)
        )

        # Fill nulls with "Unknown"
        if method_distribution.shape[0] > 0:
            method_distribution = method_distribution.with_columns(
                pl.col("function_name").fill_null("Unknown")
            )

        # Log the structure to verify
        logger.info(f"Method distribution columns: {method_distribution.columns}")
        logger.info(f"Method distribution sample: {method_distribution.head(2)}")

        # Convert to list of dictionaries with proper error handling
        method_dist_dicts = []
        if method_distribution.shape[0] > 0:
            for i in range(method_distribution.shape[0]):
                try:
                    row = method_distribution.row(i, named=True)
                    fn_name = str(row.get("function_name", "Unknown"))

                    # Safely convert call_count to integer
                    try:
                        call_count = int(row.get("call_count", 1))
                    except (TypeError, ValueError):
                        call_count = 1

                    # Safely convert unique_address_count to integer
                    try:
                        unique_address_count = int(row.get("unique_address_count", 0))
                    except (TypeError, ValueError):
                        unique_address_count = 0

                    # Get unique addresses list
                    unique_addresses = row.get("unique_addresses", [])
                    if unique_addresses is None:
                        unique_addresses = []
                    elif not isinstance(unique_addresses, list):
                        # Convert to list if it's not already
                        try:
                            unique_addresses = list(unique_addresses)
                        except (TypeError, ValueError):
                            unique_addresses = []

                    method_dist_dicts.append(
                        {
                            "function_name": fn_name,
                            "call_count": call_count,
                            "unique_addresses": unique_addresses,
                            "unique_address_count": unique_address_count,
                        }
                    )
                except Exception as e:
                    logger.warning(f"Error processing method distribution row {i}: {e}")

        return method_dist_dicts
    except Exception as e:
        logger.error(f"Error analyzing method distribution: {e}")
        return []


def _analyze_user_segments(query):
    """
    Analyze user segments for contract analytics.

    Args:
        query: Polars DataFrame with transaction data

    Returns:
        list: User segments data as list of dictionaries
    """
    try:
        # New vs Returning Users
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

        return user_segments.to_dicts() if user_segments.shape[0] > 0 else []
    except Exception as e:
        logger.error(f"Error analyzing user segments: {e}")
        return []


def get_contract_summary(catalog, chain_id, contract_address, time_window=None):
    """
    Get comprehensive analytics for a contract address.

    Args:
        catalog: Iceberg catalog
        chain_id: Chain ID (e.g., 1 for Ethereum mainnet)
        contract_address: Contract address to analyze
        time_window: Time window string ('24h', '48h', '7d', etc.) or None for all time

    Returns:
        dict: Dictionary containing:
            - basic_metrics: Basic usage metrics (users, transactions, fees)
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

        # Apply time window filter using helper function
        query, start_time, end_time = _apply_time_window_filter(
            table, chain_id, time_window
        )

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

        # Calculate analytics using extracted functions
        basic_metrics, processed_query = _calculate_basic_metrics(query)
        daily_activity = _analyze_daily_activity(processed_query)
        top_users = _analyze_top_users(processed_query)
        method_distribution = _analyze_method_distribution(processed_query)
        user_segments = _analyze_user_segments(processed_query)

        return {
            "basic_metrics": basic_metrics,
            "time_window": time_window,
            "chain_id": chain_id,
            "contract_address": contract_address,
            "daily_activity": daily_activity,
            "top_users": top_users,
            "user_segments": user_segments,
            "method_distribution": method_distribution,
        }
    except Exception as e:
        logger.error(f"Error analyzing contract: {e}")
        return None


def get_contract_addresses_interactions(
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

        # Apply time window filter using helper function
        query, start_time, end_time = _apply_time_window_filter(
            table, chain_id, time_window
        )

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


def get_contract_function_interactions(
    catalog,
    chain_id,
    contract_address,
    function_name,
    time_window=None,
    limit=100,
    offset=0,
):
    """
    Get detailed information about interactions with a specific function/method of a contract.

    Args:
        catalog: Iceberg catalog
        chain_id: Chain ID (e.g., 1 for Ethereum mainnet)
        contract_address: Contract address to analyze
        function_name: Name of the function to analyze
        time_window: Time window string ('24h', '48h', '7d', etc.) or None for all time
        limit: Maximum number of interactions to return
        offset: Offset for pagination

    Returns:
        dict: Dictionary containing:
            - contract_address: The contract address
            - chain_id: The chain ID
            - function_name: The function name
            - time_window: The time window used
            - total_count: Total number of interactions
            - unique_address_count: Number of unique addresses that called this function
            - interactions: List of interaction details
    """
    try:
        # Load transactions table
        table = load_table(catalog, "raw", "transactions")
        if not table:
            logger.error("Failed to load transactions table")
            return None

        # Apply time window filter using helper function
        query, start_time, end_time = _apply_time_window_filter(
            table, chain_id, time_window
        )

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

        # Filter by contract address (transactions sent to the contract)
        query = query.filter(pl.col("to_normalized") == normalized_contract_with_prefix)

        # Check if function_name column exists
        if "function_name" not in query.columns:
            logger.warning("function_name column not found in transactions data")
            return {
                "contract_address": contract_address,
                "chain_id": chain_id,
                "function_name": function_name,
                "time_window": time_window,
                "total_count": 0,
                "unique_address_count": 0,
                "offset": offset,
                "limit": limit,
                "interactions": [],
            }

        # Filter by function name
        query = query.filter(
            pl.col("function_name").fill_null("Unknown") == function_name
        )

        # Log the number of transactions after filtering
        tx_count = len(query)
        logger.info(
            f"Found {tx_count} transactions for function '{function_name}' on contract {normalized_contract_with_prefix}"
        )

        if tx_count == 0:
            logger.warning(
                f"No transactions found for function '{function_name}' on contract {contract_address}"
            )
            return {
                "contract_address": contract_address,
                "chain_id": chain_id,
                "function_name": function_name,
                "time_window": time_window,
                "total_count": 0,
                "unique_address_count": 0,
                "offset": offset,
                "limit": limit,
                "interactions": [],
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
            f"Found {total_unique_addresses} unique addresses calling function '{function_name}'"
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
        address_metrics_paginated = address_metrics.slice(offset, limit)

        logger.info(
            f"Returning {len(address_metrics_paginated)} interactions (offset={offset}, limit={limit})"
        )

        # Convert to list of dictionaries
        interactions_list = []
        try:
            if address_metrics_paginated.shape[0] > 0:
                for i in range(address_metrics_paginated.shape[0]):
                    try:
                        row = address_metrics_paginated.row(i, named=True)
                        interactions_list.append(
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
                        logger.warning(f"Error processing interaction row {i}: {e}")
        except Exception as e:
            logger.error(f"Error converting interaction metrics to list: {e}")

        return {
            "contract_address": contract_address,
            "chain_id": chain_id,
            "function_name": function_name,
            "time_window": time_window,
            "total_count": tx_count,
            "unique_address_count": total_unique_addresses,
            "offset": offset,
            "limit": limit,
            "interactions": interactions_list,
        }
    except Exception as e:
        logger.error(f"Error getting contract function interactions: {e}")
        return None
