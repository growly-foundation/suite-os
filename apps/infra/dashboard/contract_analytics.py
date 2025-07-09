"""
Contract Analytics Module

Handles contract analytics functionality including forms, data processing, and visualizations.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from dashboard.config import CHAIN_IDS, TIME_WINDOWS


def show_contract_analytics_form():
    """Display contract analytics input form"""
    st.markdown("## 📄 Contract Analytics")

    # Input form
    with st.form("contract_form"):
        col1, col2, col3 = st.columns(3)

        with col1:
            contract_address = st.text_input(
                "Contract Address",
                placeholder="0x123456789abcdef...",
                help="Enter a valid contract address",
            )

        with col2:
            chain_name = st.selectbox("Blockchain", list(CHAIN_IDS.keys()))
            chain_id = CHAIN_IDS[chain_name]

        with col3:
            time_window = st.selectbox("Time Window", ["All Time"] + TIME_WINDOWS)
            time_window = None if time_window == "All Time" else time_window

        submitted = st.form_submit_button("📊 Analyze Contract")

    return submitted, contract_address, chain_id, time_window


def display_contract_analytics(summary_data, addresses_data, functions_data):
    """Display contract analytics visualizations"""
    basic_metrics = summary_data.get("basic_metrics", {})
    daily_activity = summary_data.get("daily_activity", [])
    top_users = summary_data.get("top_users", [])
    user_segments = summary_data.get("user_segments", [])
    method_distribution = summary_data.get("method_distribution", [])

    # Basic metrics
    _display_basic_metrics(basic_metrics)

    # Daily activity chart
    _display_daily_activity(daily_activity)

    # Charts row
    _display_users_and_segments(top_users, user_segments)

    # Function distribution
    _display_function_distribution(method_distribution)

    # Interacting addresses analysis
    _display_addresses_analysis(addresses_data)


def _display_basic_metrics(basic_metrics):
    """Display basic contract metrics"""
    st.markdown("### 📊 Basic Metrics")
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Unique Users", basic_metrics.get("unique_users", 0))
    with col2:
        st.metric("Total Transactions", basic_metrics.get("transaction_count", 0))
    with col3:
        st.metric("Total Fees (ETH)", f"{basic_metrics.get('total_fees_eth', 0):.4f}")
    with col4:
        st.metric("Total Value (ETH)", f"{basic_metrics.get('total_value_eth', 0):.4f}")


def _display_daily_activity(daily_activity):
    """Display daily activity chart"""
    if daily_activity:
        st.markdown("### 📈 Daily Activity")
        df_daily = pd.DataFrame(daily_activity)
        df_daily["block_date"] = pd.to_datetime(df_daily["block_date"])

        fig = make_subplots(
            rows=2,
            cols=1,
            subplot_titles=("Transaction Count", "Unique Users"),
            vertical_spacing=0.1,
        )

        fig.add_trace(
            go.Scatter(
                x=df_daily["block_date"],
                y=df_daily["tx_count"],
                mode="lines+markers",
                name="Transactions",
                line=dict(color="#1f77b4"),
            ),
            row=1,
            col=1,
        )

        fig.add_trace(
            go.Scatter(
                x=df_daily["block_date"],
                y=df_daily["unique_users"],
                mode="lines+markers",
                name="Unique Users",
                line=dict(color="#ff7f0e"),
            ),
            row=2,
            col=1,
        )

        fig.update_layout(height=500, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)


def _display_users_and_segments(top_users, user_segments):
    """Display top users and user segments charts"""
    col1, col2 = st.columns(2)

    with col1:
        # Top users
        if top_users:
            st.markdown("### 🔝 Top Users")
            df_users = pd.DataFrame(top_users)
            df_users["from_address_short"] = df_users["from_address"].apply(
                lambda x: f"{x[:6]}...{x[-4:]}"
            )

            fig = px.bar(
                df_users.head(10),
                x="tx_count",
                y="from_address_short",
                orientation="h",
                title="Top Users by Transaction Count",
                labels={
                    "tx_count": "Transaction Count",
                    "from_address_short": "Address",
                },
            )
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)

    with col2:
        # User segments
        if user_segments:
            st.markdown("### 👥 User Segments")
            df_segments = pd.DataFrame(user_segments)

            fig = px.pie(
                df_segments,
                values="user_count",
                names="user_type",
                title="User Type Distribution",
            )
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)


def _display_function_distribution(method_distribution):
    """Display function call distribution"""
    if method_distribution:
        st.markdown("### ⚙️ Function Call Distribution")
        df_methods = pd.DataFrame(method_distribution)

        fig = px.bar(
            df_methods.head(15),
            x="function_name",
            y="call_count",
            title="Most Called Functions",
            labels={"call_count": "Call Count", "function_name": "Function"},
        )
        fig.update_xaxes(tickangle=45)
        st.plotly_chart(fig, use_container_width=True)


def _display_addresses_analysis(addresses_data):
    """Display interacting addresses analysis"""
    if addresses_data and addresses_data.get("addresses"):
        st.markdown("### 🏠 Interacting Addresses Analysis")
        df_addresses = pd.DataFrame(addresses_data["addresses"])

        col1, col2 = st.columns(2)
        with col1:
            # Address interaction distribution
            fig = px.histogram(
                df_addresses,
                x="tx_count",
                title="Distribution of Interaction Counts",
                labels={
                    "tx_count": "Transaction Count",
                    "count": "Number of Addresses",
                },
            )
            st.plotly_chart(fig, use_container_width=True)

        with col2:
            # Value distribution
            if "total_value_eth" in df_addresses.columns:
                fig = px.box(
                    df_addresses,
                    y="total_value_eth",
                    title="Value Distribution (ETH)",
                    labels={"total_value_eth": "Total Value (ETH)"},
                )
                st.plotly_chart(fig, use_container_width=True)

        # Detailed addresses table
        st.markdown("### 📋 Top Interacting Addresses")
        df_addresses["address_short"] = df_addresses["address"].apply(
            lambda x: f"{x[:10]}...{x[-8:]}"
        )
        st.dataframe(
            df_addresses[
                [
                    "address_short",
                    "tx_count",
                    "first_interaction",
                    "last_interaction",
                    "total_value_eth",
                ]
            ].head(50),
            use_container_width=True,
        )
