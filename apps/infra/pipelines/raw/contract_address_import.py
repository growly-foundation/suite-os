"""
Contract Address Import Pipeline

ETL pipeline for importing and tracking unique addresses that have interacted
with a smart contract. Processes transactions in reverse chronological order
to find the most recent unique addresses that interacted with the contract.

Architecture:
- ContractAddressImporter: Main orchestrator class with configurable constants
- Helper methods break down the complex import process into focused responsibilities:
  * _initialize_tables(): Setup and validation of Iceberg tables
  * _get_cursor_info(): Retrieve cursor information for logging
  * _fetch_transaction_batches(): Core batch fetching with early stopping
  * _store_transactions(): Safe transaction storage in Iceberg
  * _update_import_cursor(): Cursor updates with proper block range handling
  * import_addresses(): Main orchestration method

Configuration:
- BATCH_SIZE: Transactions per API batch (default: 1000)
- MAX_BATCHES: Maximum batches to prevent infinite loops (default: 50)
- RATE_LIMIT_DELAY: Delay between API calls in seconds (default: 0.2)
- MIN_BLOCK_THRESHOLD: Stop if reaching early blockchain blocks (default: 1)

Features:
- Duplicate task prevention with race condition handling
- Early stopping when user limit is reached
- Descending order processing (most recent transactions first)
- Comprehensive error handling and logging
- Redis caching with configurable TTL
- Incremental cursor updates for proper block range tracking
"""

import asyncio
from typing import List, Dict, Set, Optional, Tuple
from datetime import datetime, timezone
from dataclasses import dataclass

import aiohttp
from config.logging_config import get_logger
from config.redis_config import RedisManager, generate_unique_addresses_key
from pipelines.raw.cursor import get_cursor, update_cursor
from pipelines.raw.transactions import load_transactions_with_safety
from providers.etherscan import EtherscanProvider, FetchMode
from db.iceberg import load_table, reorder_records
from utils.blockchain import extract_block_range

logger = get_logger(__name__)


@dataclass
class ContractAddressImportResult:
    """Result data class for contract address import."""

    addresses: List[str]
    total_addresses: int
    blocks_processed: int
    transactions_processed: int
    start_block: int
    end_block: int
    last_updated: datetime
    expires_at: Optional[datetime] = None


