"""
Core API Routes

This module defines general FastAPI routes for the API.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import constr

from api.dependencies import get_catalog, validate_time_window
from utils.blockchain import is_valid_address, is_contract_address
from utils.logging_config import get_logger
from analytics.blockchain_analytics import (
    get_wallet_contract_interactions,
    get_contract_analytics,
    debug_check_address_normalization,
)
from static.contracts import debug_list_all_contracts

logger = get_logger(__name__)

# Create router
router = APIRouter(prefix="/api/v1", tags=["core"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@router.get("/address/{address}")
async def get_address_analytics(
    address: constr(min_length=40, max_length=42),
    chain_id: int = Query(
        1, description="Blockchain ID (1=Ethereum, 137=Polygon, etc.)"
    ),
    time_window: Optional[str] = Query(
        None, description="Time window (e.g., 24h, 7d, 30d)"
    ),
    catalog=Depends(get_catalog),
):
    """
    Get analytics for a blockchain address (automatically detects if it's a wallet or contract)
    """
    # Validate address
    if not is_valid_address(address):
        raise HTTPException(status_code=400, detail="Invalid blockchain address")

    # Validate time window
    validate_time_window(time_window)

    # Determine if address is a contract or wallet
    is_contract = is_contract_address(address, chain_id)

    if is_contract:
        # Get contract analytics
        analytics = get_contract_analytics(catalog, chain_id, address, time_window)
        if not analytics:
            raise HTTPException(
                status_code=404, detail="No data found for the contract address"
            )
        return {"address_type": "contract", "analytics": analytics}
    else:
        # Get wallet interactions
        interactions = get_wallet_contract_interactions(
            catalog, chain_id, address, time_window
        )

        # We now always return a DataFrame, even if empty
        if interactions is None:
            logger.error(f"Unexpected None result for wallet {address}")
            # Return empty interactions
            return {
                "address_type": "wallet",
                "analytics": {
                    "wallet_address": address,
                    "chain_id": chain_id,
                    "time_window": time_window,
                    "interactions": [],
                    "total_count": 0,
                },
            }

        # Extract total_count before converting to list
        total_count = interactions[0, "total_count"] if len(interactions) > 0 else 0

        # Convert to response format
        interactions_list = interactions.to_dicts()

        # Log the results
        logger.info(
            f"Found {len(interactions_list)} contract interactions for wallet {address}"
        )

        return {
            "address_type": "wallet",
            "analytics": {
                "wallet_address": address,
                "chain_id": chain_id,
                "time_window": time_window,
                "interactions": interactions_list,
                "total_count": total_count,
            },
        }


@router.get("/debug/address/{address}")
async def debug_address(
    address: constr(min_length=40, max_length=42),
):
    """
    Debug endpoint to check address normalization and contract detection
    """
    # Check address normalization
    normalization_info = debug_check_address_normalization(address)

    # List all known contracts
    all_contracts = debug_list_all_contracts()

    return {"address_info": normalization_info, "contracts_listed": True}
