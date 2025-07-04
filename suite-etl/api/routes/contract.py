"""
Contract API Routes

This module defines FastAPI routes for contract analytics.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import constr

from api.models.blockchain import (
    ContractAnalyticsResponse,
    ContractInteractingAddressesResponse,
)
from api.dependencies import get_catalog, validate_time_window
from utils.blockchain import is_valid_address, is_contract_address
from utils.logging_config import get_logger
from analytics.blockchain_analytics import (
    get_contract_analytics,
    get_contract_interacting_addresses,
)

logger = get_logger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/contract", tags=["contract"])


@router.get("/{contract_address}/analytics")
async def get_contract_usage(
    contract_address: constr(min_length=40, max_length=42),
    chain_id: int = Query(
        1, description="Blockchain ID (1=Ethereum, 137=Polygon, etc.)"
    ),
    time_window: Optional[str] = Query(
        None, description="Time window (e.g., 24h, 7d, 30d)"
    ),
    catalog=Depends(get_catalog),
):
    """
    Get analytics for a contract including unique users, transaction count, and fees
    """
    # Validate address
    if not is_valid_address(contract_address):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Validate time window
    validate_time_window(time_window)

    # Check that it's a contract address
    if not is_contract_address(contract_address, chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is not a contract"
        )

    # Get contract analytics
    analytics = get_contract_analytics(catalog, chain_id, contract_address, time_window)
    if not analytics:
        raise HTTPException(
            status_code=404, detail="No data found for the contract address"
        )

    try:
        # Try to validate with the Pydantic model
        return ContractAnalyticsResponse(**analytics)
    except Exception as e:
        # If validation fails, log the error and return the raw analytics
        logger.error(f"Error validating contract analytics: {e}")
        return analytics


@router.get("/{contract_address}/interacting-addresses")
async def get_contract_interacting_addresses_api(
    contract_address: constr(min_length=40, max_length=42),
    chain_id: int = Query(
        1, description="Blockchain ID (1=Ethereum, 137=Polygon, etc.)"
    ),
    time_window: Optional[str] = Query(
        None, description="Time window (e.g., 24h, 7d, 30d)"
    ),
    limit: int = Query(
        100, description="Maximum number of addresses to return", ge=1, le=1000
    ),
    offset: int = Query(0, description="Offset for pagination", ge=0),
    catalog=Depends(get_catalog),
):
    """
    Get a list of unique addresses that have interacted with a contract within a time window.
    """
    # Validate address
    if not is_valid_address(contract_address):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Validate time window
    validate_time_window(time_window)

    # Check that it's a contract address
    if not is_contract_address(contract_address, chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is not a contract"
        )

    # Get interacting addresses
    result = get_contract_interacting_addresses(
        catalog, chain_id, contract_address, time_window, limit, offset
    )

    if not result:
        raise HTTPException(
            status_code=404, detail="No data found for the contract address"
        )

    try:
        # Try to validate with the Pydantic model
        return ContractInteractingAddressesResponse(**result)
    except Exception as e:
        # If validation fails, log the error and return the raw result
        logger.error(f"Error validating contract interacting addresses: {e}")
        return result
