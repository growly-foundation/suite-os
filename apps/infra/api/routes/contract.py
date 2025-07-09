"""
Contract API Routes

This module defines FastAPI routes for contract analytics.
"""

import os
from datetime import datetime
from typing import Optional

from analytics.contract_analytics import (
    get_contract_addresses_interactions,
    get_contract_function_distribution,
    get_contract_summary,
)
from api.dependencies import get_catalog, validate_time_window
from api.models.query_models import (
    ContractAnalyticsQuery,
    ContractSummaryQuery,
)
from api.models.raw_analytics import (
    ContractFunctionDistributionResponse,
    ContractInteractingAddressesResponse,
    ContractSummaryResponse,
)
from config.logging_config import get_logger
from db.iceberg import load_table, reorder_records, upsert_data
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from providers.etherscan import EtherscanProvider
from pydantic import BaseModel, Field, constr
from pyiceberg.expressions import And, EqualTo, Reference, literal
from utils.blockchain import is_contract_address, is_proxy_contract, is_valid_address

logger = get_logger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/contracts", tags=["contracts"])


# Add the model for contract creation request
class ContractCreateRequest(BaseModel):
    chain_id: int = Field(
        ..., description="Blockchain ID (1=Ethereum, 8453=Base, etc.)"
    )
    contract_address: constr(min_length=40, max_length=42) = Field(
        ..., description="Contract address"
    )
    label: str = Field(..., description="Label/name for the contract")
    abi_json: Optional[str] = Field(None, description="Optional ABI JSON string")


# Add the model for contract update request
class ContractUpdateRequest(BaseModel):
    label: Optional[str] = Field(None, description="New label/name for the contract")
    abi_json: Optional[str] = Field(None, description="New ABI JSON string")
    is_proxy: Optional[bool] = Field(None, description="Update proxy status")


@router.get("/{contract_address}/summary")
async def get_summary(
    contract_address: constr(min_length=40, max_length=42),
    query: ContractSummaryQuery = Depends(),
    catalog=Depends(get_catalog),
):
    """
    Get analytics for a contract including unique users, transaction count, and fees
    """
    # Validate address
    if not is_valid_address(contract_address, query.chain_id):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Validate time window
    validate_time_window(query.time_window)

    # Check that it's a contract address
    if not is_contract_address(contract_address, query.chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is not a contract"
        )

    # Get contract summary
    summary = get_contract_summary(
        catalog, query.chain_id, contract_address, query.time_window
    )
    if not summary:
        raise HTTPException(
            status_code=404, detail="No data found for the contract address"
        )

    try:
        # Try to validate with the Pydantic model
        return ContractSummaryResponse(**summary)
    except Exception as e:
        # If validation fails, log the error and return the raw analytics
        logger.error(f"Error validating contract summary: {e}")
        return summary


