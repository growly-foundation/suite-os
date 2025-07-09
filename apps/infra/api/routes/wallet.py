"""
Wallet API Routes

This module defines FastAPI routes for wallet analytics.
"""

from analytics.wallet_analytics import get_wallet_contract_interactions
from api.dependencies import get_catalog, validate_time_window
from api.models.query_models import WalletAnalyticsQuery
from api.models.raw_analytics import WalletInteractionsResponse
from config.logging_config import get_logger
from fastapi import APIRouter, Depends, HTTPException
from pydantic import constr
from utils.blockchain import is_contract_address, is_valid_address

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
    if not is_valid_address(wallet_address, query.chain_id):
        raise HTTPException(status_code=400, detail="Invalid wallet address")

    # Validate time window
    validate_time_window(query.time_window)

    # Check that it's not a contract address
    if is_contract_address(wallet_address, query.chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is a contract, not a wallet"
        )

    # Get wallet interactions
    result = get_wallet_contract_interactions(
        catalog, query.chain_id, wallet_address, query.time_window
    )

    # Handle the new dict return format
    if result is None or not isinstance(result, dict):
        logger.error(f"Unexpected None result for wallet {wallet_address}")
        # Return empty interactions
        return WalletInteractionsResponse(
            wallet_address=wallet_address,
            chain_id=query.chain_id,
            time_window=query.time_window,
            first_transaction=None,
            last_transaction=None,
            total_transaction_count=0,
            interactions=[],
        )

    # Extract data from the result dict
    interactions_df = result.get("interactions")
    first_transaction = result.get("first_transaction")
    last_transaction = result.get("last_transaction")
    total_transaction_count = result.get("total_transaction_count", 0)

    # Convert interactions DataFrame to response format
    interactions_list = []
    if interactions_df is not None and len(interactions_df) > 0:
        interactions_list = interactions_df.to_dicts()

    return WalletInteractionsResponse(
        wallet_address=wallet_address,
        chain_id=query.chain_id,
        time_window=query.time_window,
        first_transaction=first_transaction,
        last_transaction=last_transaction,
        total_transaction_count=total_transaction_count,
        interactions=interactions_list,
    )