class ContractAddressImporter:
    """
    Imports unique addresses from contract transaction history.

    Processes transactions in reverse chronological order (latest first)
    to identify the most recent unique addresses that have interacted
    with a specific smart contract.
    """

    # Configuration constants
    BATCH_SIZE = 5000  # Transactions per batch
    MAX_BATCHES = 50  # Maximum batches to prevent infinite loops
    RATE_LIMIT_DELAY = 0.2  # Delay between API calls in seconds
    MIN_BLOCK_THRESHOLD = 1  # Stop if we reach this early in blockchain history

    def __init__(
        self, redis_manager: RedisManager, etherscan_provider: EtherscanProvider
    ):
        self.redis = redis_manager
        self.etherscan = etherscan_provider
        self.unique_addresses: Set[str] = set()
        self.processed_blocks = 0
        self.processed_transactions = 0

    def extract_addresses_from_transactions(self, transactions: List[Dict]) -> Set[str]:
        """
        Extract unique addresses from a list of transactions.

        Args:
            transactions: List of transaction dictionaries

        Returns:
            Set of unique addresses (from + to)
        """
        addresses = set()

        for tx in transactions:
            # Add 'from' address
            if tx.get("from"):
                addresses.add(tx["from"].lower())

            # Add 'to' address
            if tx.get("to"):
                addresses.add(tx["to"].lower())

        return addresses

    async def process_transaction_batch(
        self, transactions: List[Dict], user_limit: int, contract_address: str
    ) -> bool:
        """
        Process a batch of transactions and update unique addresses.

        Note: Transactions are expected to be in descending order (newest first)
        when called from import_addresses method using descending fetch.

        Args:
            transactions: List of transactions to process (should be in desc order)
            user_limit: Maximum number of unique addresses to collect
            contract_address: Contract address to filter (normalize case)

        Returns:
            bool: True if limit reached, False to continue processing
        """
        if not transactions:
            return False

        # Transactions are already in descending order from the API call

        contract_addr_lower = contract_address.lower()

        for tx in transactions:
            self.processed_transactions += 1

            # Extract addresses from this transaction
            tx_addresses = self.extract_addresses_from_transactions([tx])

            # Remove contract address from the set (we want users, not the contract)
            tx_addresses.discard(contract_addr_lower)

            # Add new addresses to our unique set
            new_addresses = tx_addresses - self.unique_addresses
            self.unique_addresses.update(new_addresses)

            if len(new_addresses) > 0:
                logger.debug(
                    f"Block {tx.get('block_number')}: Found {len(new_addresses)} new addresses. "
                    f"Total unique: {len(self.unique_addresses)}"
                )

            # Check if we've reached the limit
            if len(self.unique_addresses) >= user_limit:
                logger.info(f"Reached user limit of {user_limit} unique addresses")
                return True

        return False

    async def _initialize_tables(
        self, catalog, task_id: str
    ) -> Tuple[Optional[object], Optional[object]]:
        """
        Initialize and validate Iceberg tables.

        Args:
            catalog: Iceberg catalog
            task_id: Task identifier for logging

        Returns:
            Tuple of (transactions_table, cursor_table) or (None, None) if failed
        """
        if not catalog:
            return None, None

        try:
            transactions_table = load_table(catalog, "raw", "transactions")
            cursor_table = load_table(catalog, "raw", "cursor")

            if not transactions_table or not cursor_table:
                logger.error(f"Task {task_id}: Failed to load tables")
                return None, None

            return transactions_table, cursor_table
        except Exception as e:
            logger.error(f"Task {task_id}: Error loading tables: {e}")
            return None, None

    async def _get_cursor_info(
        self, cursor_table, chain_id: int, contract_address: str, task_id: str
    ) -> Optional[int]:
        """
        Get cursor information for the contract.

        Args:
            cursor_table: Iceberg cursor table
            chain_id: Blockchain chain ID
            contract_address: Contract address
            task_id: Task identifier for logging

        Returns:
            Last processed block number or None if not found
        """
        if not cursor_table:
            return None

        try:
            cursor_data = get_cursor(cursor_table, chain_id, contract_address)
            if cursor_data:
                _, end_block = cursor_data
                last_processed_block = int(end_block)
                logger.info(
                    f"Task {task_id}: Found cursor with last processed block {last_processed_block}"
                )
                return last_processed_block
        except (ValueError, TypeError):
            logger.warning(f"Task {task_id}: Invalid cursor data: {cursor_data}")

        return None

    async def _fetch_transaction_batches(
        self, contract_address: str, chain_id: int, user_limit: int, task_id: str
    ) -> Tuple[List[Dict], Optional[int], Optional[int], bool]:
        """
        Fetch transaction batches with early stopping when user limit is reached.

        Args:
            contract_address: Contract address to fetch transactions for
            chain_id: Blockchain chain ID
            user_limit: Maximum number of unique addresses to collect
            task_id: Task identifier for logging

        Returns:
            Tuple of (all_transactions, highest_block, lowest_block, limit_reached)
        """
        all_transactions = []
        highest_block = None
        lowest_block = None
        limit_reached = False

        # For address import operations, we always want to search from latest backwards
        # regardless of cursor state - the goal is to find unique addresses, not sync new data
        current_end_block = "latest"
        current_start_block = (
            0  # Always start from genesis for comprehensive address discovery
        )

        logger.info(
            f"Task {task_id}: Starting address import from latest block backwards to find {user_limit} unique addresses"
        )

        batch_count = 0

        try:
            # Create HTTP session for batch fetching
            async with aiohttp.ClientSession() as session:
                while (
                    len(self.unique_addresses) < user_limit
                    and batch_count < self.MAX_BATCHES
                ):
                    logger.info(
                        f"Task {task_id}: Fetching batch {batch_count + 1} from {current_start_block} to {current_end_block} "
                        f"(current unique addresses: {len(self.unique_addresses)})"
                    )

                    try:
                        # Fetch batch using descending order
                        account_provider = self.etherscan.account
                        batch = await account_provider.fetch_transaction_batch(
                            session=session,
                            address=contract_address,
                            chain_id=chain_id,
                            start_block=current_start_block,
                            end_block=current_end_block,
                            limit=self.BATCH_SIZE,
                            sort="desc",  # Most recent transactions first
                        )

                        if not batch.transactions:
                            logger.info(
                                f"Task {task_id}: No more transactions found, stopping"
                            )
                            break

                        # Process this batch immediately for early stopping
                        limit_reached = await self.process_transaction_batch(
                            batch.transactions, user_limit, contract_address
                        )

                        # Store all transactions for database storage
                        all_transactions.extend(batch.transactions)
                        batch_count += 1

                        # Update block range tracking
                        if batch.transactions:
                            batch_lowest, batch_highest = extract_block_range(
                                batch.transactions
                            )

                            if highest_block is None or (
                                batch_highest and batch_highest > highest_block
                            ):
                                highest_block = batch_highest
                            if lowest_block is None or (
                                batch_lowest and batch_lowest < lowest_block
                            ):
                                lowest_block = batch_lowest

                        logger.info(
                            f"Task {task_id}: Batch {batch_count}: Found {batch.total_count} transactions, "
                            f"highest block: {batch.last_block_number}. "
                            f"Unique addresses so far: {len(self.unique_addresses)}"
                        )

                        # Early stopping if we've reached the limit
                        if limit_reached:
                            logger.info(
                                f"Task {task_id}: Reached user limit of {user_limit} addresses, stopping early. "
                                f"Processed {len(all_transactions)} transactions from {batch_count} batches."
                            )
                            break

                        # Check if we should continue fetching
                        should_continue = (
                            len(self.unique_addresses) < user_limit
                            and batch.total_count > 0
                            and batch_count < self.MAX_BATCHES
                        )

                        # Handle small batches
                        if batch.total_count < self.BATCH_SIZE:
                            if should_continue and batch.transactions:
                                logger.info(
                                    f"Task {task_id}: Small batch ({batch.total_count} transactions) but continuing "
                                    f"to search for more unique addresses. Current: {len(self.unique_addresses)}/{user_limit}"
                                )
                            else:
                                logger.info(
                                    f"Task {task_id}: Last batch ({batch.total_count} transactions). "
                                    f"Stopping - found {len(self.unique_addresses)} unique addresses."
                                )
                                break

                        # Prepare next batch range
                        if batch.transactions:
                            oldest_block = int(batch.transactions[-1]["block_number"])

                            # Safety check for very early blocks
                            if oldest_block <= self.MIN_BLOCK_THRESHOLD:
                                logger.info(
                                    f"Task {task_id}: Reached early blockchain blocks (block {oldest_block}). "
                                    f"Stopping search with {len(self.unique_addresses)} unique addresses."
                                )
                                break

                            current_end_block = str(oldest_block - 1)
                            logger.debug(
                                f"Task {task_id}: Next batch will fetch up to block {current_end_block}"
                            )
                        else:
                            logger.warning(
                                f"Task {task_id}: Batch has no transactions despite passing checks"
                            )
                            break

                        # Rate limiting
                        await asyncio.sleep(self.RATE_LIMIT_DELAY)

                    except Exception as e:
                        logger.error(
                            f"Task {task_id}: Error in batch {batch_count + 1}: {e}"
                        )
                        break

        except Exception as e:
            logger.error(f"Task {task_id}: Error during batch fetching: {e}")
            raise

        return all_transactions, highest_block, lowest_block, limit_reached

    async def _store_transactions(
        self,
        catalog,
        transactions_table,
        transactions: List[Dict],
        chain_id: int,
        contract_address: str,
        task_id: str,
    ) -> bool:
        """
        Store transactions in Iceberg table.

        Enhanced with smart duplicate detection for contract address imports:
        - Skips storage when the same block range has already been processed
        - Prevents unnecessary UPSERT operations that cause blocking
        - Uses retry logic for legitimate storage operations

        Args:
            catalog: Iceberg catalog
            transactions_table: Iceberg transactions table
            transactions: List of transactions to store
            chain_id: Blockchain chain ID
            contract_address: Contract address
            task_id: Task identifier for logging

        Returns:
            True if successful (including skipped duplicates), False otherwise
        """
        if not catalog or not transactions_table or not transactions:
            return True  # Nothing to store is considered success

        try:
            # Check if this block range has already been processed
            from utils.blockchain import extract_block_range

            lowest_block, highest_block = extract_block_range(transactions)

            if lowest_block is not None and highest_block is not None:
                # Check for existing data coverage
                from pipelines.raw.cursor import check_for_data_overlap

                has_overlap = check_for_data_overlap(
                    catalog,
                    "raw",
                    chain_id,
                    contract_address,
                    lowest_block,
                    highest_block,
                )

                if has_overlap:
                    logger.info(
                        f"Task {task_id}: Skipping transaction storage - block range "
                        f"[{lowest_block}, {highest_block}] already processed for contract {contract_address}. "
                        f"Contract address import operations don't need duplicate transaction data."
                    )
                    return True  # Skip storage, but return success

        except Exception as e:
            logger.warning(
                f"Task {task_id}: Could not check for duplicates: {e}, proceeding with storage"
            )

        # Retry configuration
        max_retries = 3
        base_delay = 2  # seconds (longer delay for transaction storage)

        for attempt in range(max_retries):
            try:
                logger.info(
                    f"Task {task_id}: Storing {len(transactions)} transactions to database (attempt {attempt + 1}/{max_retries})"
                )

                schema = transactions_table.schema()
                transactions_data = reorder_records(transactions, schema)

                success = load_transactions_with_safety(
                    catalog, "raw", chain_id, contract_address, transactions_data
                )

                if success:
                    logger.info(f"Task {task_id}: Successfully stored transactions")
                    return True
                else:
                    logger.warning(
                        f"Task {task_id}: Transaction storage attempt {attempt + 1} returned False"
                    )

                    if attempt < max_retries - 1:
                        delay = base_delay * (2**attempt) + (attempt * 0.2)
                        logger.info(
                            f"Task {task_id}: Retrying transaction storage in {delay:.1f} seconds..."
                        )
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            f"Task {task_id}: Failed to store transactions after {max_retries} attempts"
                        )
                        return False

            except Exception as e:
                logger.warning(
                    f"Task {task_id}: Transaction storage attempt {attempt + 1} failed: {e}"
                )

                if attempt < max_retries - 1:
                    delay = base_delay * (2**attempt) + (attempt * 0.2)
                    logger.info(
                        f"Task {task_id}: Retrying transaction storage in {delay:.1f} seconds..."
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error(
                        f"Task {task_id}: Failed to store transactions after {max_retries} attempts"
                    )
                    return False

        return False

    async def _update_import_cursor(
        self,
        catalog,
        cursor_table,
        chain_id: int,
        contract_address: str,
        highest_block: Optional[int],
        lowest_block: Optional[int],
        task_id: str,
    ) -> bool:
        """
        Update cursor with import progress.

        Enhanced with smart duplicate detection:
        - Skips cursor updates when the same block range has already been processed
        - Uses retry logic with exponential backoff for legitimate updates
        - Prevents unnecessary database operations that cause blocking

        Args:
            catalog: Iceberg catalog
            cursor_table: Iceberg cursor table
            chain_id: Blockchain chain ID
            contract_address: Contract address
            highest_block: Highest block number processed
            lowest_block: Lowest block number processed
            task_id: Task identifier for logging

        Returns:
            True if successful (including skipped duplicates), False otherwise
        """
        if not catalog or not cursor_table or not highest_block or not lowest_block:
            if catalog and cursor_table:
                logger.warning(
                    f"Task {task_id}: Cannot update cursor - missing block range data "
                    f"(highest_block={highest_block}, lowest_block={lowest_block})"
                )
            return False

        try:
            # Check if this exact block range has already been processed
            from pipelines.raw.cursor import get_cursor

            existing_cursor = get_cursor(cursor_table, chain_id, contract_address)

            if existing_cursor:
                existing_start, existing_end = existing_cursor
                try:
                    existing_start_int = int(existing_start)
                    existing_end_int = int(existing_end)

                    # Check if current range is already covered by existing cursor
                    if (
                        lowest_block >= existing_start_int
                        and highest_block <= existing_end_int
                    ):
                        logger.info(
                            f"Task {task_id}: Skipping cursor update - block range "
                            f"[{lowest_block}, {highest_block}] already covered by existing cursor "
                            f"[{existing_start_int}, {existing_end_int}] for contract {contract_address}"
                        )
                        return True  # Skip update, but return success

                except (ValueError, TypeError):
                    logger.warning(
                        f"Task {task_id}: Invalid existing cursor data, proceeding with update"
                    )

        except Exception as e:
            logger.warning(
                f"Task {task_id}: Could not check existing cursor: {e}, proceeding with update"
            )

        # Retry configuration
        max_retries = 3
        base_delay = 1  # seconds

        for attempt in range(max_retries):
            try:
                logger.info(
                    f"Task {task_id}: Updating cursor with discovered block range: "
                    f"start_block={lowest_block}, end_block={highest_block} (attempt {attempt + 1}/{max_retries})"
                )

                await update_cursor(
                    catalog,
                    "raw",
                    chain_id,
                    contract_address,
                    highest_block,
                    start_block=lowest_block,
                )

                logger.info(
                    f"Task {task_id}: Updated cursor to block range {lowest_block} to {highest_block}"
                )
                return True

            except Exception as e:
                logger.warning(
                    f"Task {task_id}: Cursor update attempt {attempt + 1} failed: {e}"
                )

                if attempt < max_retries - 1:
                    # Exponential backoff with jitter
                    delay = base_delay * (2**attempt) + (attempt * 0.1)
                    logger.info(
                        f"Task {task_id}: Retrying cursor update in {delay:.1f} seconds..."
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error(
                        f"Task {task_id}: Failed to update cursor after {max_retries} attempts"
                    )
                    return False

    async def import_addresses(
        self,
        chain_id: int,
        contract_address: str,
        user_limit: int = 100,
        catalog=None,
        task_id: str = None,
    ) -> ContractAddressImportResult:
        """
        Import unique addresses by fetching transactions in reverse chronological order.

        This method orchestrates the entire address import process by delegating
        specific responsibilities to focused helper methods.

        Args:
            chain_id: Blockchain chain ID
            contract_address: Contract address to analyze
            user_limit: Maximum number of unique addresses to return
            catalog: Iceberg catalog for storing raw data
            task_id: Task identifier for logging

        Returns:
            ContractAddressImportResult with imported addresses and metadata
        """
        logger.info(f"Task {task_id}: Starting contract address import")
        logger.info(
            f"Contract: {contract_address}, Chain: {chain_id}, Limit: {user_limit}"
        )

        start_time = datetime.now(timezone.utc)
        self.unique_addresses.clear()
        self.processed_blocks = 0
        self.processed_transactions = 0

        # Initialize tables
        transactions_table, cursor_table = await self._initialize_tables(
            catalog, task_id
        )
        if catalog and (not transactions_table or not cursor_table):
            raise RuntimeError("Failed to initialize database tables")

        # Get cursor information (for logging purposes)
        last_processed_block = await self._get_cursor_info(
            cursor_table, chain_id, contract_address, task_id
        )
        if last_processed_block is not None:
            logger.info(
                f"Task {task_id}: Previous cursor found (block {last_processed_block}) but searching full history for comprehensive address discovery"
            )

        # Fetch transaction batches with early stopping
        try:
            all_transactions, highest_block, lowest_block, limit_reached = (
                await self._fetch_transaction_batches(
                    contract_address, chain_id, user_limit, task_id
                )
            )

            if not all_transactions:
                logger.info(f"Task {task_id}: No transactions found")
                return ContractAddressImportResult(
                    addresses=[],
                    total_addresses=0,
                    blocks_processed=0,
                    transactions_processed=0,
                    start_block=0,
                    end_block=0,
                    last_updated=start_time,
                )

            # Store transactions in database
            await self._store_transactions(
                catalog,
                transactions_table,
                all_transactions,
                chain_id,
                contract_address,
                task_id,
            )

            # Calculate processed blocks
            self.processed_blocks = (
                highest_block - lowest_block + 1
                if highest_block and lowest_block
                else 0
            )

            logger.info(
                f"Task {task_id}: Import complete. "
                f"Found {len(self.unique_addresses)} unique addresses "
                f"from {len(all_transactions)} transactions "
                f"across {self.processed_blocks} blocks"
            )

        except Exception as e:
            logger.error(f"Task {task_id}: Error during import process: {e}")
            raise

        # Update cursor with import progress
        await self._update_import_cursor(
            catalog,
            cursor_table,
            chain_id,
            contract_address,
            highest_block,
            lowest_block,
            task_id,
        )

        # Convert set to sorted list
        unique_addresses_list = list(self.unique_addresses)

        # Create and return result
        result = ContractAddressImportResult(
            addresses=unique_addresses_list,
            total_addresses=len(unique_addresses_list),
            blocks_processed=self.processed_blocks,
            transactions_processed=self.processed_transactions,
            start_block=lowest_block or 0,
            end_block=highest_block or 0,
            last_updated=start_time,
        )

        return result

    async def import_addresses_fast(
        self,
        chain_id: int,
        contract_address: str,
        user_limit: int = 100,
        task_id: str = None,
    ) -> ContractAddressImportResult:
        """
        Fast address import that prioritizes speed by skipping database operations.

        This method focuses only on extracting unique addresses and returns immediately
        after address discovery is complete, without waiting for database persistence.
        Database operations should be handled separately for better API responsiveness.

        Args:
            chain_id: Blockchain chain ID
            contract_address: Contract address to analyze
            user_limit: Maximum number of unique addresses to return
            task_id: Task identifier for logging

        Returns:
            ContractAddressImportResult with imported addresses and basic metadata
        """
        logger.info(f"Task {task_id}: Starting fast contract address import")
        logger.info(
            f"Contract: {contract_address}, Chain: {chain_id}, Limit: {user_limit}"
        )

        start_time = datetime.now(timezone.utc)
        self.unique_addresses.clear()
        self.processed_blocks = 0
        self.processed_transactions = 0

        # Fetch transaction batches with early stopping (no database dependency)
        try:
            all_transactions, highest_block, lowest_block, limit_reached = (
                await self._fetch_transaction_batches(
                    contract_address, chain_id, user_limit, task_id
                )
            )

            if not all_transactions:
                logger.info(f"Task {task_id}: No transactions found")
                return ContractAddressImportResult(
                    addresses=[],
                    total_addresses=0,
                    blocks_processed=0,
                    transactions_processed=0,
                    start_block=0,
                    end_block=0,
                    last_updated=start_time,
                )

            # Calculate processed blocks
            self.processed_blocks = (
                highest_block - lowest_block + 1
                if highest_block and lowest_block
                else 0
            )

            logger.info(
                f"Task {task_id}: Fast import complete. "
                f"Found {len(self.unique_addresses)} unique addresses "
                f"from {len(all_transactions)} transactions "
                f"across {self.processed_blocks} blocks"
            )

            # Convert set to sorted list
            unique_addresses_list = list(self.unique_addresses)

            # Create and return result (without database operations)
            result = ContractAddressImportResult(
                addresses=unique_addresses_list,
                total_addresses=len(unique_addresses_list),
                blocks_processed=self.processed_blocks,
                transactions_processed=self.processed_transactions,
                start_block=lowest_block or 0,
                end_block=highest_block or 0,
                last_updated=start_time,
            )

            # Store transaction data for later database persistence
            result._transaction_data = all_transactions  # Temporary storage
            result._highest_block = highest_block
            result._lowest_block = lowest_block

            return result

        except Exception as e:
            logger.error(f"Task {task_id}: Error during fast import process: {e}")
            raise

    async def persist_to_database(
        self,
        catalog,
        result: ContractAddressImportResult,
        chain_id: int,
        contract_address: str,
        task_id: str = None,
    ) -> bool:
        """
        Persist previously extracted transaction data to database.

        This method handles the database operations separately from address extraction,
        allowing for decoupled processing and better API responsiveness.

        Enhanced with resilience features:
        - Timeout protection for database operations
        - Graceful failure handling without affecting cached results
        - Non-blocking approach that skips operations during high concurrency

        Args:
            catalog: Iceberg catalog for storing raw data
            result: ContractAddressImportResult with transaction data to persist
            chain_id: Blockchain chain ID
            contract_address: Contract address
            task_id: Task identifier for logging

        Returns:
            bool: True if successful, False otherwise
        """
        if not catalog:
            logger.info(
                f"Task {task_id}: No catalog provided, skipping database persistence"
            )
            return True

        try:
            logger.info(f"Task {task_id}: Starting database persistence")

            # Phase 1: Initialize tables with timeout protection
            try:
                transactions_table, cursor_table = await asyncio.wait_for(
                    self._initialize_tables(catalog, task_id),
                    timeout=30.0,  # 30 second timeout for table initialization
                )
                if not transactions_table or not cursor_table:
                    logger.error(
                        f"Task {task_id}: Failed to initialize database tables"
                    )
                    return False
            except asyncio.TimeoutError:
                logger.error(
                    f"Task {task_id}: Database table initialization timed out after 30s"
                )
                return False

            # Get transaction data from result
            all_transactions = getattr(result, "_transaction_data", [])
            highest_block = getattr(result, "_highest_block", None)
            lowest_block = getattr(result, "_lowest_block", None)

            if not all_transactions:
                logger.warning(f"Task {task_id}: No transaction data to persist")
                return True

            # Phase 2: Store transactions with timeout protection
            try:
                store_success = await asyncio.wait_for(
                    self._store_transactions(
                        catalog,
                        transactions_table,
                        all_transactions,
                        chain_id,
                        contract_address,
                        task_id,
                    ),
                    timeout=60.0,  # 60 second timeout for transaction storage
                )

                if not store_success:
                    logger.error(f"Task {task_id}: Failed to store transactions")
                    return False

            except asyncio.TimeoutError:
                logger.error(f"Task {task_id}: Transaction storage timed out after 60s")
                return False

            # Phase 3: Update cursor with timeout protection and graceful degradation
            try:
                cursor_success = await asyncio.wait_for(
                    self._update_import_cursor(
                        catalog,
                        cursor_table,
                        chain_id,
                        contract_address,
                        highest_block,
                        lowest_block,
                        task_id,
                    ),
                    timeout=30.0,  # 30 second timeout for cursor updates
                )

                if not cursor_success:
                    logger.warning(
                        f"Task {task_id}: Failed to update cursor, but transaction data was stored successfully"
                    )
                    # Don't return False here - transaction storage succeeded, cursor update is optional

            except asyncio.TimeoutError:
                logger.warning(
                    f"Task {task_id}: Cursor update timed out after 30s, but transaction data was stored successfully"
                )
                # Don't return False here - transaction storage succeeded, cursor update failure doesn't invalidate the data

            logger.info(f"Task {task_id}: Database persistence completed successfully")

            # Clean up temporary data
            if hasattr(result, "_transaction_data"):
                delattr(result, "_transaction_data")
            if hasattr(result, "_highest_block"):
                delattr(result, "_highest_block")
            if hasattr(result, "_lowest_block"):
                delattr(result, "_lowest_block")

            return True

        except Exception as e:
            logger.error(f"Task {task_id}: Error during database persistence: {e}")
            # Even if database persistence fails, the cached results are still valid
            logger.info(
                f"Task {task_id}: Cached results remain available despite database persistence error"
            )
            return False

    async def cache_result(
        self,
        chain_id: int,
        contract_address: str,
        result: ContractAddressImportResult,
        cache_ttl: int = 3600,  # 1 hour default
    ) -> bool:
        """
        Cache the unique addresses result in Redis.

        Args:
            chain_id: Blockchain chain ID
            contract_address: Contract address
            result: ContractAddressImportResult to cache
            cache_ttl: Cache time-to-live in seconds

        Returns:
            bool: True if cached successfully
        """
        try:
            cache_key = generate_unique_addresses_key(chain_id, contract_address)

            # Prepare data for caching
            cache_data = {
                "addresses": result.addresses,
                "total_addresses": result.total_addresses,
                "blocks_processed": result.blocks_processed,
                "transactions_processed": result.transactions_processed,
                "start_block": result.start_block,
                "end_block": result.end_block,
                "last_updated": result.last_updated.isoformat(),
                "expires_at": (datetime.now(timezone.utc).timestamp() + cache_ttl),
            }

            success = await self.redis.set_json(cache_key, cache_data, ex=cache_ttl)

            if success:
                logger.info(
                    f"Cached {result.total_addresses} unique addresses "
                    f"for {contract_address} on chain {chain_id} "
                    f"(TTL: {cache_ttl}s)"
                )
            else:
                logger.error(f"Failed to cache unique addresses for {contract_address}")

            return success

        except Exception as e:
            logger.error(f"Error caching unique addresses: {e}")
            return False

    async def get_cached_result(
        self, chain_id: int, contract_address: str
    ) -> Optional[ContractAddressImportResult]:
        """
        Retrieve cached unique addresses result from Redis.

        Args:
            chain_id: Blockchain chain ID
            contract_address: Contract address

        Returns:
            ContractAddressImportResult if found and valid, None otherwise
        """
        try:
            cache_key = generate_unique_addresses_key(chain_id, contract_address)
            cache_data = await self.redis.get_json(cache_key)

            if not cache_data:
                return None

            # Check if cache is still valid
            expires_at = cache_data.get("expires_at")
            if expires_at and datetime.now(timezone.utc).timestamp() > expires_at:
                logger.info(f"Cache expired for {contract_address} on chain {chain_id}")
                await self.redis.delete(cache_key)
                return None

            # Reconstruct result object
            result = ContractAddressImportResult(
                addresses=cache_data["addresses"],
                total_addresses=cache_data["total_addresses"],
                blocks_processed=cache_data["blocks_processed"],
                transactions_processed=cache_data["transactions_processed"],
                start_block=cache_data["start_block"],
                end_block=cache_data["end_block"],
                last_updated=datetime.fromisoformat(cache_data["last_updated"]),
                expires_at=(
                    datetime.fromtimestamp(expires_at, tz=timezone.utc)
                    if expires_at
                    else None
                ),
            )

            logger.info(
                f"Retrieved cached result: {result.total_addresses} unique addresses "
                f"for {contract_address} on chain {chain_id}"
            )

            return result

        except Exception as e:
            logger.error(f"Error retrieving cached unique addresses: {e}")
            return None
