"""
API Client Module

Handles all communication with the blockchain analytics FastAPI backend.
"""

import requests
import streamlit as st
from typing import Optional, Dict, Any


class APIClient:
    """Client for interacting with the blockchain analytics API"""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def test_connection(self) -> bool:
        """Test if the API is accessible"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            return response.status_code == 200
        except (requests.RequestException, requests.Timeout) as e:
            st.error(f"Error testing connection: {e}")
            return False

    def get_wallet_interactions(
        self, wallet_address: str, chain_id: int, time_window: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get wallet interactions"""
        try:
            params = {"chain_id": chain_id}
            if time_window:
                params["time_window"] = time_window

            response = requests.get(
                f"{self.base_url}/api/v1/wallet/{wallet_address}/interactions",
                params=params,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            st.error(f"Error fetching wallet interactions: {str(e)}")
            return None

    def get_contract_summary(
        self, contract_address: str, chain_id: int, time_window: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get contract summary"""
        try:
            params = {"chain_id": chain_id}
            if time_window:
                params["time_window"] = time_window

            response = requests.get(
                f"{self.base_url}/api/v1/contracts/{contract_address}/summary",
                params=params,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            st.error(f"Error fetching contract summary: {str(e)}")
            return None

    def get_contract_interacting_addresses(
        self,
        contract_address: str,
        chain_id: int,
        time_window: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Optional[Dict[str, Any]]:
        """Get addresses that interact with a contract"""
        try:
            params = {"chain_id": chain_id, "limit": limit, "offset": offset}
            if time_window:
                params["time_window"] = time_window

            response = requests.get(
                f"{self.base_url}/api/v1/contracts/{contract_address}/interactions/addresses",
                params=params,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            st.error(f"Error fetching contract addresses: {str(e)}")
            return None

    def get_contract_function_distribution(
        self,
        contract_address: str,
        chain_id: int,
        time_window: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> Optional[Dict[str, Any]]:
        """Get contract function distribution"""
        try:
            params = {"chain_id": chain_id, "limit": limit, "offset": offset}
            if time_window:
                params["time_window"] = time_window

            response = requests.get(
                f"{self.base_url}/api/v1/contracts/{contract_address}/interactions/functions",
                params=params,
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            st.error(f"Error fetching function distribution: {str(e)}")
            return None

    def sync_transactions(
        self,
        address: str,
        chain_id: int,
        mode: str = "incremental",
        time_period: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Start transaction sync"""
        try:
            payload = {"address": address, "chain_id": chain_id, "mode": mode}
            if time_period:
                payload["time_period"] = time_period

            response = requests.post(
                f"{self.base_url}/api/v1/etl/sync", json=payload, timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            st.error(f"Error starting sync: {str(e)}")
            return None
