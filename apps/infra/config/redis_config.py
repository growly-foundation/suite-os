"""
Redis Configuration

Configuration and connection management for Redis cache operations.
"""

import json
import os
from typing import List, Optional, Any
import redis.asyncio as redis
from config.logging_config import get_logger

logger = get_logger(__name__)


class RedisManager:
    """
    Redis connection and operations manager.

    Handles connection pooling, serialization, and common operations
    for caching unique addresses and ETL task results.
    """

    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.connected = False

    async def connect(self) -> bool:
        """
        Establish connection to Redis server.

        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

            self.client = redis.from_url(
                redis_url, encoding="utf-8", decode_responses=True, max_connections=10
            )

            # Test connection
            await self.client.ping()
            self.connected = True
            logger.info(f"Redis connected successfully to {redis_url}")
            return True

        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.connected = False
            return False

    async def disconnect(self):
        """Close Redis connection."""
        if self.client:
            await self.client.close()
            self.connected = False
            logger.info("Redis connection closed")

    async def set_json(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """
        Store JSON-serializable data in Redis.

        Args:
            key: Redis key
            value: JSON-serializable value
            ex: Expiration time in seconds

        Returns:
            bool: True if successful
        """
        try:
            if not self.connected:
                await self.connect()

            json_value = json.dumps(value, default=str)
            await self.client.set(key, json_value, ex=ex)
            return True

        except Exception as e:
            logger.error(f"Error setting Redis key {key}: {e}")
            return False

    async def get_json(self, key: str) -> Optional[Any]:
        """
        Retrieve and deserialize JSON data from Redis.

        Args:
            key: Redis key

        Returns:
            Deserialized data or None if not found
        """
        try:
            if not self.connected:
                await self.connect()

            value = await self.client.get(key)
            if value is None:
                return None

            return json.loads(value)

        except Exception as e:
            logger.error(f"Error getting Redis key {key}: {e}")
            return None

    async def delete(self, key: str) -> bool:
        """
        Delete a key from Redis.

        Args:
            key: Redis key to delete

        Returns:
            bool: True if key was deleted
        """
        try:
            if not self.connected:
                await self.connect()

            result = await self.client.delete(key)
            return result > 0

        except Exception as e:
            logger.error(f"Error deleting Redis key {key}: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """
        Check if a key exists in Redis.

        Args:
            key: Redis key to check

        Returns:
            bool: True if key exists
        """
        try:
            if not self.connected:
                await self.connect()

            result = await self.client.exists(key)
            return result > 0

        except Exception as e:
            logger.error(f"Error checking Redis key {key}: {e}")
            return False

    async def get_keys_pattern(self, pattern: str) -> List[str]:
        """
        Get all keys matching a pattern.

        Args:
            pattern: Redis key pattern (e.g., "unique_addresses:*")

        Returns:
            List of matching keys
        """
        try:
            if not self.connected:
                await self.connect()

            keys = await self.client.keys(pattern)
            return keys

        except Exception as e:
            logger.error(f"Error getting Redis keys with pattern {pattern}: {e}")
            return []

    async def keys(self, pattern: str) -> List[str]:
        """
        Get all keys matching a pattern. Alias for get_keys_pattern for compatibility.

        Args:
            pattern: Redis key pattern (e.g., "unique_addresses:*")

        Returns:
            List of matching keys
        """
        return await self.get_keys_pattern(pattern)


# Global Redis manager instance
redis_manager = RedisManager()


async def get_redis_manager() -> RedisManager:
    """
    Get the global Redis manager instance.

    Returns:
        RedisManager: Connected Redis manager
    """
    if not redis_manager.connected:
        await redis_manager.connect()
    return redis_manager


def generate_unique_addresses_key(chain_id: int, contract_address: str) -> str:
    """
    Generate a Redis key for unique addresses cache.

    Args:
        chain_id: Blockchain chain ID
        contract_address: Contract address

    Returns:
        str: Redis key for unique addresses
    """
    return f"unique_addresses:{chain_id}:{contract_address.lower()}"


def generate_task_status_key(task_id: str) -> str:
    """
    Generate a Redis key for task status.

    Args:
        task_id: Task identifier

    Returns:
        str: Redis key for task status
    """
    return f"task_status:{task_id}"
