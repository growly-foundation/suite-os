"""
Wallet API Routes

This module defines FastAPI routes for wallet analytics.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import constr

from api.models.raw_analytics import WalletInteractionsResponse
from api.dependencies import get_catalog, validate_time_window
from utils.blockchain import is_valid_address, is_contract_address
from utils.logging_config import get_logger
from analytics.wallet_analytics import get_wallet_contract_interactions

logger = get_logger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/wallet", tags=["wallet"])


@router.get("/{wallet_address}/interactions", response_model=WalletInteractionsResponse)
async def get_wallet_interactions(
    wallet_address: constr(min_length=40, max_length=42),
    chain_id: int = Query(
        1, description="Blockchain ID (1=Ethereum, 137=Polygon, etc.)"
    ),
    time_window: Optional[str] = Query(
        None, description="Time window (e.g., 24h, 7d, 30d)"
    ),
    catalog=Depends(get_catalog),
):
    """
    Get a wallet's interactions with different contracts/dApps
    """
    # Validate address
    if not is_valid_address(wallet_address):
        raise HTTPException(status_code=400, detail="Invalid wallet address")

    # Validate time window
    validate_time_window(time_window)

    # Check that it's not a contract address
    if is_contract_address(wallet_address, chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is a contract, not a wallet"
        )

    # Get wallet interactions
    interactions = get_wallet_contract_interactions(
        catalog, chain_id, wallet_address, time_window
    )

    # We now always return a DataFrame, even if empty
    if interactions is None:
        logger.error(f"Unexpected None result for wallet {wallet_address}")
        # Return empty interactions
        return WalletInteractionsResponse(
            wallet_address=wallet_address,
            chain_id=chain_id,
            time_window=time_window,
            interactions=[],
        )

    # Convert to response format
    interactions_list = interactions.to_dicts()

    # Log the results
    logger.info(
        f"Found {len(interactions_list)} contract interactions for wallet {wallet_address}"
    )

    return WalletInteractionsResponse(
        wallet_address=wallet_address,
        chain_id=chain_id,
        time_window=time_window,
        interactions=interactions_list,
    )
