"""
Raw analytics models

This module defines Pydantic models for the raw analytics from the raw database.
"""

from typing import List, Optional
from datetime import date
from pydantic import BaseModel


class ContractInteraction(BaseModel):
    """Model for contract interaction data."""

    contract_address: str
    interaction_count: int
    contract_name: str
    contract_category: str
    dapp: Optional[str] = None


class WalletInteractionsResponse(BaseModel):
    """Response model for wallet interactions."""

    wallet_address: str
    chain_id: int
    time_window: Optional[str] = None
    interactions: List[ContractInteraction]


class DailyActivity(BaseModel):
    """Model for daily contract activity."""

    block_date: date
    tx_count: int
    unique_users: int
    total_value_eth: float
    total_fees_eth: float


class TopUser(BaseModel):
    """Model for top user data."""

    from_address: str
    tx_count: int
    total_value_eth: float


class UserSegment(BaseModel):
    """Model for user segment data."""

    user_type: str
    user_count: int


class MethodDistribution(BaseModel):
    """Model for method distribution data."""

    function_name: str
    call_count: int
    unique_addresses: List[str]
    unique_address_count: int


class ContractBasicMetrics(BaseModel):
    """Model for basic contract metrics."""

    unique_users: int
    transaction_count: int
    total_fees_eth: float
    total_value_eth: float


class ContractAnalyticsResponse(BaseModel):
    """Response model for contract analytics."""

    basic_metrics: ContractBasicMetrics
    chain_id: int
    contract_address: str
    time_window: Optional[str] = None
    daily_activity: List[DailyActivity] = []
    top_users: List[TopUser] = []
    user_segments: List[UserSegment] = []
    method_distribution: List[MethodDistribution] = []


class AddressInteraction(BaseModel):
    """Model for address interaction data."""

    address: str
    tx_count: int
    first_interaction: str
    last_interaction: str
    total_value_eth: float


class ContractInteractingAddressesResponse(BaseModel):
    """Response model for contract interacting addresses."""

    contract_address: str
    chain_id: int
    time_window: Optional[str] = None
    total_count: int
    offset: int
    limit: int
    addresses: List[AddressInteraction]


class FunctionInteraction(BaseModel):
    """Model for function interaction data."""

    address: str
    tx_count: int
    first_interaction: str
    last_interaction: str
    total_value_eth: float


class ContractFunctionInteractionsResponse(BaseModel):
    """Response model for contract function interactions."""

    contract_address: str
    chain_id: int
    function_name: str
    time_window: Optional[str] = None
    total_count: int
    unique_address_count: int
    offset: int
    limit: int
    interactions: List[FunctionInteraction]
