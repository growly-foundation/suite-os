"""
Etherscan API Data Models

Simple Pydantic models for Etherscan API responses focused on type safety.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class EtherscanStatus(str, Enum):
    """Etherscan API response status codes."""

    SUCCESS = "1"
    FAILURE = "0"


class EtherscanTransaction(BaseModel):
    """Etherscan transaction model."""

    model_config = ConfigDict(populate_by_name=True)

    blockNumber: str
    timeStamp: str
    hash: str
    nonce: str
    blockHash: str
    transactionIndex: str
    from_address: str = Field(alias="from")
    to: Optional[str] = None
    value: str
    gas: str
    gasPrice: str
    isError: str
    txreceipt_status: str
    input: str
    contractAddress: Optional[str] = None
    cumulativeGasUsed: str
    gasUsed: str
    confirmations: str
    methodId: Optional[str] = None
    functionName: Optional[str] = None


class EtherscanProxyResponse(BaseModel):
    """Etherscan proxy API response model."""

    jsonrpc: str
    id: int
    result: Union[str, int, Dict[str, Any], List[Any], None]
    error: Optional[Dict[str, Any]] = None


class EtherscanLog(BaseModel):
    """Etherscan event log model."""

    address: str
    topics: List[str]
    data: str
    blockNumber: str
    timeStamp: str
    gasPrice: str
    gasUsed: str
    logIndex: str
    transactionHash: str
    transactionIndex: str


class EtherscanApiResponse(BaseModel):
    """Generic Etherscan API response model."""

    status: EtherscanStatus
    message: str
    result: Union[
        List[EtherscanTransaction],
        List[EtherscanLog],
        EtherscanTransaction,
        str,
        Dict[str, Any],
        None,
    ]
