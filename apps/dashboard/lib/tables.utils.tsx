import { SortDirection } from '@/components/app-users/smart-tables/sort-indicator';
import {
  AdvancedColumnType,
  AggregationOption,
  ColumnType,
  ExtractedRowData,
  SmartTableColumn,
  TableColumn,
} from '@/components/app-users/types';
import { cn } from '@/lib/utils';

export type FilterConfig = {
  columnKey: string;
  value: string;
};

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

/**
 * Checks if a column exists based on its type and the `exists` property.
 *
 * @param column - The table column definition
 * @returns `true` if the column exists, `false` otherwise
 */
export function checkColumnExists<T>(value: any, column: TableColumn<T>) {
  switch (column.type) {
    case ColumnType.STRING:
      return !!value && value !== '';
    case ColumnType.NUMBER:
      return !!value && value > 0;
    case ColumnType.DATE:
      return !!value;
    case ColumnType.ARRAY:
      return !!value && value.length > 0;
    default:
      return !!value;
  }
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
  if (column.sortable && column.sortingValueGetter) {
    return column.sortingValueGetter(item);
  }
  // Fallback to data extractor if no custom sorting getter
  if (column.dataExtractor) {
    return column.dataExtractor(item);
  }
  return undefined;
}

/**
 * Extracts data from an item using column definitions for use in sorting, filtering, etc.
 *
 * This extracts a normalized dataset that can be used across the table without needing
 * to recalculate values for each operation.
 *
 * @param item - The data item to extract values from
 * @param columns - The column definitions that define how to extract data
 * @returns An object containing extracted data for each column keyed by column key
 */
export function extractRowData<T>(item: T, columns: SmartTableColumn<T>[]): ExtractedRowData<any> {
  const flatColumns = getFlatColumns(columns, item);
  const result: ExtractedRowData<any> = {};
  for (const column of flatColumns) {
    // If the column has a data extractor, use it
    if (column.dataExtractor) {
      result[column.key] = column.dataExtractor(item);
    }
  }
  return result;
}

/**
 * Extracts data from multiple items using column definitions
 *
 * @param items - The array of data items to process
 * @param columns - The column definitions that define how to extract data
 * @returns An array of objects mapping column keys to their extracted values
 */
export function extractTableData<T>(
  items: T[],
  columns: SmartTableColumn<T>[]
): ExtractedRowData<any>[] {
  return items.map(item => extractRowData(item, columns));
}

export function aggregateColumnData<T>(
  items: T[],
  columns: TableColumn<T>[]
): { text: string; value: string }[] {
  const results: { text: string; value: string }[] = [];
  const tableData = extractTableData(items, columns);
  for (const column of columns) {
    if (column.type === ColumnType.NUMBER) {
      const values = tableData.map(row => row[column.key]);
      const sum = values.reduce((acc, val) => acc + val, 0);
      results.push({ text: AggregationOption.SUM, value: sum.toString() });
    } else {
      const count = tableData.filter(row => checkColumnExists(row[column.key], column)).length;
      results.push({ text: AggregationOption.COUNT, value: count.toString() });
    }
  }
  return results;
}

/**
 * Filters an array of items based on a filter configuration and pre-extracted data
 *
 * @param items - The array of items to filter
 * @param extractedData - A record mapping item IDs to their extracted data
 * @param filters - Array of filter configurations to apply
 * @param getItemId - Function to get the ID from an item
 * @returns A filtered array of items
 */
export function filterItems<T>(
  items: T[],
  extractedData: Record<string, ExtractedRowData<any>>,
  filters: FilterConfig[],
  getItemId: (item: T) => string
): T[] {
  if (!filters || filters.length === 0) {
    return items; // No filters applied
  }

  return items.filter(item => {
    const itemId = getItemId(item);
    const itemData = extractedData[itemId];

    if (!itemData) return true; // If no extracted data, don't filter out

    // Check all filters for this item
    return filters.every(filter => {
      const { columnKey, value } = filter;

      if (!value || value.trim() === '') return true; // Empty filter always passes
      if (!itemData[columnKey]) return true; // If column data doesn't exist, don't filter out

      const cellData = itemData[columnKey];
      const displayValue = cellData.display?.toLowerCase() || '';
      const searchValue = value.toLowerCase();

      return displayValue.includes(searchValue);
    });
  });
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

  // Extract all data first for more efficient sorting
  const extractedData = items.map((item, index) => ({
    item,
    index,
    value: sortColumn.dataExtractor
      ? sortColumn.dataExtractor(item)
      : getSortableValue(item, sortColumn),
  }));

  // Sort based on the extracted data
  extractedData.sort((a, b) => {
    // Handle null/undefined values
    if (a.value == null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (b.value == null) return sortConfig.direction === 'asc' ? 1 : -1;

    if (a.value < b.value) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a.value > b.value) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Return the sorted items
  return extractedData.map(entry => entry.item);
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
  renderer: (column: TableColumn<T>) => React.ReactNode
) {
  return getFlatColumns(columns, item).map(column => {
    return renderer({
      ...column,
      className: cn(column.className, columnStyle(column)),
    });
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
