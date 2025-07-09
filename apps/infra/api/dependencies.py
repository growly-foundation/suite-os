"""
API Dependencies

This module defines dependencies for FastAPI routes.
"""

from config.logging_config import get_logger
from fastapi import HTTPException, Request
from models import TimePeriod

logger = get_logger(__name__)

# Valid time windows for filtering - now using the unified TimePeriod enum
VALID_TIME_WINDOWS = TimePeriod.get_analytics_values()


def get_catalog(request: Request):
    """
    Dependency to get the Iceberg catalog from app.state.

    Args:
        request: FastAPI request object

    Returns:
        Iceberg catalog object

    Raises:
        HTTPException: If catalog is not available
    """
    catalog = request.app.state.catalog
    if not catalog:
        logger.error("Catalog not available in app.state")
        raise HTTPException(status_code=500, detail="Data catalog is not available")
    return catalog


def validate_time_window(time_window: str = None):
    """
    Validate the time window parameter using the unified TimePeriod enum.

    Args:
        time_window: Time window string or None

    Returns:
        The validated time window

    Raises:
        HTTPException: If time window is invalid
    """
    if time_window and time_window not in VALID_TIME_WINDOWS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid time window. Must be one of: {', '.join(VALID_TIME_WINDOWS)}",
        )
    return time_window


def get_time_period_from_string(time_window: str = None) -> TimePeriod:
    """
    Convert a validated time window string to a TimePeriod enum.

    Args:
        time_window: Time window string (should be pre-validated)

    Returns:
        TimePeriod enum value
    """
    return TimePeriod.from_string(time_window)
