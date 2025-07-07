#!/bin/bash

# Script to start Celery workers for transaction fetching

echo "Starting Celery worker for transaction fetching..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Error: Redis is not running. Please start Redis first:"
    echo "  redis-server"
    exit 1
fi

# Set environment variables
export CELERY_BROKER_URL="${CELERY_BROKER_URL:-redis://localhost:6379/0}"
export CELERY_RESULT_BACKEND="${CELERY_RESULT_BACKEND:-redis://localhost:6379/0}"

# Start Celery worker
celery -A celeryapp worker \
    --loglevel=info \
    --concurrency=4 \
    --queue=transaction_fetcher \
    --hostname=worker_%h \
    --max-tasks-per-child=1000 \
    --max-memory-per-child=500000 