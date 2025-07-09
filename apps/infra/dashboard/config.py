# Dashboard configuration and constants

# API Configuration
DEFAULT_API_BASE_URL = "http://localhost:8000"

# Blockchain Configuration
CHAIN_IDS = {
    "Base": 8453,
    "Ethereum": 1,
}

# Time Window Options
TIME_WINDOWS = ["24h", "48h", "7d", "14d", "30d", "90d", "180d", "365d"]

# Streamlit Page Configuration
PAGE_CONFIG = {
    "page_title": "Blockchain Analytics Dashboard",
    "page_icon": "📊",
    "layout": "wide",
    "initial_sidebar_state": "expanded",
}

# Custom CSS Styles
CUSTOM_CSS = """
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1f77b4;
    }
    .success-message {
        background-color: #d4edda;
        color: #155724;
        padding: 0.75rem;
        border-radius: 0.25rem;
        border: 1px solid #c3e6cb;
    }
    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 0.25rem;
        border: 1px solid #f5c6cb;
    }
</style>
"""
