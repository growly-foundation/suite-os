"""
Etherscan Base Provider

Base class providing shared functionality for all Etherscan API operations.
Contains common parameters, utilities, and aiohttp session management.
"""

import re
import asyncio
from abc import ABC
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any

import aiohttp

from config.logging_config import get_logger


# Create a logger for this module
logger = get_logger(__name__)


@dataclass
class EtherscanResponse:
    """Base response structure from Etherscan API."""

    status: str
    message: str
    result: Any


class EtherscanBaseProvider(ABC):
    """
    Base provider for Etherscan API operations.

    Provides shared functionality including:
    - Base URL and API key management
    - Common request parameters (chainid, module, action)
    - aiohttp session handling
    - Response processing utilities
    - Key conversion utilities
    - Request retry logic for handling timeouts
    """

    def __init__(self, api_key: str):
        """
        Initialize the base Etherscan provider.

        Args:
            api_key: Etherscan API key
        """
        self.api_key = api_key
        self.base_url = "https://api.etherscan.io/v2/api"
        self.supported_chains = [1, 8453]
        self.max_retries = 3
        self.retry_delay = 1.0  # Initial delay in seconds
        logger.info(
            f"Initialized Etherscan base provider for {self.__class__.__name__}"
        )

    def _get_base_params(self, chain_id: int, module: str, action: str) -> Dict:
        """
        Get base parameters common to all Etherscan API requests.

        Args:
            chain_id: Blockchain chain ID (1 for Ethereum mainnet, 8453 for Base)
            module: API module (account, contract, proxy)
            action: Specific action within the module

        Returns:
            Dictionary with base parameters
        """
        return {
            "chainid": chain_id,
            "module": module,
            "action": action,
            "apikey": self.api_key,
        }

    def _camel_to_snake(self, name: str) -> str:
        """
        Convert camelCase string to snake_case.

        Args:
            name: String in camelCase format

        Returns:
            String in snake_case format
        """
        # Handle edge cases for specific Etherscan fields to match DDL schema
        if name == "timeStamp":
            return "timestamp"
        if name == "isError":
            return "is_error"

        # For txreceipt_status, keep as-is (it's already in the correct format)
        if name == "txreceipt_status":
            return "txreceipt_status"

        # Insert an underscore before any uppercase letter that follows a lowercase letter
        s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
        # Insert an underscore before any uppercase letter that follows a lowercase letter or digit
        return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()

    def _convert_keys_to_snake_case(self, data: Dict) -> Dict:
        """
        Convert all keys in a dictionary from camelCase to snake_case.

        Args:
            data: Dictionary with camelCase keys

        Returns:
            Dictionary with snake_case keys
        """
        converted = {}
        for key, value in data.items():
            snake_key = self._camel_to_snake(key)
            converted[snake_key] = value
        return converted

    def _enhance_transaction(self, tx: Dict, chain_id: int) -> Dict:
        """
        Add additional fields to a transaction object and convert keys to snake_case.

        Args:
            tx: Raw transaction from Etherscan API
            chain_id: Blockchain chain ID

        Returns:
            Enhanced transaction with additional fields and snake_case keys matching DDL schema
        """
        # Convert camelCase keys to snake_case
        enhanced_tx = self._convert_keys_to_snake_case(tx)

        # Add chain_id
        enhanced_tx["chain_id"] = chain_id

        # Add block_time (convert from Unix timestamp to timestamp format)
        timestamp_unix = int(enhanced_tx["timestamp"])
        block_timestamp = datetime.fromtimestamp(timestamp_unix)
        enhanced_tx["block_time"] = block_timestamp

        # Add block_date (date only)
        enhanced_tx["block_date"] = block_timestamp.date()

        return enhanced_tx

    async def _make_request(
        self,
        session: aiohttp.ClientSession,
        params: Dict,
    ) -> EtherscanResponse:
        """
        Make an HTTP request to the Etherscan API with retry logic.

        Args:
            session: aiohttp session for making requests
            params: Request parameters
        Returns:
            EtherscanResponse object with parsed API response

        Raises:
            Exception: If the request fails after all retries or API returns a non-retryable error
        """
        logger.debug(f"Making request with params: {params}")

        for attempt in range(self.max_retries + 1):
            try:
                async with session.get(self.base_url, params=params) as response:
                    if response.status != 200:
                        error_msg = f"API request failed with status {response.status}"
                        if attempt < self.max_retries:
                            logger.warning(
                                f"{error_msg}, retrying in {self.retry_delay * (2 ** attempt)}s..."
                            )
                            await asyncio.sleep(self.retry_delay * (2**attempt))
                            continue
                        else:
                            logger.error(error_msg)
                            raise Exception(error_msg)

                    data = await response.json()
                    # Parse the response
                    api_response = EtherscanResponse(
                        status=data.get("status", "0"),
                        message=data.get("message", "Unknown"),
                        result=data.get("result"),
                    )

                    # Check for API errors
                    if api_response.status != "1":
                        if (
                            api_response.message == "No transactions found"
                            or api_response.message == "No records found"
                            or api_response.message == "No logs found"
                        ):
                            logger.info(f"No {api_response.message}")
                            return api_response

                        # Check for retryable errors
                        if self._is_retryable_error(api_response.message):
                            if attempt < self.max_retries:
                                delay = self.retry_delay * (2**attempt)
                                logger.warning(
                                    f"Retryable API error: {api_response.message}. "
                                    f"Retrying in {delay}s... (attempt {attempt + 1}/{self.max_retries + 1})"
                                )
                                await asyncio.sleep(delay)
                                continue
                            else:
                                logger.error(
                                    f"API error after {self.max_retries + 1} attempts: {api_response.message}"
                                )
                                raise Exception(f"API error: {api_response.message}")
                        else:
                            # Non-retryable error
                            logger.error(f"API error: {api_response.message}")
                            raise Exception(f"API error: {api_response.message}")

                    # For proxy calls, check different success criteria
                    if "jsonrpc" in data:
                        if data.get("jsonrpc") == "2.0":
                            api_response.result = data.get("result")
                            return api_response
                        else:
                            logger.error(f"Proxy API error: {data.get('result')}")
                            raise Exception(f"Proxy API error: {data.get('result')}")

                    return api_response

            except aiohttp.ClientError as e:
                if attempt < self.max_retries:
                    delay = self.retry_delay * (2**attempt)
                    logger.warning(
                        f"Network error: {e}. Retrying in {delay}s... (attempt {attempt + 1}/{self.max_retries + 1})"
                    )
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error(
                        f"Network error after {self.max_retries + 1} attempts: {e}"
                    )
                    raise Exception(f"Network error: {e}")

            except Exception as e:
                # For other exceptions, check if it's a timeout-related issue
                error_str = str(e).lower()
                if (
                    "timeout" in error_str or "query timeout" in error_str
                ) and attempt < self.max_retries:
                    delay = self.retry_delay * (2**attempt)
                    logger.warning(
                        f"Timeout error: {e}. Retrying in {delay}s... (attempt {attempt + 1}/{self.max_retries + 1})"
                    )
                    await asyncio.sleep(delay)
                    continue
                else:
                    raise

        # Should never reach here, but just in case
        raise Exception("Request failed after all retry attempts")

    def _is_retryable_error(self, message: str) -> bool:
        """
        Determine if an API error message indicates a retryable error.

        Args:
            message: Error message from Etherscan API

        Returns:
            True if the error is retryable, False otherwise
        """
        retryable_messages = [
            "Query Timeout occured",
            "timeout",
            "rate limit",
            "too many requests",
            "service unavailable",
            "internal server error",
            "bad gateway",
            "gateway timeout",
        ]

        message_lower = message.lower()
        return any(
            retryable_msg in message_lower for retryable_msg in retryable_messages
        )

    def _validate_chain_id(self, chain_id: int) -> bool:
        """
        Validate if chain ID is supported.

        Args:
            chain_id: Chain ID to validate
        Returns:
            True if chain ID is supported, False otherwise
        """
        return chain_id in self.supported_chains
