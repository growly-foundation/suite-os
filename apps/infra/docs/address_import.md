# Contract Address Import Feature

This document describes the contract address import feature that imports and tracks unique wallet addresses that have interacted with a smart contract.

## Overview

The contract address import feature provides a non-blocking way to:

1. **Import unique addresses** from contract transactions (both `from` and `to` fields)
2. **Process backward** from the latest block to find the most recent interactions
3. **Store raw data** in `raw.transactions` and update `raw.cursor` tables
4. **Cache results** in Redis with configurable expiration times
5. **Enable fast queries** of cached imported address lists

## Architecture

### Components

- **FastAPI Endpoints**: `/api/v1/etl/addresses/import` for import and status checking
- **Background Tasks**: Non-blocking processing using FastAPI BackgroundTasks
- **Redis Caching**: Fast storage and retrieval of results with TTL support
- **Database Storage**: Raw transaction data persisted to Iceberg tables
- **Etherscan Integration**: Uses existing modular Etherscan provider

### Data Flow

```
1. API Request → Check Redis Cache
2. If cached → Return immediate results
3. If not cached → Start background task
4. Background task → Fetch transactions from Etherscan
5. Import unique addresses → Store raw data
6. Cache results in Redis → Update task status
7. Client polls task status → Gets final results
```

## API Endpoints

### POST /api/v1/etl/addresses/import

Start a unique addresses extraction task.

**Request Body:**

```json
{
  "contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "chain_id": 8453,
  "user_limit": 100,
  "cache_ttl": 3600
}
```

**Parameters:**

- `contract_address` (required): Contract address to analyze
- `chain_id` (default: 8453): Blockchain ID (1=Ethereum, 8453=Base)
- `user_limit` (default: 100): Maximum unique addresses to return (1-10000)
- `cache_ttl` (default: 3600): Cache expiration in seconds (60-86400)

**Response (Cached):**

```json
{
  "status": "completed",
  "message": "Retrieved unique addresses from cache",
  "task_id": null,
  "contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "chain_id": 8453,
  "user_limit": 100,
  "addresses": ["0xabc123...", "0xdef456..."],
  "total_addresses": 95,
  "blocks_processed": 1250,
  "transactions_processed": 5430,
  "start_block": 12845000,
  "end_block": 12846250,
  "last_updated": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-15T11:30:00Z",
  "from_cache": true
}
```

**Response (Background Task):**

```json
{
  "status": "started",
  "message": "Address import started in the background",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "chain_id": 8453,
  "user_limit": 100,
  "from_cache": false
}
```

### GET /api/v1/etl/addresses/import/{task_id}

Get the status and results of an extraction task.

**Response (Running):**

```json
{
  "status": "running",
  "message": "Starting unique addresses extraction for 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "chain_id": 8453,
  "user_limit": 100,
  "from_cache": false
}
```

**Response (Completed):**

```json
{
  "status": "completed",
  "message": "Extracted 95 unique addresses successfully",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "chain_id": 8453,
  "user_limit": 100,
  "addresses": ["0xabc123...", "0xdef456..."],
  "total_addresses": 95,
  "blocks_processed": 1250,
  "transactions_processed": 5430,
  "start_block": 12845000,
  "end_block": 12846250,
  "last_updated": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-15T11:30:00Z",
  "from_cache": false
}
```

**Response (Failed):**

```json
{
  "status": "failed",
  "message": "Task failed: ETHERSCAN_API_KEY not set",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "contract_address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "chain_id": 8453,
  "user_limit": 100,
  "from_cache": false
}
```

## Configuration

### Environment Variables

```bash
# Required
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional Redis configuration
REDIS_URL=redis://localhost:6379/0  # Default

# Optional Iceberg/AWS configuration
ICEBERG_CATALOG=s3tablescatalog
ICEBERG_BUCKET=suite
AWS_DEFAULT_REGION=ap-southeast-1
```

### Redis Keys

The system uses structured Redis keys:

- **Unique addresses cache**: `unique_addresses:{chain_id}:{contract_address}`
- **Task status**: `task_status:{task_id}`
