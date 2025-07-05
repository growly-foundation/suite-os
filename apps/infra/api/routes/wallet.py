"""
Wallet API Routes

This module defines FastAPI routes for wallet analytics.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, constr, Field

from api.models.raw_analytics import WalletInteractionsResponse
from api.models.query_models import WalletAnalyticsQuery
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
    query: WalletAnalyticsQuery = Depends(),
    catalog=Depends(get_catalog),
):
    """
    Get a wallet's interactions with different contracts/dApps
    """
    # Validate address
    if not is_valid_address(wallet_address):
        raise HTTPException(status_code=400, detail="Invalid wallet address")

    # Validate time window
    validate_time_window(query.time_window)

    # Check that it's not a contract address
    if is_contract_address(wallet_address, query.chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is a contract, not a wallet"
        )

    # Get wallet interactions
    interactions = get_wallet_contract_interactions(
        catalog, query.chain_id, wallet_address, query.time_window
    )

    # We now always return a DataFrame, even if empty
    if interactions is None:
        logger.error(f"Unexpected None result for wallet {wallet_address}")
        # Return empty interactions
        return WalletInteractionsResponse(
            wallet_address=wallet_address,
            chain_id=query.chain_id,
            time_window=query.time_window,
            interactions=[],
        )

    # Convert to response format
    interactions_list = interactions.to_dicts()

    return WalletInteractionsResponse(
        wallet_address=wallet_address,
        chain_id=query.chain_id,
        time_window=query.time_window,
        interactions=interactions_list,
    )
