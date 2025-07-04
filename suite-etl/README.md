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
from utils.aws_config import initialize_catalog
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
