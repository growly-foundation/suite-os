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
  - Uniswap token list: https://ipfs.io/ipns/tokens.uniswap.org

## Usage Flow

The recommended usage flow for these tools is:

1. When a user requests portfolio analysis or rebalancing suggestions, first use the `analyze_portfolio` tool to provide a comprehensive assessment
2. If the user wishes to proceed with the suggested changes, use the `rebalance_portfolio_suggestion` tool to generate a pre-filled Uniswap swap link

## Trigger Phrases

### Portfolio Analyzer Triggers:

- "Analyze my portfolio"
- "What's my risk level?"
- "Can you assess my crypto holdings?"
- "How balanced is my portfolio?"
- "Give me detailed portfolio insights"

### Portfolio Rebalancer Triggers:

- "Give me a Uniswap link to rebalance"
- "I want to rebalance my portfolio"
- "Help me diversify my crypto"
- "I want to optimize my holdings"
- "Generate a swap link"

## Sample Outputs

### Portfolio Analyzer Output

```
## Detailed Portfolio Analysis

**Total Value:** $10,450.75
**Risk Level:** High
**Stablecoin Allocation:** 12.5%
**Largest Position:** 68.3% of portfolio
**Blockchain Diversification:** 2 chain(s)
**Position Types:** 3 type(s)

### Top Holdings
- ETH: $7,134.33 (68.3%)
- USDC: $1,306.34 (12.5%)
- UNI: $1,045.08 (10.0%)
- LINK: $575.00 (5.5%)
- AAVE: $390.00 (3.7%)

### Analysis & Recommendation

I recommend swapping **1.783580 ETH** (about $1,783.58, 25% of your holdings) to **USDC**.

### Detailed Reasoning
Your portfolio currently has 68.3% concentrated in ETH, which creates significant concentration risk even for a moderate strategy.

A balanced portfolio typically avoids having any single asset exceed 30-40% of total holdings to mitigate volatility while still capturing growth.

I recommend rebalancing by moving 25% of your ETH position to USDC, which operates on the same blockchain and offers complementary exposure.

This adjustment maintains your overall market exposure while reducing the impact of potential negative price movements in ETH.

This rebalancing would optimize your portfolio based on your strategy preferences while maintaining appropriate risk exposure.
```

### Portfolio Rebalancer Output

```
## Portfolio Rebalance Recommendation

I suggest swapping **1.200000 ETH** (about $1200.00 USD) to **USDC**.

### Why make this swap?
Reducing exposure to high volatility assets to preserve capital

### Current allocation:
- ETH: $4000.00 (80.00% of portfolio)
- USDC: $1000.00 (20.00% of portfolio)

### After rebalancing (estimated):
- ETH: $2800.00
- USDC: $2200.00

You can execute this swap on Uniswap:
@https://app.uniswap.org/swap?inputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&outputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&value=1.200000&chain=ethereum
```

## Implementation Details

Both tools utilize:

1. Zerion API for fetching portfolio data
2. TokenListManager for resolving token addresses
3. Strategy-specific analysis logic for generating recommendations
4. Token price estimation to convert USD values to token amounts

## Uniswap Link Parameters

For generating Uniswap swap links, the tools use the `value` parameter which specifies the exact amount of tokens to swap:

- `inputCurrency`: The address of the token being swapped from
- `outputCurrency`: The address of the token being swapped to
- `value`: The exact amount of the input token to swap (not USD value)
- `chain`: The blockchain network to use for the swap

## Token Conversion Logic

The tools calculate actual token amounts using the following process:

1. Extract token value and percentage from Zerion data
2. Derive approximate token price by analyzing portfolio composition
3. Convert USD swap value to token amount using the estimated price
4. Display both token amount and USD value for better context

## Token Addresses

Token addresses for Uniswap links are resolved from:

1. The token data returned by Zerion API when available
2. Dynamically fetched from Superchain and Uniswap token lists
3. A fallback list of essential tokens if external sources fail

The TokenListManager handles fetching and caching token lists, with a 1-hour refresh period to ensure up-to-date token information while minimizing API calls.

## Requirements

- Zerion API access
- Valid wallet address to analyze
