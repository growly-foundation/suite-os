# Ethereum Transaction Processor with Apache Iceberg

This repository contains code for fetching Ethereum transaction data from Etherscan and storing it in Apache Iceberg tables. The codebase has been organized into smaller, focused modules to improve maintainability and separation of concerns.

## Overview

The application performs the following tasks:

1. Fetches transaction data from Etherscan API
2. Processes and transforms the data
3. Stores the data in Apache Iceberg tables in AWS Glue
4. Tracks the last processed block in a cursor table for incremental processing

## Prerequisites

- Python 3.8+
- AWS account with Glue catalog configured
- Etherscan API key

## Installation

1. Install `uv`: https://docs.astral.sh/uv/getting-started/installation/
2. Init project

   ```bash
   uv sync
   ```

3. Create a `.env` file with your API keys:
   ```
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## Quick start

1. Start server

```bash
uv run fastapi dev main.py
```

2. Start dashboard

```bash
uv run streamlit run dashboard.py
```

To run CLI, please check the below options

## Command-Line Usage

The application provides a command-line interface for fetching and processing Ethereum transactions.

### Basic Usage

```bash
uv run python main.py 0x123456789abcdef --chain-id 8453
```

This will fetch all transactions for the specified wallet address on Ethereum mainnet (chain ID 1) and store them in the Iceberg table.

### Available Options

```bash
uv run python main.py <wallet_address> [options]
```

Options:

| Option                                 | Description                                            | Default             |
| -------------------------------------- | ------------------------------------------------------ | ------------------- |
| `--chain-id INT`                       | Blockchain chain ID                                    | 8453 (Base mainnet) |
| `--mode {full,incremental,time_range}` | Fetch mode                                             | incremental         |
| `--time-period`                        | Time period (7d, 30d,...)                              | 7d                  |
| `--no-read`                            | Skip reading table data after append                   | false               |
| `--read-only`                          | Only fetch and display data without writing to Iceberg | false               |
| `--catalog NAME`                       | AWS Glue catalog name                                  | s3tablescatalog     |
| `--bucket NAME`                        | S3 bucket name                                         | suite               |
| `--database NAME`                      | Database name                                          | raw                 |
| `--table NAME`                         | Table name                                             | transactions        |
| `--region NAME`                        | AWS region                                             | ap-southeast-1      |

### Examples

#### Incremental Processing (Default)

Fetches only new transactions since the last processed block:

```bash
uv run python main.py 0x123456789abcdef --chain-id 1
```

#### Full Refresh

Fetches all transactions from the beginning:

```bash
uv run python main.py 0x123456789abcdef --chain-id 1 --mode full
```

#### Read-Only Mode

Fetches transactions but doesn't write to the database:

```bash
python main.py 0x123456789abcdef --chain-id 1 --read-only
```

#### Custom AWS Configuration

```bash
python main.py 0x123456789abcdef --catalog my-catalog --bucket my-bucket --region us-west-2
```

## Code Structure

The codebase is organized into the following modules:

```
.
├── db/
│   └── iceberg.py                 # Atomic Iceberg operations
├── utils/
│   ├── aws_config.py              # AWS-specific utilities
│   └── logging_config.py          # Logging configuration
├── providers/
│   └── etherscan/                 # Modular Etherscan API providers
│       ├── __init__.py            # Package exports
│       ├── base.py                # Shared base functionality
│       ├── account.py             # Account operations (txlist)
│       ├── contract.py            # Contract operations (getabi, getsourcecode)
│       ├── proxy.py               # Proxy operations (eth_blockNumber, eth_gasPrice)
│       └── provider.py            # Unified provider for backward compatibility
└── pipelines/
    ├── __init__.py
    └── raw/
        ├── __init__.py
        ├── cursor.py              # Cursor table operations
        └── transactions.py        # Transactions table operations
```

# Blockchain Analytics API

A high-performance FastAPI-based analytics API for blockchain data stored in Apache Iceberg tables. This API provides comprehensive analytics for blockchain addresses, including wallet interactions, contract usage, and transaction metrics.

## Installation

1. Install dependencies:

   ```bash
   uv sync
   ```

2. Configure your environment by creating a `.env` file:
   ```
   AWS_DEFAULT_REGION=ap-southeast-1
   ICEBERG_BUCKET=suite
   ICEBERG_CATALOG=s3tablecatalog
   WEB3_PROVIDER_URL=https://base.llamarpc.com
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## Running the API

### Development Mode

```bash
uv run fastapi dev main.py
```

### Production Mode

```bash
uv run fastapi run main.py
```

## API Endpoints

### Core Endpoints

- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/address/{address}` - Get analytics for any blockchain address (automatically detects if it's a wallet or contract)
- `GET /api/v1/debug/address/{address}` - Debug endpoint to check address normalization and contract detection

### Wallet Endpoints

- `GET /api/v1/wallet/{wallet_address}/interactions` - Get a wallet's interactions with different contracts/dApps

### Contract Endpoints

- `GET /api/v1/contracts/{contract_address}/summary` - Get comprehensive analytics for a contract
- `GET /api/v1/contracts/{contract_address}/interactions/addresses` - Get addresses that have interacted with a contract
- `GET /api/v1/contracts/{contract_address}/interactions/functions` - Get detailed information about interactions with all functions
- `POST /api/v1/contracts` - Add a contract to the standardized contracts table

#### Contract Interactions Endpoints

The `/interactions` group provides detailed analysis of contract interactions:

**`/interactions/addresses`**

- Returns a paginated list of unique addresses that have interacted with the contract
- Supports filtering by time window
- Includes interaction counts, timestamps, and value transferred
- Can filter by function name
- Parameters: `chain_id`, `time_window`, `limit`, `offset`, `function`

**`/interactions/functions`**

- Returns detailed information about interactions with all contract function
- Shows which addresses called the function and their interaction patterns
- Parameters: `chain_id`, `time_window`, `limit`, `offset`

### ETL Endpoints

- `POST /api/v1/etl/sync` - Start a background task to sync transactions for a contract or wallet address
- `GET /api/v1/etl/sync/{task_id}` - Check the status of a sync task

### Query Parameters

All analytics endpoints support the following query parameters:

- `chain_id` (int, default=1): Blockchain ID (1=Ethereum, 8453=Base, etc.)
- `time_window` (string, optional): Time window for analytics. Valid values include:
  - `24h` - Last 24 hours
  - `48h` - Last 48 hours
  - `7d` - Last 7 days
  - `14d` - Last 14 days
  - `30d` - Last 30 days
  - `90d` - Last 90 days
  - `180d` - Last 180 days
  - `365d` - Last 365 days

## Example API Requests

### Get Analytics for a Wallet Address

```bash
curl -X GET "http://localhost:8000/api/v1/wallet/0x123456789abcdef/interactions?chain_id=8453&time_window=7d"
```

### Get Analytics for a Contract Address

```bash
curl -X GET "http://localhost:8000/api/v1/contract/0xa3dcf3ca587d9929d540868c924f208726dc9ab6/summary?chain_id=8453&time_window=30d"
```

### Get Addresses Interacting with a Contract

```bash
curl -X GET "http://localhost:8000/api/v1/contracts/0xa3dcf3ca587d9929d540868c924f208726dc9ab6/interactions/addresses?chain_id=8453&limit=100&offset=0"
```

### Get Interactions with a Specific Contract Function

```bash
curl -X GET "http://localhost:8000/api/v1/contracts/0xa3dcf3ca587d9929d540868c924f208726dc9ab6/interactions/functions?function=transfer&chain_id=8453&time_window=7d&limit=50"
```

### Sync Transactions for a Contract Address

```bash
curl -X POST "http://localhost:8000/api/v1/etl/sync" \
  -H "Content-Type: application/json" \
  -d '{"address": "0xa3dcf3ca587d9929d540868c924f208726dc9ab6", "chain_id": 8453, "mode": "incremental"}'
```

### Add a Contract to the Standardized Contracts Table

```bash
curl -X POST "http://localhost:8000/api/v1/contract/contracts" \
  -H "Content-Type: application/json" \
  -d '{
    "chain_id": 8453,
    "contract_address": "0x6cb442acf35158d5eda88fe602221b67b400be3e",
    "label": "Aerodrome Router"
  }'
```

## Application Architecture

The application follows a modular architecture with clean separation of concerns:

```
.
├── api/                           # API module
│   ├── __init__.py                # FastAPI app factory with shared catalog
│   ├── dependencies.py            # FastAPI dependencies
│   ├── models/                    # Pydantic models for API
│   └── routes/                    # API route definitions
│       ├── core.py                # Core API routes
│       ├── wallet.py              # Wallet-specific routes
│       ├── contract.py            # Contract-specific routes
│       └── etl.py                 # ETL operation routes
├── analytics/                     # Analytics module
│   └── blockchain_analytics.py    # Core analytics functions
├── db/                            # Database module
│   └── iceberg.py                 # Iceberg table operations
├── static/                        # Static data
│   └── contracts.py               # Known contract addresses
├── utils/                         # Utility functions
│   ├── aws_config.py              # AWS configuration
│   ├── blockchain.py              # Blockchain utilities
│   └── logging_config.py          # Logging configuration
├── scripts/                       # Utility scripts
│   └── raw_etl.py                 # ETL script for command-line use
├── main.py                        # Legacy application entry point
├── run_api.py                     # Application entry point with shared catalog
├── start_api.sh                   # Script to start the API server
└── requirements.txt               # Project dependencies
```

## Analytics Features

### Wallet Analytics

- **Contract Interactions**: List of contracts a wallet has interacted with
- **Interaction Counts**: Number of transactions with each contract
- **Direction Analysis**: Whether interactions are incoming, outgoing, or both
- **Contract Metadata**: Name, category, and dApp for known contracts

### Contract Analytics

- **Basic Metrics**: Unique users, transaction count, total fees, total value
- **Daily Activity**: Transaction count and unique users by day
- **Top Users**: List of addresses with the most interactions
- **User Segments**: Analysis of new vs returning users
- **Method Distribution**: Breakdown of contract function calls

## Adding Known Contracts

You can add known contracts to the `static/contracts.py` file:

```python
KNOWN_CONTRACTS = {
    # Chain ID: {contract_address: contract_info}
    8453: {
        "0x6cb442acf35158d5eda88fe602221b67b400be3e": {
            "name": "Router",
            "dapp": "Aerodrome",
            "category": "DEX",
        }
        # Add more contracts here
    }
}
```

## Development

### Adding New Routes

1. Create a new route file in `api/routes/`
2. Define your routes using FastAPI
3. Import and include your router in `api/__init__.py`

### Adding New Analytics

1. Add your analytics function to `analytics/`
2. Create appropriate API routes that use your analytics function