@router.get("/{contract_address}/interactions/addresses")
async def get_addresses_interactions(
    contract_address: constr(min_length=40, max_length=42),
    query: ContractAnalyticsQuery = Depends(),
    catalog=Depends(get_catalog),
):
    """
    Get a list of unique addresses that have interacted with a contract within a time window.
    Optionally filter by function name.
    """
    # Validate address
    if not is_valid_address(contract_address, query.chain_id):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Validate time window
    validate_time_window(query.time_window)

    # Check that it's a contract address
    if not is_contract_address(contract_address, query.chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is not a contract"
        )

    # Get interacting addresses
    result = get_contract_addresses_interactions(
        catalog,
        query.chain_id,
        contract_address,
        query.time_window,
        query.limit,
        query.offset,
        query.function,
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


@router.get("/{contract_address}/interactions/functions")
async def get_functions_interactions(
    contract_address: constr(min_length=40, max_length=42),
    query: ContractAnalyticsQuery = Depends(),
    catalog=Depends(get_catalog),
):
    """
    Get the distribution of functions/methods called on a contract.
    Returns unique functions found in the contract with their call statistics.
    """
    # Validate address
    if not is_valid_address(contract_address, query.chain_id):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Validate time window
    validate_time_window(query.time_window)

    # Check that it's a contract address
    if not is_contract_address(contract_address, query.chain_id):
        raise HTTPException(
            status_code=400, detail="The provided address is not a contract"
        )

    # Get function distribution
    result = get_contract_function_distribution(
        catalog,
        query.chain_id,
        contract_address,
        query.time_window,
        query.limit,
        query.offset,
    )

    if not result:
        raise HTTPException(
            status_code=404, detail="No data found for the contract address"
        )

    try:
        # Try to validate with the Pydantic model
        return ContractFunctionDistributionResponse(**result)
    except Exception as e:
        # If validation fails, log the error and return the raw result
        logger.error(f"Error validating contract function distribution: {e}")
        return result


###### Functions to interact with metadata contracts table ######


# Helper function to get contract from database
def get_contract_from_db(catalog, chain_id, contract_address):
    """
    Get contract details from the database.

    Args:
        catalog: Iceberg catalog
        chain_id: Blockchain ID
        contract_address: Contract address

    Returns:
        Contract data or None if not found
    """
    # Normalize address
    contract_address = contract_address.lower()

    # Load contracts table
    contracts_table = load_table(catalog, "standardized", "contracts")
    if not contracts_table:
        logger.error("Failed to load contracts table")
        return None

    # Query the table
    try:
        # Use PyIceberg expressions for row_filter
        chain_id_filter = EqualTo(Reference("chain_id"), literal(chain_id))
        address_filter = EqualTo(
            Reference("contract_address"), literal(contract_address)
        )
        combined_filter = And(chain_id_filter, address_filter)

        df = contracts_table.scan(row_filter=combined_filter).to_pandas()

        if len(df) == 0:
            return None

        return df.iloc[0].to_dict()
    except Exception as e:
        logger.error(f"Error querying contracts table: {e}")
        return None


# Add the POST endpoint with upsert logic
@router.post("/", status_code=201)
async def create_contract(request: ContractCreateRequest, catalog=Depends(get_catalog)):
    """
    Add a contract to the standardized.contracts table.

    If the contract already exists, it will be updated.
    If ABI JSON is not provided, it will be fetched from Etherscan.
    The is_proxy field will be determined using Web3.
    """
    # Validate address
    if not is_valid_address(request.contract_address, request.chain_id):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Normalize address
    contract_address = request.contract_address.lower()

    # Check if contract exists
    contracts_table = load_table(catalog, "standardized", "contracts")
    if not contracts_table:
        raise HTTPException(status_code=500, detail="Failed to load contracts table")

    # Check if contract already exists
    existing_contract = get_contract_from_db(
        catalog, request.chain_id, contract_address
    )

    # Fetch ABI if not provided
    abi_json = request.abi_json
    if not abi_json:
        try:
            # Get Etherscan API key
            etherscan_api_key = os.getenv("ETHERSCAN_API_KEY")
            if not etherscan_api_key:
                logger.warning("ETHERSCAN_API_KEY not set, cannot fetch ABI")
                abi_json = "{}"
            else:
                # Use the Etherscan provider to fetch ABI
                etherscan_provider = EtherscanProvider(api_key=etherscan_api_key)
                abi_json = await etherscan_provider.get_contract_abi(
                    contract_address, request.chain_id
                )
        except Exception as e:
            logger.error(f"Error fetching ABI from Etherscan: {e}")
            abi_json = "{}"  # Default empty ABI

    # Check if contract is a proxy using the blockchain utility
    is_proxy = False
    try:
        is_proxy = is_proxy_contract(contract_address, abi_json, request.chain_id)
    except Exception as e:
        logger.error(f"Error checking if contract is proxy for {contract_address}: {e}")

    # Prepare contract data
    contract_data = [
        {
            "chain_id": request.chain_id,
            "contract_address": contract_address,
            "abi_json": abi_json,
            "label": request.label,
            "is_proxy": is_proxy,
            "updated_at": datetime.now(),
        }
    ]

    # Insert or update the contract
    try:
        # Use upsert_data instead of delete and insert
        schema = contracts_table.schema()
        contract_data = reorder_records(contract_data, schema)

        # Define join columns for upsert
        join_cols = ["chain_id", "contract_address"]

        # Upsert the data
        upsert_data(contracts_table, contract_data, schema.as_arrow(), join_cols)

        # Determine the status message based on whether the contract existed
        status_message = (
            "Contract updated successfully"
            if existing_contract
            else "Contract added successfully"
        )

        return {
            "status": "success",
            "message": status_message,
            "contract": {
                "chain_id": request.chain_id,
                "contract_address": contract_address,
                "label": request.label,
                "is_proxy": is_proxy,
            },
        }
    except Exception as e:
        logger.error(f"Error adding contract to table: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to add contract: {str(e)}"
        ) from e


# Add PUT endpoint for updating existing contracts
@router.put("/{contract_address}", status_code=200)
async def update_contract(
    contract_address: constr(min_length=40, max_length=42),
    chain_id: int = Query(1, description="Blockchain ID (1=Ethereum, 8453=Base, etc.)"),
    request: Optional[ContractUpdateRequest] = Body(None),
    catalog=Depends(get_catalog),
):
    """
    Update an existing contract in the standardized.contracts table.

    Only the fields provided in the request will be updated.
    """
    # Validate address
    if not is_valid_address(contract_address, chain_id):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Normalize address
    contract_address = contract_address.lower()

    # Check if contract exists
    existing_contract = get_contract_from_db(catalog, chain_id, contract_address)
    if not existing_contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Load contracts table
    contracts_table = load_table(catalog, "standardized", "contracts")
    if not contracts_table:
        raise HTTPException(status_code=500, detail="Failed to load contracts table")

    # Update fields based on request
    updated_data = dict(existing_contract)

    # Check if request body is provided
    if request is not None:
        if request.label is not None:
            updated_data["label"] = request.label

        if request.abi_json is not None:
            updated_data["abi_json"] = request.abi_json

            # Re-check proxy status if ABI is updated
            try:
                updated_data["is_proxy"] = is_proxy_contract(
                    contract_address, request.abi_json, chain_id
                )
            except Exception as e:
                logger.error(f"Error checking if contract is proxy: {e}")

        if request.is_proxy is not None:
            updated_data["is_proxy"] = request.is_proxy

    # Update timestamp
    updated_data["updated_at"] = datetime.now()

    # Update the contract using upsert
    try:
        # Prepare data for upsert
        contract_data = [updated_data]
        schema = contracts_table.schema()
        contract_data = reorder_records(contract_data, schema)

        # Define join columns for upsert
        join_cols = ["chain_id", "contract_address"]

        # Upsert the data
        upsert_data(contracts_table, contract_data, schema.as_arrow(), join_cols)

        return {
            "status": "success",
            "message": "Contract updated successfully",
            "contract": {
                "chain_id": chain_id,
                "contract_address": contract_address,
                "label": updated_data["label"],
                "is_proxy": updated_data["is_proxy"],
            },
        }
    except Exception as e:
        logger.error(f"Error updating contract: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update contract: {str(e)}"
        ) from e


# Add GET endpoint to retrieve contract details
@router.get("/{contract_address}", status_code=200)
async def get_contract(
    contract_address: constr(min_length=40, max_length=42),
    chain_id: int = Query(1, description="Blockchain ID (1=Ethereum, 8453=Base, etc.)"),
    include_abi: bool = Query(False, description="Include ABI JSON in response"),
    catalog=Depends(get_catalog),
):
    """
    Get contract details from the standardized.contracts table.
    """
    # Validate address
    if not is_valid_address(contract_address, chain_id):
        raise HTTPException(status_code=400, detail="Invalid contract address")

    # Normalize address
    contract_address = contract_address.lower()

    # Check if contract exists

    contract = get_contract_from_db(catalog, chain_id, contract_address)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Remove ABI from response for brevity unless specifically requested
    if not include_abi:
        contract.pop("abi_json", None)

    return {"status": "success", "contract": contract}
