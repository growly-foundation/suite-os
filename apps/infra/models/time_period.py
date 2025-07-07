#!/usr/bin/env python3
"""
Time Period Domain Models

This module contains domain models for handling time periods across the application.
These models are used for ETL operations, analytics time windows, and other time-based functionality.
"""

import re
from datetime import datetime, timedelta
from enum import Enum
from typing import List

from config.logging_config import get_logger

logger = get_logger(__name__)


class TimePeriod(Enum):
    """
    Unified enumeration for time periods supporting hours, days, weeks, months, and years.

    This is a domain model used across ETL operations, analytics, and APIs for consistent
    time period handling. It replaces the previous separate systems for ETL time periods
    and analytics time windows.

    Examples:
        >>> period = TimePeriod.DAYS_7
        >>> period.total_hours
        168
        >>> period.total_days
        7
        >>> start, end = period.to_datetime_range()

        >>> period = TimePeriod.from_string("24h")
        >>> period.value
        '24h'
    """

    # Hours
    HOURS_1 = "1h"
    HOURS_6 = "6h"
    HOURS_12 = "12h"
    HOURS_24 = "24h"
    HOURS_48 = "48h"

    # Days
    DAYS_1 = "1d"
    DAYS_3 = "3d"
    DAYS_7 = "7d"
    DAYS_14 = "14d"
    DAYS_30 = "30d"
    DAYS_90 = "90d"
    DAYS_180 = "180d"
    DAYS_365 = "365d"

    # Weeks
    WEEKS_1 = "1w"
    WEEKS_2 = "2w"
    WEEKS_4 = "4w"

    # Months (approximated as 30-day periods)
    MONTHS_1 = "1m"
    MONTHS_3 = "3m"
    MONTHS_6 = "6m"
    MONTHS_12 = "12m"

    # Years (approximated as 365-day periods)
    YEARS_1 = "1y"
    YEARS_2 = "2y"

    @property
    def total_hours(self) -> int:
        """Get the total number of hours for this period."""
        value, unit = self._parse_value()

        if unit == "h":
            return value
        elif unit == "d":
            return value * 24
        elif unit == "w":
            return value * 24 * 7
        elif unit == "m":
            return value * 24 * 30  # Approximation
        elif unit == "y":
            return value * 24 * 365  # Approximation
        else:
            raise ValueError(f"Unknown unit: {unit}")

    @property
    def total_days(self) -> int:
        """Get the total number of days for this period."""
        return self.total_hours // 24

    @property
    def days(self) -> int:
        """Get the number of days for this period (backward compatibility)."""
        return self.total_days

    @property
    def timedelta(self) -> timedelta:
        """Get a timedelta object for this period."""
        return timedelta(hours=self.total_hours)

    def _parse_value(self) -> tuple[int, str]:
        """Parse the enum value into number and unit."""
        match = re.match(r"^(\d+)([hdwmy])$", self.value)
        if not match:
            raise ValueError(f"Invalid time period format: {self.value}")
        return int(match.group(1)), match.group(2)

    @classmethod
    def from_string(cls, period_str: str) -> "TimePeriod":
        """
        Create TimePeriod from string, with fallback to 7d.

        Args:
            period_str: String like '1h', '24h', '7d', '1w', '1m', '1y'

        Returns:
            TimePeriod enum value
        """
        if not period_str:
            logger.warning("Empty time period string, defaulting to 7d")
            return cls.DAYS_7

        try:
            return cls(period_str)
        except ValueError:
            logger.warning(f"Invalid time period '{period_str}', defaulting to 7d")
            return cls.DAYS_7

    @classmethod
    def get_all_values(cls) -> List[str]:
        """Get all valid time period string values."""
        return [period.value for period in cls]

    @classmethod
    def get_analytics_values(cls) -> List[str]:
        """Get time period values commonly used for analytics (no very short periods)."""
        return [
            cls.HOURS_24.value,
            cls.HOURS_48.value,
            cls.DAYS_7.value,
            cls.DAYS_14.value,
            cls.DAYS_30.value,
            cls.DAYS_90.value,
            cls.DAYS_180.value,
            cls.DAYS_365.value,
        ]

    @classmethod
    def get_etl_values(cls) -> List[str]:
        """Get time period values commonly used for ETL operations."""
        return [
            cls.DAYS_1.value,
            cls.DAYS_3.value,
            cls.DAYS_7.value,
            cls.DAYS_14.value,
            cls.DAYS_30.value,
            cls.DAYS_90.value,
        ]

    def to_datetime_range(self, end_time: datetime = None) -> tuple[datetime, datetime]:
        """
        Convert this time period to a datetime range.

        Args:
            end_time: End time for the range (defaults to now)

        Returns:
            Tuple of (start_time, end_time)
        """
        if end_time is None:
            end_time = datetime.now()

        start_time = end_time - self.timedelta
        return start_time, end_time
