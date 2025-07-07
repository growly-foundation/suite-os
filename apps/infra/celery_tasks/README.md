# Celery Distributed Transaction Fetching

This directory contains the Celery-based infrastructure for distributed transaction fetching from large contracts with millions of transactions.

## Overview

When dealing with large contracts (6+ million transactions), fetching all transaction data sequentially can take hours or days. This Celery-based approach distributes the work across multiple workers, dramatically reducing processing time.

### Key Components

- **`app.py`**: Celery application configuration
- **`tasks.py`**: Task definitions for fetching transaction batches
- **`coordinator.py`**: Orchestrates the distributed fetching process
- **`../celery_test_example.py`**: Example demonstrating the complete workflow

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Coordinator   │    │   Redis Broker  │    │  Celery Workers │
│                 │    │                 │    │                 │
│ • Split blocks  │───▶│ • Task queue    │───▶│ • Fetch batches │
│ • Monitor tasks │    │ • Results       │    │ • Process data  │
│ • Collect data  │◀───│ • Task status   │◀───│ • Return results│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

1. **Redis Server**: Used as message broker and result backend

   ```bash
   # Install Redis (macOS)
   brew install redis

   # Start Redis
   redis-server
   ```

2. **Python Dependencies**: Install via uv
   ```bash
   uv sync
   ```

## Quick Start

1. **Start Redis**:

   ```bash
   redis-server
   ```

2. **Start Celery Workers**:

   ```bash
   # Option 1: Use the helper script
   ./scripts/start_celery_worker.sh

   # Option 2: Manual command
   celery -A celeryapp worker --loglevel=info --concurrency=4
   ```

3. **Run the Example**:

   ```bash
   # Demo mode (shows setup without heavy processing)
   python celery_test_example.py --mode=demo

   # Full mode (runs actual distributed fetching)
   python celery_test_example.py --mode=full
   ```

4. **Monitor Progress** (optional):
   ```bash
   ./scripts/monitor_celery.sh
   ```

## Configuration

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Etherscan API
ETHERSCAN_API_KEY=your_etherscan_api_key

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Block Size Configuration

The default block size is 1,000,000 blocks per batch. You can adjust this based on:

- **Available workers**: More workers = smaller batches for better parallelization
- **Memory constraints**: Larger batches use more memory
- **API rate limits**: Smaller batches may help with rate limiting

```python
# In your code
coordinator = TransactionFetchCoordinator(block_size=500_000)  # Smaller batches
```

## Usage Examples

### Basic Usage

```python
from celery_tasks.coordinator import TransactionFetchCoordinator

# Initialize coordinator
coordinator = TransactionFetchCoordinator(block_size=1_000_000)

# Fetch transactions for a large contract
transactions = coordinator.fetch_large_contract_transactions(
    wallet_address="0x...",
    chain_id=8453,
    start_block=10_000_000,
    end_block=15_000_000,
    poll_interval=30
)

print(f"Fetched {len(transactions):,} transactions")
```

### Custom Task Configuration

```python
from celery_tasks.tasks import fetch_transaction_batch_task

# Dispatch individual batch task
result = fetch_transaction_batch_task.delay(
    wallet_address="0x...",
    chain_id=8453,
    start_block=10_000_000,
    end_block=10_999_999,
    batch_id="custom_batch_001"
)

# Get result
batch_data = result.get()
```

## Performance Optimization

### Worker Configuration

```bash
# High-performance worker setup
celery -A celeryapp worker \
    --loglevel=info \
    --concurrency=8 \
    --max-tasks-per-child=500 \
    --max-memory-per-child=1000000
```

### Scaling Workers

Run multiple workers across different machines:

```bash
# Machine 1
celery -A celeryapp worker --hostname=worker1@%h

# Machine 2
celery -A celeryapp worker --hostname=worker2@%h

# Machine 3
celery -A celeryapp worker --hostname=worker3@%h
```

## Monitoring

### Real-time Monitoring

```bash
# Worker status
celery -A celeryapp inspect active

# Task statistics
celery -A celeryapp inspect stats

# Queue length
redis-cli llen celery
```

### Flower (Web UI)

Install and run Flower for a web-based monitoring interface:

```bash
pip install flower
flower -A celeryapp --port=5555
```

Then visit `http://localhost:5555`

## Error Handling

The system includes robust error handling:

- **Automatic retries**: Failed tasks retry up to 3 times with exponential backoff
- **Task timeouts**: Tasks timeout after 30 minutes
- **Memory limits**: Workers restart after processing 1000 tasks or reaching memory limits
- **Graceful failures**: Individual batch failures don't stop the entire process

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**:

   ```bash
   # Check Redis status
   redis-cli ping
   # Should return "PONG"
   ```

2. **No Workers Available**:

   ```bash
   # Check worker status
   celery -A celeryapp inspect active
   ```

3. **Tasks Not Processing**:

   ```bash
   # Check queue length
   redis-cli llen celery
   # Purge queue if needed
   celery -A celeryapp purge
   ```

4. **Memory Issues**:
   - Reduce `block_size` in coordinator
   - Lower `--concurrency` for workers
   - Increase `--max-memory-per-child`

### Logs

Check logs for debugging:

```bash
# Worker logs (if using systemd)
journalctl -u celery-worker -f

# Application logs
tail -f logs/celery.log
```

## Integration with Existing Code

The Celery system is designed to work alongside your existing etherscan provider:

```python
# Your existing sequential code
transactions = await etherscan_provider.get_all_transactions(
    address="0x...",
    chain_id=8453
)

# New distributed approach
coordinator = TransactionFetchCoordinator()
transactions = coordinator.fetch_large_contract_transactions(
    wallet_address="0x...",
    chain_id=8453,
    start_block=start_block,
    end_block=end_block
)
```

Both approaches return the same transaction format, making migration seamless.
