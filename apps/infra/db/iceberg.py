#!/usr/bin/env python3
"""
Iceberg Base Operations

This module provides base functions for interacting with Apache Iceberg tables:
- Table loading
- Common read operations
- Base write operations (append, overwrite, upsert)
"""

import traceback
from collections import OrderedDict

import pyarrow as pa
from config.logging_config import get_logger
from pyiceberg.schema import Schema

# Create a logger for this module
logger = get_logger(__name__)


def load_table(catalog, database, table_name):
    """
    Load an Iceberg table.

    Args:
        catalog: Iceberg catalog
        database: Database name
        table_name: Table name

    Returns:
        Table object or None if loading fails
    """
    try:
        table = catalog.load_table(f"{database}.{table_name}")
        logger.info(f"Table '{database}.{table_name}' loaded successfully")
        return table
    except Exception as e:
        logger.error(f"Error loading the table: {e}")
        return None


def reorder_records(data: list[dict], schema: Schema) -> list[dict]:
    """
    Reorder and filter record fields to match the schema.

    Args:
        data: List of dictionaries containing the data
        schema: PyIceberg schema defining the table structure

    Returns:
        List of dictionaries with fields ordered according to the schema
    """
    field_names = [f.name for f in schema.fields]
    return [OrderedDict((k, row.get(k)) for k in field_names) for row in data]


def append_data(table, data, schema):
    """
    Append data to the Iceberg table with proper type conversion.

    Args:
        table: Iceberg table to append data to
        data: List of dictionaries containing the data to append
        schema: PyArrow schema of the table
    """
    try:
        # Create the table from arrays with the original schema
        table_data = pa.Table.from_pylist(data, schema=schema)
        table.append(table_data)
        logger.info(f"Successfully appended {len(data)} records to table")
    except Exception as e:
        logger.error(f"Error appending data: {e}")
        logger.debug(traceback.format_exc())


def overwrite_data(table, data, schema):
    """
    Overwrite the Iceberg table with new data.

    Args:
        table: Iceberg table to overwrite
        data: List of dictionaries containing the data
        schema: PyArrow schema of the table
    """
    try:
        # Create the table and overwrite
        table_data = pa.Table.from_pylist(data, schema=schema)
        table.overwrite(table_data)
        logger.info(f"Successfully overwrote table with {len(data)} records")
    except Exception as e:
        logger.error(f"Error overwriting data: {e}")
        logger.debug(traceback.format_exc())


def upsert_data(table, data, schema, join_cols):
    """
    Upsert data into the Iceberg table.

    Args:
        table: Iceberg table to upsert data into
        data: List of dictionaries containing the data
        schema: PyArrow schema of the table
        join_cols: List of column names to join on
    """
    try:
        # Create the table and upsert
        table_data = pa.Table.from_pylist(data, schema=schema)
        table.upsert(df=table_data, join_cols=join_cols)
        logger.info(f"Successfully upserted {len(data)} records to table")
    except Exception as e:
        logger.error(f"Error upserting data: {e}")
        logger.debug(traceback.format_exc())


def read_table_data(table):
    """
    Read all data from the Iceberg table and print a summary.

    Args:
        table: Iceberg table to read data from

    Returns:
        pandas.DataFrame: The table data or None if an error occurs
    """
    try:
        logger.info("Reading data from the table...")
        all_data = table.scan().to_pandas()

        # Log a summary of the data
        logger.info(
            f"Table contains {len(all_data)} rows with {len(all_data.columns)} columns"
        )
        logger.info(f"Column names: {', '.join(all_data.columns)}")
        logger.info(f"Data sample: {all_data.head(5)}")
        logger.info(f"Full data shape: {all_data.shape}")

        return all_data
    except Exception as e:
        logger.error(f"Error reading data from the table: {e}")
        logger.debug(traceback.format_exc())
        return None


def get_record_by_filter(table, filter_conditions):
    """
    Get records from a table based on filter conditions.

    Args:
        table: Iceberg table
        filter_conditions: Function that takes a pandas DataFrame and returns a filtered DataFrame

    Returns:
        pandas.DataFrame: Filtered records or None if not found
    """
    try:
        # Query the table
        result = table.scan().to_pandas()

        if result.empty:
            logger.info("Table is empty")
            return None

        # Apply filter conditions
        filtered = filter_conditions(result)

        if filtered.empty:
            logger.info("No records found matching the filter conditions")
            return None

        return filtered

    except Exception as e:
        logger.error(f"Error getting records: {e}")
        logger.debug(traceback.format_exc())
        return None


def update_or_insert_record(table, data, schema, join_cols, check_exists_fn=None):
    """
    Update or insert records in an Iceberg table.

    Args:
        table: Iceberg table
        data: List of dictionaries containing the data
        schema: PyArrow schema of the table
        join_cols: List of column names to join on
        check_exists_fn: Function that checks if the record exists (takes table and returns boolean)

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Convert to PyArrow table
        pa_table = pa.Table.from_pylist(data, schema=schema)

        # Check if the record exists
        if check_exists_fn and check_exists_fn(table):
            # Update existing record using upsert operation
            table.upsert(df=pa_table, join_cols=join_cols)
            logger.info("Updated existing record")
        else:
            # Insert new record
            table.append(pa_table)
            logger.info("Inserted new record")

        return True

    except Exception as e:
        logger.error(f"Error updating or inserting record: {e}")
        logger.debug(traceback.format_exc())
        return False
