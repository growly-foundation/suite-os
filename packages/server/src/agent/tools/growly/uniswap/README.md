# Uniswap Portfolio Analysis and Rebalance Tools

This package provides specialized tools for analyzing crypto portfolios and suggesting optimized rebalancing strategies with Uniswap integration.

## Tools

### 1. Portfolio Analyzer

The `analyze_portfolio` tool provides in-depth analysis of a user's crypto portfolio with detailed reasoning and personalized recommendations:

- Performs comprehensive portfolio risk assessment
- Analyzes asset allocation and diversification
- Identifies portfolio imbalances and concentration risks
- Provides detailed explanations for recommended changes
- Delivers customized insights based on the user's chosen strategy
- Generates rebalancing suggestions with actual token amounts
- Displays recommendations with USD values and percentages for context

### 2. Portfolio Rebalancer

The `rebalance_portfolio_suggestion` tool provides actionable rebalance recommendations with pre-filled Uniswap links:

- Analyzes portfolio holdings using data from Zerion API
- Provides tailored recommendations based on different risk strategies
- Calculates exact token amounts to swap based on USD values
- Generates pre-filled Uniswap swap links with exact token quantities
- Supports multiple chains including Ethereum, Polygon, Arbitrum, and Optimism
- Dynamically fetches token addresses from standard token lists:
  - Superchain token list: https://static.optimism.io/optimism.tokenlist.json
  - Uses fallback addresses for common tokens if lists are unavailable

### 3. Liquidity Provider

The `provide_liquidity_suggestion` tool helps users earn passive income by providing liquidity to Uniswap pools:

- Analyzes portfolio to find optimal token pairs for liquidity provision
- Recommends balanced liquidity positions tailored to user's risk preferences
- Prioritizes popular trading pairs (ETH/stablecoin) and high-volume pools
- Calculates exact token amounts needed for balanced 50/50 pools
- Generates pre-filled Uniswap V4 position creation links
- Provides comprehensive liquidity plans that may include initial rebalancing
- Fetches real-time pool data using Uniswap V4 SDK and viem including:
  - Actual pool APR based on fees and volume
  - Current Total Value Locked (TVL)
  - 24-hour trading volume
  - Risk assessment based on real pool metrics
- Falls back to estimated values when real-time data is unavailable
- Offers complete step-by-step guidance for users new to providing liquidity

## Architecture

The tools utilize several specialized components:

### TokenListManager

- Fetches and caches token addresses from common token lists
- Provides fallback addresses for popular tokens
- Handles cross-chain token address resolution

### PoolDataFetcher

- Interfaces with Uniswap V4 pools using the V4 SDK
- Connects to multiple EVM chains using viem
- Retrieves on-chain data for accurate pool metrics
- Calculates APR, TVL, and volume from real pool data
- Supports Ethereum, Optimism, Arbitrum, Base, and Polygon

## Usage Flow

The tools can be used together for a complete DeFi strategy:

1. First use the `analyze_portfolio` tool to provide a comprehensive assessment
2. If rebalancing is needed, use the `rebalance_portfolio_suggestion` tool for optimal token allocation
3. For users interested in passive income, use the `provide_liquidity_suggestion` tool to identify and set up optimal liquidity positions

## Trigger Phrases

### Portfolio Analyzer Triggers:

- "Analyze my portfolio"
- "What's my risk level?"
- "Can you assess my crypto holdings?"

### Portfolio Rebalancer Triggers:

- "How should I rebalance my portfolio?"
- "Suggest some trades to optimize my holdings"
- "Help me diversify my crypto assets"

### Liquidity Provider Triggers:

- "How can I earn passive income with my crypto?"
- "Suggest liquidity pairs for my portfolio"
- "Help me provide liquidity on Uniswap"
- "What's the best way to earn fees on my tokens?"

## Sample Outputs

### Portfolio Analyzer Output

```

```
