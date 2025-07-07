#!/bin/bash

# Script to monitor Celery workers and tasks

echo "Celery Monitoring Dashboard"
echo "=========================="

# Set environment variables
export CELERY_BROKER_URL="${CELERY_BROKER_URL:-redis://localhost:6379/0}"
export CELERY_RESULT_BACKEND="${CELERY_RESULT_BACKEND:-redis://localhost:6379/0}"

while true; do
    clear
    echo "Celery Monitoring Dashboard - $(date)"
    echo "======================================"
    
    echo -e "\n🔍 Active Workers:"
    celery -A celeryapp inspect active 2>/dev/null || echo "No active workers found"
    
    echo -e "\n📊 Worker Stats:"
    celery -A celeryapp inspect stats 2>/dev/null || echo "No worker stats available"
    
    echo -e "\n⏳ Scheduled Tasks:"
    celery -A celeryapp inspect scheduled 2>/dev/null || echo "No scheduled tasks"
    
    echo -e "\n📋 Reserved Tasks:"
    celery -A celeryapp inspect reserved 2>/dev/null || echo "No reserved tasks"
    
    echo -e "\n🏃 Active Tasks:"
    celery -A celeryapp inspect active 2>/dev/null || echo "No active tasks"
    
    echo -e "\n💾 Redis Queue Info:"
    redis-cli llen celery 2>/dev/null && echo " messages in default queue" || echo "Redis connection failed"
    
    echo -e "\nPress Ctrl+C to exit. Refreshing in 10 seconds..."
    sleep 10
done 