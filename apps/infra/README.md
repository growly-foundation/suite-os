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

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with your API keys:
   ```
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## Command-Line Usage

The application provides a command-line interface for fetching and processing Ethereum transactions.

### Basic Usage

```bash
python main.py 0x123456789abcdef --chain-id 8453
```

This will fetch all transactions for the specified wallet address on Ethereum mainnet (chain ID 1) and store them in the Iceberg table.

### Available Options

```bash
python main.py <wallet_address> [options]
```

Options:
| Option | Description | Default |
|--------|-------------|---------|
| `--chain-id INT` | Blockchain chain ID | 8453 (Base mainnet) |
| `--mode {full,incremental}` | Fetch mode | incremental |
| `--no-read` | Skip reading table data after append | false |
| `--read-only` | Only fetch and display data without writing to Iceberg | false |
| `--catalog NAME` | AWS Glue catalog name | s3tablescatalog |
| `--bucket NAME` | S3 bucket name | suite |
| `--database NAME` | Database name | raw |
| `--table NAME` | Table name | transactions |
| `--region NAME` | AWS region | ap-southeast-1 |

### Examples

#### Incremental Processing (Default)

Fetches only new transactions since the last processed block:

```bash
python main.py 0x123456789abcdef --chain-id 1
```

#### Full Refresh

Fetches all transactions from the beginning:

```bash
python main.py 0x123456789abcdef --chain-id 1 --mode full
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
│   └── etherscan_provider.py      # Etherscan API client
└── pipelines/
    ├── __init__.py
    └── raw/
        ├── __init__.py
        ├── cursor.py              # Cursor table operations
        └── transactions.py        # Transactions table operations
```

## Programmatic Usage

### Fetching Transactions from Etherscan

```python
import asyncio
from providers.etherscan_provider import EtherscanProvider, FetchMode

async def fetch_transactions():
    provider = EtherscanProvider(api_key="your_etherscan_api_key")
    transactions = await provider.get_all_transactions_full(
        address="0x123456789abcdef",
        chain_id=1,
        mode=FetchMode.INCREMENTAL,
        last_block_number=12345678
    )
    return transactions

# Run the async function
transactions = asyncio.run(fetch_transactions())
```

### Working with Iceberg Tables

```python
from config.aws_config import initialize_catalog
from db.iceberg import load_table, append_data

# Initialize catalog
catalog = initialize_catalog("my-catalog", "my-bucket", "us-west-2")

# Load table
table = load_table(catalog, "raw", "transactions")

# Get schema
schema = table.schema().as_arrow()

# Append data
append_data(table, transactions_data, schema)
```

### Updating the Cursor

```python
from pipelines.raw.cursor import update_cursor

# Update cursor with the latest block number
update_cursor(
    catalog,
    "raw",
    chain_id=1,
    contract_address="0x123456789abcdef",
    block_number=12345678
)
```

## Design Principles

1. **Atomic Operations**: `db/iceberg.py` provides atomic operations that can be reused by any table handler
2. **Separation of Concerns**: Each module has a specific responsibility
3. **Code Reuse**: Common functionality is centralized to avoid duplication
4. **Safety First**: Always check the cursor before loading data, regardless of load type
5. **Logging**: Comprehensive logging throughout the application

# Blockchain Analytics API

A high-performance FastAPI-based analytics API for blockchain data stored in Apache Iceberg tables. This API provides comprehensive analytics for blockchain addresses, including wallet interactions, contract usage, and transaction metrics.

## Features

- **Address Analytics**: Automatic detection of address type (wallet or contract) with tailored analytics
- **Wallet Interactions**: Track how wallets interact with different contracts and dApps
- **Contract Analytics**: Comprehensive metrics for contract usage including user segments and method distribution
- **Time-Based Filtering**: Filter analytics by various time windows (24h, 7d, 30d, etc.)
- **High Performance**: Built with PyIceberg and Polars for efficient data processing
- **Modular Design**: Clean separation of concerns with dedicated modules for routes, analytics, and data access
- **ETL Operations**: API endpoints for syncing blockchain data from Etherscan to Iceberg tables
- **Shared Resources**: Efficient resource management with shared Iceberg catalog

## Tech Stack

- **FastAPI**: Modern, high-performance web framework for building APIs
- **PyIceberg**: Python implementation of Apache Iceberg for efficient table access
- **Polars**: High-performance DataFrame library for data manipulation
- **Web3.py**: Library for interacting with Ethereum nodes
- **AWS Glue**: Metadata catalog for Apache Iceberg tables
- **S3**: Storage for Apache Iceberg data files

## Installation

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Configure your environment by creating a `.env` file:
   ```
   AWS_REGION=ap-southeast-1
   ICEBERG_BUCKET=suite
   ICEBERG_CATALOG=s3tablecatalog
   WEB3_PROVIDER_URL=https://base.llamarpc.com
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

## Running the API

### Development Mode

```bash
fastapi dev main.py
```

### Production Mode

```bash
fastapi run main.py
```

### Using the Start Script

```bash
chmod +x start_api.sh
./start_api.sh
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
- `GET /api/v1/contracts/{contract_address}/interactions/functions` - Get detailed information about interactions with a specific function/method
- `POST /api/v1/contracts` - Add a contract to the standardized contracts table

#### Contract Interactions Endpoints

The `/interactions` group provides detailed analysis of contract interactions:

**`/interactions/addresses`**

- Returns a paginated list of unique addresses that have interacted with the contract
- Supports filtering by time window
- Includes interaction counts, timestamps, and value transferred
- Parameters: `chain_id`, `time_window`, `limit`, `offset`

**`/interactions/functions`**

- Returns detailed information about interactions with a specific contract function
- Requires `function` query parameter to specify the function name
- Shows which addresses called the function and their interaction patterns
- Parameters: `function` (required), `chain_id`, `time_window`, `limit`, `offset`

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

### Key Design Patterns

1. **Shared Resources**: The Iceberg catalog is initialized once during application startup and stored in `app.state` for efficient access throughout the application.

2. **Dependency Injection**: FastAPI's dependency injection system is used to provide the catalog to routes that need it.

3. **Background Tasks**: ETL operations run as background tasks to avoid blocking API requests.

4. **Modular Routes**: API endpoints are organized into domain-specific modules for better maintainability.

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
