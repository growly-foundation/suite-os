"""
API Dependencies

This module defines dependencies for FastAPI routes.
"""

from fastapi import Depends, HTTPException
import os

from utils.aws_config import initialize_catalog
from utils.logging_config import get_logger

logger = get_logger(__name__)

# Environment variables
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-1")
ICEBERG_BUCKET = os.getenv("ICEBERG_BUCKET", "suite")
ICEBERG_CATALOG = os.getenv("ICEBERG_CATALOG", "s3tablescatalog")

# Valid time windows for filtering
VALID_TIME_WINDOWS = ["24h", "48h", "7d", "14d", "30d", "90d", "180d", "365d"]


def get_catalog():
    """
    Dependency to get the Iceberg catalog.

    Returns:
        Iceberg catalog object

    Raises:
        HTTPException: If catalog initialization fails
    """
    catalog = initialize_catalog(ICEBERG_CATALOG, ICEBERG_BUCKET, AWS_REGION)
    if not catalog:
        logger.error("Failed to initialize catalog")
        raise HTTPException(status_code=500, detail="Failed to connect to data catalog")
    return catalog


def validate_time_window(time_window: str = None):
    """
    Validate the time window parameter.

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
