#!/usr/bin/env python3
"""
AWS Utilities

This module provides functions for AWS integration:
- Account ID retrieval
- Iceberg catalog initialization
"""

import boto3
import traceback
from pyiceberg.catalog import load_catalog
from utils.logging_config import get_logger

# Create a logger for this module
logger = get_logger(__name__)


def get_aws_account_id():
    """
    Get AWS account ID from STS.

    Returns:
        str: AWS account ID or None if an error occurs
    """
    try:
        sts_client = boto3.client("sts")
        account_id = sts_client.get_caller_identity().get("Account")
        return account_id
    except Exception as e:
        logger.error(f"Error getting account ID: {e}")
        logger.debug(traceback.format_exc())
        return None


def initialize_catalog(catalog_name, bucket_name, region):
    """
    Initialize catalog using the Glue Iceberg REST endpoint.

    Args:
        catalog_name: Name of the catalog
        bucket_name: S3 bucket name
        region: AWS region

    Returns:
        Catalog object or None if initialization fails
    """
    account_id = get_aws_account_id()
    if not account_id:
        logger.error("Failed to get AWS account ID")
        return None

    try:
        rest_catalog = load_catalog(
            catalog_name,
            **{
                "type": "rest",
                "warehouse": f"{account_id}:{catalog_name}/{bucket_name}",
                "uri": f"https://glue.{region}.amazonaws.com/iceberg",
                "rest.sigv4-enabled": "true",
                "rest.signing-name": "glue",
                "rest.signing-region": region,
            },
        )
        logger.info("Catalog loaded successfully!")
        return rest_catalog
    except Exception as e:
        logger.error(f"Error loading catalog: {e}")
        logger.debug(traceback.format_exc())
        return None
