"""
Query Models for API Endpoints

This module defines shared Pydantic models for query parameters used across
analytics endpoints to improve maintainability and consistency.
"""

from typing import Optional
from pydantic import BaseModel, Field


class BaseAnalyticsQuery(BaseModel):
    """Base query parameters for analytics endpoints"""

    chain_id: int = Field(
        1, description="Blockchain ID (1=Ethereum, 137=Polygon, etc.)"
    )
    time_window: Optional[str] = Field(
        None, description="Time window (e.g., 24h, 7d, 30d)"
    )


class PaginatedAnalyticsQuery(BaseAnalyticsQuery):
    """Analytics query with pagination parameters"""

    limit: int = Field(
        100, description="Maximum number of results to return", ge=1, le=1000
    )
    offset: int = Field(0, description="Offset for pagination", ge=0)


class ContractSummaryQuery(BaseAnalyticsQuery):
    """Query parameters for contract summary endpoint"""

    pass


class ContractAnalyticsQuery(PaginatedAnalyticsQuery):
    """Query parameters for contract analytics endpoints with pagination"""

    function: Optional[str] = Field(
        None, description="Optional function name to filter by"
    )


class ContractFunctionQuery(PaginatedAnalyticsQuery):
    """Query parameters for contract function analytics endpoints"""

    function: str = Field(..., description="Function name to analyze")


class WalletAnalyticsQuery(BaseAnalyticsQuery):
    """Query parameters for wallet analytics endpoints"""

    pass
