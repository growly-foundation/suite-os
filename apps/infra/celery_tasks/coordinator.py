"""
Coordinator for distributed transaction fetching.

This module handles the orchestration of multiple Celery tasks to fetch
large amounts of transaction data efficiently across multiple workers.
"""

import asyncio
import math
import time
from typing import Dict, List, Optional, Tuple
from celery import group
from celery.result import GroupResult

from config.logging_config import get_logger
from .tasks import fetch_transaction_batch_task

logger = get_logger(__name__)


class TransactionFetchCoordinator:
    """
    Coordinates the distributed fetching of transaction data using Celery workers.

    This class handles:
    - Splitting large block ranges into manageable batches
    - Dispatching tasks to Celery workers
    - Collecting and aggregating results
    - Progress monitoring and error handling
    """

    def __init__(self, block_size: int = 1_000_000):
        """
        Initialize the coordinator.

        Args:
            block_size: Number of blocks per batch (default: 1,000,000)
        """
        self.block_size = block_size

    def create_batch_ranges(
        self, start_block: int, end_block: int
    ) -> List[Tuple[int, int, str]]:
        """
        Create batch ranges from start to end block.

        Args:
            start_block: Starting block number
            end_block: Ending block number

        Returns:
            List of tuples (start_block, end_block, batch_id)
        """
        batches = []
        current_block = start_block
        batch_number = 1

        while current_block <= end_block:
            batch_end = min(current_block + self.block_size - 1, end_block)
            batch_id = f"batch_{batch_number:04d}_{current_block}_{batch_end}"

            batches.append((current_block, batch_end, batch_id))

            current_block = batch_end + 1
            batch_number += 1

        logger.info(f"Created {len(batches)} batches with block size {self.block_size}")
        return batches

    def dispatch_batch_tasks(
        self,
        wallet_address: str,
        chain_id: int,
        batch_ranges: List[Tuple[int, int, str]],
    ) -> GroupResult:
        """
        Dispatch batch tasks to Celery workers.

        Args:
            wallet_address: The wallet/contract address
            chain_id: Blockchain chain ID
            batch_ranges: List of (start_block, end_block, batch_id) tuples

        Returns:
            GroupResult object for monitoring task progress
        """
        logger.info(f"Dispatching {len(batch_ranges)} tasks to Celery workers")

        # Create a group of tasks
        task_group = group(
            fetch_transaction_batch_task.s(
                wallet_address=wallet_address,
                chain_id=chain_id,
                start_block=start_block,
                end_block=end_block,
                batch_id=batch_id,
            )
            for start_block, end_block, batch_id in batch_ranges
        )

        # Apply the group
        group_result = task_group.apply_async()

        logger.info(f"Dispatched task group with ID: {group_result.id}")
        return group_result

    def monitor_progress(
        self, group_result: GroupResult, poll_interval: int = 30
    ) -> List[Dict]:
        """
        Monitor the progress of dispatched tasks and collect results.

        Args:
            group_result: The GroupResult from dispatch_batch_tasks
            poll_interval: How often to check progress (seconds)

        Returns:
            List of all successful batch results
        """
        total_tasks = len(group_result.results)
        logger.info(f"Monitoring {total_tasks} tasks...")

        completed_results = []
        failed_tasks = []

        while not group_result.ready():
            completed = sum(1 for result in group_result.results if result.ready())
            successful = sum(
                1 for result in group_result.results if result.successful()
            )
            failed = sum(1 for result in group_result.results if result.failed())

            logger.info(
                f"Progress: {completed}/{total_tasks} completed "
                f"({successful} successful, {failed} failed)"
            )

            time.sleep(poll_interval)

        # Collect all results
        for i, result in enumerate(group_result.results):
            try:
                if result.successful():
                    batch_data = result.get()
                    completed_results.append(batch_data)
                    logger.debug(f"Batch {i+1} completed successfully")
                else:
                    logger.error(f"Batch {i+1} failed: {result.traceback}")
                    failed_tasks.append(i + 1)
            except Exception as e:
                logger.error(f"Error getting result for batch {i+1}: {e}")
                failed_tasks.append(i + 1)

        logger.info(
            f"Collection complete: {len(completed_results)} successful, "
            f"{len(failed_tasks)} failed"
        )

        if failed_tasks:
            logger.warning(f"Failed task indices: {failed_tasks}")

        return completed_results

    def fetch_large_contract_transactions(
        self,
        wallet_address: str,
        chain_id: int,
        start_block: int,
        end_block: int,
        poll_interval: int = 30,
    ) -> List[Dict]:
        """
        Orchestrate the complete fetching process for a large contract.

        Args:
            wallet_address: The wallet/contract address
            chain_id: Blockchain chain ID
            start_block: Starting block number
            end_block: Ending block number
            poll_interval: Progress polling interval in seconds

        Returns:
            List of all transaction data across all batches
        """
        logger.info(
            f"Starting large contract fetch for {wallet_address} "
            f"from block {start_block} to {end_block}"
        )

        # Create batch ranges
        batch_ranges = self.create_batch_ranges(start_block, end_block)

        # Dispatch tasks
        group_result = self.dispatch_batch_tasks(wallet_address, chain_id, batch_ranges)

        # Monitor and collect results
        results = self.monitor_progress(group_result, poll_interval)

        # Aggregate all transactions
        all_transactions = []
        total_transactions = 0

        for batch_result in results:
            batch_transactions = batch_result.get("transactions", [])
            all_transactions.extend(batch_transactions)
            total_transactions += batch_result.get("total_count", 0)

        logger.info(
            f"Fetch complete: {total_transactions} total transactions collected "
            f"across {len(results)} batches"
        )

        return all_transactions
