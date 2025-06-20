import { SmartTableColumn, TableColumn } from '@/components/app-users/types';
import { SortDirection } from '@/components/ui/sort-indicator';
import { cn } from '@/lib/utils';

export function columnStyle(column: TableColumn<any>) {
  return column.type === 'number' ? 'text-right' : '';
}

// Get sortable value from item based on column type
export function getSortableValue<T>(item: T, column: TableColumn<T>): any {
  // If column provides a custom sorting value getter, use it
  if (column.sortingValueGetter) {
    return column.sortingValueGetter(item);
  }

  // Default sorting by type
  const rawValue = (item as any)[column.key];

  switch (column.type) {
    case 'date':
      return rawValue ? new Date(rawValue).getTime() : 0;
    case 'number':
      return typeof rawValue === 'number' ? rawValue : 0;
    case 'array':
      return Array.isArray(rawValue) ? rawValue.length : 0;
    default:
      return rawValue ? String(rawValue).toLowerCase() : '';
  }
}

// Sort array of items based on column and direction
export function sortItems<T>(
  items: T[],
  sortConfig: { key: string | null; direction: SortDirection },
  columns: SmartTableColumn<T>[]
): T[] {
  if (!sortConfig.key || !sortConfig.direction) {
    return [...items]; // Return a copy of the original array if no sorting is applied
  }

  // Find the column that matches the sort key
  const flatColumns = getFlatColumns(columns);
  const sortColumn = flatColumns.find(col => col.key === sortConfig.key);

  if (!sortColumn) {
    return [...items];
  }

  return [...items].sort((a, b) => {
    const valueA = getSortableValue(a, sortColumn);
    const valueB = getSortableValue(b, sortColumn);

    // Handle null/undefined values
    if (valueA == null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueB == null) return sortConfig.direction === 'asc' ? 1 : -1;

    if (valueA < valueB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function renderColumns<T>(
  item: T,
  columns: SmartTableColumn<T>[],
  renderer: (column: TableColumn<T>, item: T) => React.ReactNode
) {
  return getFlatColumns(columns).map(column => {
    return renderer(
      {
        ...column,
        className: cn(column.className, columnStyle(column)),
      },
      item
    );
  });
}

export function renderHeaders<T>(
  columns: SmartTableColumn<T>[],
  renderer: (column: TableColumn<T>) => React.ReactNode
) {
  return getFlatColumns(columns).map(column => {
    return renderer({
      ...column,
      className: cn(column.className, columnStyle(column)),
    });
  });
}

// Helper function to get flat list of columns from smart columns (resolving batch columns)
export function getFlatColumns<T>(columns: SmartTableColumn<T>[]): TableColumn<T>[] {
  const flatColumns: TableColumn<T>[] = [];
  for (const column of columns) {
    if (column.type === 'batch') {
      const batchColumns = column.batchRenderer();
      flatColumns.push(...getFlatColumns(batchColumns));
    } else {
      flatColumns.push(column as TableColumn<T>);
    }
  }
  return flatColumns;
}
