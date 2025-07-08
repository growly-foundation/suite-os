"""
Wallet Analytics Module

Handles wallet analytics functionality including forms, data processing, and visualizations.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime
from dashboard.config import CHAIN_IDS, TIME_WINDOWS


def show_wallet_analytics_form():
    """Display wallet analytics input form"""
    st.markdown("## 👤 Wallet Analytics")

    # Input form
    with st.form("wallet_form"):
        col1, col2, col3 = st.columns(3)

        with col1:
            wallet_address = st.text_input(
                "Wallet Address",
                placeholder="0x123456789abcdef...",
                help="Enter a valid Ethereum/Base wallet address",
            )

        with col2:
            chain_name = st.selectbox("Blockchain", list(CHAIN_IDS.keys()))
            chain_id = CHAIN_IDS[chain_name]

        with col3:
            time_window = st.selectbox("Time Window", ["All Time"] + TIME_WINDOWS)
            time_window = None if time_window == "All Time" else time_window

        submitted = st.form_submit_button("📊 Analyze Wallet")

    return submitted, wallet_address, chain_id, time_window


def display_wallet_analytics(data):
    """Display wallet analytics visualizations"""
    interactions = data.get("interactions", [])
    first_transaction = data.get("first_transaction")
    last_transaction = data.get("last_transaction")
    total_transaction_count = data.get("total_transaction_count", 0)

    if not interactions:
        st.warning(
            "No interactions found for this wallet in the specified time window."
        )
        return

    # Convert to DataFrame
    df = pd.DataFrame(interactions)

    # Summary metrics
    _display_summary_metrics(df)

    # Transaction timeline
    _display_transaction_timeline(
        first_transaction, last_transaction, total_transaction_count
    )

    # Visualizations
    _display_wallet_visualizations(df)

    # Detailed table
    _display_detailed_interactions_table(df)


def _display_summary_metrics(df):
    """Display summary metrics section"""
    st.markdown("### 📊 Summary Metrics")
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Total Contracts", len(df))
    with col2:
        st.metric("Total Interactions", df["interaction_count"].sum())
    with col3:
        st.metric("Unique dApps", df["dapp"].nunique() if "dapp" in df.columns else 0)
    with col4:
        st.metric("Unique Categories", df["contract_category"].nunique())


def _display_transaction_timeline(
    first_transaction, last_transaction, total_transaction_count
):
    """Display transaction timeline section"""
    st.markdown("### ⏱️ Transaction Timeline")

    col1, col2, col3 = st.columns(3)

    with col1:
        # Display actual first transaction or fallback
        first_tx_display = "No data"
        if first_transaction:
            try:
                # Parse and format the datetime
                first_dt = datetime.fromisoformat(
                    first_transaction.replace("Z", "+00:00")
                )
                first_tx_display = first_dt.strftime("%Y-%m-%d %H:%M")
            except:
                first_tx_display = first_transaction[:10]  # Just date part

        st.metric(
            "First Transaction",
            first_tx_display,
            help="Earliest transaction with any contract",
        )

    with col2:
        # Display actual last transaction or fallback
        last_tx_display = "No data"
        if last_transaction:
            try:
                # Parse and format the datetime
                last_dt = datetime.fromisoformat(
                    last_transaction.replace("Z", "+00:00")
                )
                last_tx_display = last_dt.strftime("%Y-%m-%d %H:%M")
            except:
                last_tx_display = last_transaction[:10]  # Just date part

        st.metric(
            "Last Transaction",
            last_tx_display,
            help="Most recent transaction with any contract",
        )

    with col3:
        # Calculate activity period
        activity_period = "Unknown"
        if first_transaction and last_transaction:
            try:
                first_dt = datetime.fromisoformat(
                    first_transaction.replace("Z", "+00:00")
                )
                last_dt = datetime.fromisoformat(
                    last_transaction.replace("Z", "+00:00")
                )
                period_delta = last_dt - first_dt

                if period_delta.days > 0:
                    activity_period = f"{period_delta.days} days"
                elif period_delta.seconds > 3600:
                    hours = period_delta.seconds // 3600
                    activity_period = f"{hours} hours"
                else:
                    minutes = period_delta.seconds // 60
                    activity_period = f"{minutes} minutes"
            except:
                activity_period = "Cannot calculate"

        st.metric(
            "Activity Period",
            activity_period,
            help="Time span between first and last transaction",
        )

    # Add total transaction count
    col1, col2, col3 = st.columns(3)


def _display_wallet_visualizations(df):
    """Display wallet visualization charts"""
    col1, col2 = st.columns(2)

    with col1:
        # Top contracts by interactions
        st.markdown("### 🔝 Top Contracts by Interactions")
        top_contracts = df.nlargest(10, "interaction_count")

        fig = px.bar(
            top_contracts,
            x="interaction_count",
            y="contract_name",
            orientation="h",
            title="Most Interacted Contracts",
            labels={
                "interaction_count": "Interaction Count",
                "contract_name": "Contract",
            },
        )
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        # Category distribution
        st.markdown("### 📈 Category Distribution")
        category_data = (
            df.groupby("contract_category")["interaction_count"].sum().reset_index()
        )

        fig = px.pie(
            category_data,
            values="interaction_count",
            names="contract_category",
            title="Interactions by Category",
        )
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)

    # dApp analysis
    if "dapp" in df.columns and df["dapp"].notna().any():
        st.markdown("### 🎯 dApp Analysis")
        dapp_data = df.groupby("dapp")["interaction_count"].sum().reset_index()
        dapp_data = dapp_data.sort_values("interaction_count", ascending=False)

        fig = px.bar(
            dapp_data.head(10),
            x="dapp",
            y="interaction_count",
            title="Top dApps by Interactions",
            labels={"interaction_count": "Interaction Count", "dapp": "dApp"},
        )
        fig.update_xaxes(tickangle=45)
        st.plotly_chart(fig, use_container_width=True)


def _display_detailed_interactions_table(df):
    """Display detailed interactions table"""
    st.markdown("### 📋 Detailed Interactions")
    st.dataframe(
        df[
            [
                "contract_name",
                "contract_address",
                "interaction_count",
                "contract_category",
                "dapp",
            ]
        ],
        use_container_width=True,
    )
