import { SortDirection } from '@/components/app-users/smart-tables/sort-indicator';
import {
  AdvancedColumnType,
  ColumnType,
  SmartTableColumn,
  TableColumn,
} from '@/components/app-users/types';
import { cn } from '@/lib/utils';

/**
 * Returns a CSS class name for a table column based on its type.
 *
 * For columns of type `'number'`, returns `'text-right'` to align content to the right; otherwise, returns an empty string.
 *
 * @param column - The table column definition
 * @returns The CSS class name for the column
 */
export function columnStyle(column: TableColumn<any>) {
  return column.type === ColumnType.NUMBER ? 'text-right' : '';
}

export function checkColumnSortable(column: TableColumn<any>) {
  return (
    column.type === ColumnType.STRING ||
    column.type === ColumnType.NUMBER ||
    column.type === ColumnType.DATE ||
    column.type === ColumnType.ARRAY ||
    column.sortable
  );
}

/**
 * Extracts a sortable value from an item based on the column definition.
 *
 * Uses a custom sorting value getter if provided; otherwise, derives a value suitable for sorting according to the column type. Dates are converted to timestamps, numbers default to 0 if invalid, arrays return their length, and other types are converted to lowercase strings.
 *
 * @param item - The data item from which to extract the sortable value
 * @param column - The column definition specifying how to extract and interpret the value
 * @returns The value to be used for sorting the item in the context of the given column
 */
export function getSortableValue<T>(item: T, column: TableColumn<T>): any {
  // If column provides a custom sorting value getter, use it
  if (column.sortingValueGetter) {
    return column.sortingValueGetter(item);
  }

  // Default sorting by type
  const rawValue = (item as any)[column.key];

  switch (column.type) {
    case ColumnType.DATE:
      return rawValue ? new Date(rawValue).getTime() : 0;
    case ColumnType.NUMBER:
      return typeof rawValue === 'number' ? rawValue : 0;
    case ColumnType.ARRAY:
      return Array.isArray(rawValue) ? rawValue.length : 0;
    default:
      return rawValue ? String(rawValue).toLowerCase() : '';
  }
}

/**
 * Returns a sorted copy of the items array based on the specified sort configuration and column definitions.
 *
 * If no sort key or direction is provided, or if the sort key does not match any column, a shallow copy of the original array is returned. Sorting handles null or undefined values by placing them at the start or end depending on the sort direction.
 *
 * @param items - The array of items to sort
 * @param sortConfig - The sorting configuration, including the key and direction
 * @param columns - The column definitions used to determine sorting behavior
 * @returns A new array of items sorted according to the specified column and direction
 */
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

/**
 * Renders table cells for a given item using the provided columns and renderer function.
 *
 * Flattens any nested columns, applies appropriate CSS classes, and invokes the renderer for each column.
 *
 * @param item - The data item to render cells for
 * @param columns - The column definitions, which may include nested batch columns
 * @param renderer - Function that returns a React node for a given column and item
 * @returns An array of React nodes representing the rendered cells for the item
 */
export function renderColumns<T>(
  item: T,
  columns: SmartTableColumn<T>[],
  renderer: (column: TableColumn<T>, item: T) => React.ReactNode
) {
  return getFlatColumns(columns, item).map(column => {
    return renderer(
      {
        ...column,
        className: cn(column.className, columnStyle(column)),
      },
      item
    );
  });
}

/**
 * Renders table header cells by applying a renderer function to each flattened column.
 *
 * Flattens nested columns, combines existing and type-based CSS classes, and passes each column to the provided renderer.
 *
 * @param columns - The array of smart table columns, possibly containing nested batch columns
 * @param renderer - A function that returns a React node for a given column
 * @returns An array of React nodes representing the rendered header cells
 */
export function renderHeaders<T>(
  columns: SmartTableColumn<T>[],
  renderer: (column: TableColumn<T>) => React.ReactNode
) {
  return getFlatColumns(columns).map(column => {
    return renderer({
      ...column,
      sortable: checkColumnSortable(column),
      className: cn(column.className, columnStyle(column)),
    });
  });
}

/**
 * Flattens an array of smart table columns, resolving any batch columns into a single-level array of table columns.
 *
 * Batch columns are expanded by invoking their `batchRenderer` to retrieve nested columns, which are recursively flattened.
 *
 * @returns A flat array of table columns with all nested batch columns expanded.
 */
export function getFlatColumns<T>(columns: SmartTableColumn<T>[], item?: T): TableColumn<T>[] {
  const flatColumns: TableColumn<T>[] = [];
  for (const column of columns) {
    if (column.type === AdvancedColumnType.BATCH) {
      const batchColumns = column.batchRenderer(item);
      flatColumns.push(...getFlatColumns(batchColumns, item));
    } else {
      flatColumns.push(column as TableColumn<T>);
    }
  }
  return flatColumns;
}
