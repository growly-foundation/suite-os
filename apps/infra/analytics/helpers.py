from pyiceberg.expressions import (
    And,
    EqualTo,
    GreaterThanOrEqual,
    LessThanOrEqual,
    Reference,
    literal,
)

from models import TimePeriod


def _apply_time_window_filter(table, chain_id, time_window):
    """
    Apply time window filtering to an Iceberg table scan.

    Returns:
        Tuple of (filtered_query, start_time, end_time)
    """
    # Get time window filter using the new unified system
    if time_window:
        period = TimePeriod.from_string(time_window)
        start_time, end_time = period.to_datetime_range()
    else:
        start_time = end_time = None

    # Convert datetime to date for filtering on block_date
    start_date = start_time.date() if start_time else None
    end_date = end_time.date() if end_time else None

    # Build query
    query = table.scan()

    # Filter by chain_id
    chain_id_ref = Reference("chain_id")
    query = query.filter(EqualTo(chain_id_ref, literal(chain_id)))

    if start_date and end_date:
        # Use block_date for partition pruning
        block_date_ref = Reference("block_date")
        start_filter = GreaterThanOrEqual(block_date_ref, literal(start_date))
        end_filter = LessThanOrEqual(block_date_ref, literal(end_date))
        date_filter = And(start_filter, end_filter)
        query = query.filter(date_filter)

    return query, start_time, end_time
