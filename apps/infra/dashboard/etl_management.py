"""
ETL Management Module

Handles ETL management functionality including sync forms, status tracking, and information display.
"""

import streamlit as st
import pandas as pd
from datetime import datetime
from dashboard.config import CHAIN_IDS


def show_etl_management():
    """Display ETL management page"""
    st.markdown("## 🔄 ETL Management")
    st.markdown("Manage transaction data synchronization for addresses")

    # Initialize session state for ETL form
    if "etl_mode" not in st.session_state:
        st.session_state.etl_mode = "incremental"

    st.markdown("### 📥 Sync Transactions")

    # Mode selection and configuration
    submitted, address, chain_id, mode, time_period = _show_sync_form()

    # Handle form submission
    if submitted and address:
        _handle_sync_submission(address, chain_id, mode, time_period)

    # Information sections
    _show_information_sections()

    # Sync history
    _show_sync_history()


def _show_sync_form():
    """Display the sync configuration form"""
    # Mode selection outside the form to enable dynamic UI
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("**Configuration**")
        mode = st.selectbox(
            "Sync Mode",
            ["incremental", "full", "time_range"],
            index=["incremental", "full", "time_range"].index(
                st.session_state.etl_mode
            ),
            help="incremental: sync new data, full: complete resync, time_range: specific period",
            key="mode_selector",
        )
        st.session_state.etl_mode = mode

        # Show mode description
        if mode == "incremental":
            st.info("**Incremental Mode**\nSyncs only new transactions since last sync")
        elif mode == "full":
            st.info("**Full Mode**\nComplete resync of all historical data")
        else:
            st.info("**Time Range Mode**\nSync data for a specific time period")

    with col2:
        st.markdown("**Time Period Selection**")
        # Time period options - show for time_range mode
        time_period = None
        if mode == "time_range":
            time_period_options = {
                "Last 1 day": "1d",
                "Last 3 days": "3d",
                "Last 7 days": "7d",
                "Last 14 days": "14d",
                "Last 30 days": "30d",
                "Last 90 days": "90d",
            }

            selected_period = st.selectbox(
                "Time Period",
                list(time_period_options.keys()),
                help="Select the time period for data synchronization",
                key="time_period_selector",
            )
            time_period = time_period_options[selected_period]

            st.success(f"Selected: {selected_period} ({time_period})")
        else:
            st.info("Time period selection only available for **Time Range** mode")

    # Address and chain selection form
    with st.form("etl_form"):
        st.markdown("**Address & Chain Selection**")

        col1, col2 = st.columns(2)

        with col1:
            address = st.text_input(
                "Address",
                placeholder="0x123456789abcdef...",
                help="Contract or wallet address to sync",
            )

        with col2:
            chain_name = st.selectbox("Blockchain", list(CHAIN_IDS.keys()))
            chain_id = CHAIN_IDS[chain_name]

        # Summary of current configuration
        _show_configuration_summary(mode, chain_name, time_period)

        submitted = st.form_submit_button("🚀 Start Sync", use_container_width=True)

    return submitted, address, chain_id, mode, time_period


def _show_configuration_summary(mode, chain_name, time_period):
    """Display current configuration summary"""
    st.markdown("**Current Configuration:**")
    config_col1, config_col2, config_col3 = st.columns(3)

    with config_col1:
        st.metric("Mode", mode.title())
    with config_col2:
        st.metric("Chain", chain_name)
    with config_col3:
        if time_period:
            st.metric("Time Period", time_period)
        else:
            st.metric("Time Period", "All Time")


def _handle_sync_submission(address, chain_id, mode, time_period):
    """Handle sync form submission"""
    with st.spinner("Starting sync operation..."):
        result = st.session_state.api_client.sync_transactions(
            address, chain_id, mode, time_period
        )

    if result:
        st.success(f"✅ Sync started successfully!")

        # Add to sync history
        sync_entry = {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Address": f"{address[:10]}...{address[-8:]}",
            "Chain": (
                next(
                    (name for name, id in CHAIN_IDS.items() if id == chain_id),
                    "Unknown",
                )
            ),
            "Mode": mode.title(),
            "Time Period": time_period if time_period else "N/A",
            "Task ID": result.get("task_id", "N/A"),
            "Status": result.get("status", "Unknown").title(),
        }

        # Initialize sync history if it doesn't exist
        if "sync_history" not in st.session_state:
            st.session_state.sync_history = []

        st.session_state.sync_history.insert(0, sync_entry)  # Add to beginning
        # Keep only last 10 entries
        st.session_state.sync_history = st.session_state.sync_history[:10]

        # Display sync details in a more organized way
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Task ID", result.get("task_id", "N/A"))
        with col2:
            st.metric("Mode", result.get("mode", "N/A").title())
        with col3:
            st.metric("Status", result.get("status", "N/A").title())

        # Show full response
        with st.expander("📋 Full Response Details"):
            st.json(result)
    else:
        st.error("❌ Failed to start sync operation")


def _show_information_sections():
    """Display information sections about ETL operations"""
    st.markdown("---")
    st.markdown("### ℹ️ ETL Information")

    # Create tabs for better organization
    tab1, tab2, tab3 = st.tabs(
        ["📖 Sync Modes", "⏰ Time Periods", "💡 Best Practices"]
    )

    with tab1:
        st.markdown(
            """
        **🔄 Incremental Mode**
        - Syncs only new transactions since the last sync
        - Most efficient for regular updates
        - Recommended for addresses with existing data
        
        **🔃 Full Mode**
        - Complete resync of all historical data
        - Use when data integrity issues are suspected
        - Takes longer but ensures complete data
        
        **📅 Time Range Mode**
        - Sync data for a specific time period
        - Useful for analyzing recent activity
        - Good for testing or focused analysis
        """
        )

    with tab2:
        st.markdown(
            """
        **Available Time Periods (for Time Range mode):**
        
        | Period | Use Case |
        |--------|----------|
        | 1 day | Real-time analysis, debugging |
        | 3 days | Short-term trend analysis |
        | 7 days | Weekly patterns, recent activity |
        | 14 days | Bi-weekly analysis |
        | 30 days | Monthly trends, medium-term analysis |
        | 90 days | Quarterly analysis, long-term trends |
        """
        )

    with tab3:
        st.markdown(
            """
        **🎯 Recommendations:**
        
        **For New Addresses:**
        - Start with **Full Mode** to get complete historical data
        - Then use **Incremental Mode** for regular updates
        
        **For Existing Addresses:**
        - Use **Incremental Mode** for daily/weekly updates
        - Use **Time Range Mode** for specific period analysis
        
        **Performance Tips:**
        - Large contracts may take longer to sync
        - Consider using shorter time periods for initial testing
        - Monitor sync status for completion
        """
        )


def _show_sync_status():
    """Display sync status section"""
    st.markdown("---")
    st.markdown("### 📊 Sync Status")
    st.info(
        "💡 **Tip:** After starting a sync, you can monitor its progress through the API or check back later for completion status."
    )


def _show_sync_history():
    """Display sync history if available"""
    # Add a status section for active syncs
    _show_sync_status()

    # Optional: Add a simple sync history if we want to track multiple syncs
    if "sync_history" not in st.session_state:
        st.session_state.sync_history = []

    if st.session_state.sync_history:
        st.markdown("#### Recent Sync Operations")
        df_history = pd.DataFrame(st.session_state.sync_history)
        st.dataframe(df_history, use_container_width=True)
