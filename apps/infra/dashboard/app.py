"""
Main Dashboard Application

Orchestrates all dashboard modules and handles navigation, initialization, and API connections.
"""

import streamlit as st
from dashboard.config import PAGE_CONFIG, CUSTOM_CSS, DEFAULT_API_BASE_URL
from dashboard.api_client import APIClient
from dashboard.wallet_analytics import (
    show_wallet_analytics_form,
    display_wallet_analytics,
)
from dashboard.contract_analytics import (
    show_contract_analytics_form,
    display_contract_analytics,
)
from dashboard.etl_management import show_etl_management


def initialize_streamlit():
    """Initialize Streamlit configuration and styling"""
    # Configure page
    st.set_page_config(**PAGE_CONFIG)

    # Apply custom CSS
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


def initialize_session_state():
    """Initialize session state variables"""
    if "api_client" not in st.session_state:
        st.session_state.api_client = None
    if "api_connected" not in st.session_state:
        st.session_state.api_connected = False


def show_sidebar():
    """Display sidebar with configuration and navigation"""
    with st.sidebar:
        st.markdown("## ⚙️ Configuration")

        # API Configuration
        api_url = st.text_input(
            "API Base URL",
            value=DEFAULT_API_BASE_URL,
            help="URL of your FastAPI analytics server",
        )

        if st.button("🔗 Connect to API"):
            client = APIClient(api_url)
            if client.test_connection():
                st.session_state.api_client = client
                st.session_state.api_connected = True
                st.success("✅ Connected to API successfully!")
            else:
                st.session_state.api_connected = False
                st.error(
                    "❌ Could not connect to API. Please check the URL and ensure the server is running."
                )

        # Connection status
        if st.session_state.api_connected:
            st.markdown(
                '<div class="success-message">🟢 API Connected</div>',
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                '<div class="error-message">🔴 API Disconnected</div>',
                unsafe_allow_html=True,
            )

        st.markdown("---")

        # Navigation
        st.markdown("## 📋 Navigation")
        page = st.selectbox(
            "Choose a page",
            [
                "🏠 Home",
                "👤 Wallet Analytics",
                "📄 Contract Analytics",
                "🔄 ETL Management",
            ],
            index=0,
        )

    return page


def show_home_page():
    """Display the home page with overview"""
    st.markdown("## 🏠 Dashboard Overview")
    st.markdown(
        """
    Welcome to the Blockchain Analytics Dashboard! This tool provides comprehensive analytics
    for blockchain addresses, contracts, and transaction data.
    """
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown(
            """
        ### 👤 Wallet Analytics
        - Analyze wallet interactions with contracts
        - View contract interaction history
        - Identify frequently used dApps
        """
        )

    with col2:
        st.markdown(
            """
        ### 📄 Contract Analytics
        - Comprehensive contract metrics
        - User activity analysis
        - Function call distribution
        - Top users and segments
        """
        )

    with col3:
        st.markdown(
            """
        ### 🔄 ETL Management
        - Sync transaction data
        - Monitor data processing
        - Manage data pipelines
        """
        )

    st.markdown("---")
    st.markdown("### 🚀 Quick Start")
    st.markdown(
        """
    1. **Wallet Analysis**: Enter a wallet address to see its interaction patterns
    2. **Contract Analysis**: Analyze contract usage, users, and function calls
    3. **Data Management**: Sync new transaction data for analysis
    """
    )


def show_wallet_analytics():
    """Handle wallet analytics page"""
    submitted, wallet_address, chain_id, time_window = show_wallet_analytics_form()

    if submitted and wallet_address:
        with st.spinner("Fetching wallet data..."):
            data = st.session_state.api_client.get_wallet_interactions(
                wallet_address, chain_id, time_window
            )

        if data:
            display_wallet_analytics(data)


def show_contract_analytics():
    """Handle contract analytics page"""
    submitted, contract_address, chain_id, time_window = show_contract_analytics_form()

    if submitted and contract_address:
        with st.spinner("Fetching contract data..."):
            # Fetch all contract data
            summary_data = st.session_state.api_client.get_contract_summary(
                contract_address, chain_id, time_window
            )
            addresses_data = (
                st.session_state.api_client.get_contract_interacting_addresses(
                    contract_address, chain_id, time_window, limit=200
                )
            )
            functions_data = (
                st.session_state.api_client.get_contract_function_distribution(
                    contract_address, chain_id, time_window, limit=100
                )
            )

        if summary_data:
            display_contract_analytics(summary_data, addresses_data, functions_data)


def check_api_connection():
    """Check if API is connected and show warning if not"""
    if not st.session_state.api_connected:
        st.warning("⚠️ Please connect to the API first using the sidebar configuration.")
        st.markdown(
            """
        ### Getting Started
        1. Ensure your FastAPI analytics server is running
        2. Enter the correct API URL in the sidebar (default: http://localhost:8000)
        3. Click "Connect to API" to establish connection
        4. Start exploring your blockchain analytics data!
        """
        )
        return False
    return True


def main():
    """Main dashboard application"""
    # Initialize Streamlit and session state
    initialize_streamlit()
    initialize_session_state()

    # Header
    st.markdown(
        '<h1 class="main-header">🔗 Blockchain Analytics Dashboard</h1>',
        unsafe_allow_html=True,
    )

    # Show sidebar and get selected page
    page = show_sidebar()

    # Check API connection for pages that need it
    if page != "🏠 Home" and not check_api_connection():
        return

    # Route to appropriate page
    if page == "🏠 Home":
        show_home_page()
    elif page == "👤 Wallet Analytics":
        show_wallet_analytics()
    elif page == "📄 Contract Analytics":
        show_contract_analytics()
    elif page == "🔄 ETL Management":
        show_etl_management()


if __name__ == "__main__":
    main()
