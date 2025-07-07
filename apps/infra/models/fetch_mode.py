#!/usr/bin/env python3
"""
Fetch Mode Domain Models

This module contains domain models for ETL fetch modes.
These models define how data should be fetched and processed across different ETL operations.
"""

from enum import Enum


class FetchMode(Enum):
    """
    Enumeration for different ETL fetch modes.

    This defines how data should be fetched during ETL operations:
    - INCREMENTAL: Fetch only new data since the last cursor position
    - FULL_REFRESH: Fetch all data from the beginning, replacing existing data
    - TIME_RANGE: Fetch data from a specific time period
    """

    INCREMENTAL = "incremental"
    FULL_REFRESH = "full_refresh"
    TIME_RANGE = "time_range"
