import { PaginatedTable } from '@/components/ui/paginated-table';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/string.utils';
import {
  aggregateColumnData,
  extractTableData,
  getFlatColumns,
  renderColumns,
  renderHeaders,
  sortItems,
} from '@/lib/tables.utils';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

import { ColumnType, ExtractedRowData, SmartTableColumn } from '../types';
import { SortDirection } from './sort-indicator';
import { SortableHeader } from './sortable-header';

/**
 * A smart table component that can handle sorting, pagination, and filtering.
 *
 * @param columns - The columns to display in the table.
 * @param items - The items to display in the table.
 * @param itemsPerPage - The number of items to display per page.
 * @returns
 */
export function HyperSmartTable<T extends { id: string }>({
  columns,
  items,
  itemsPerPage,
}: {
  columns: SmartTableColumn<T>[];
  items: T[];
  itemsPerPage: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: SortDirection }>({
    key: null,
    direction: null,
  });

  // Handle sorting change
  const handleSort = (key: string, direction: SortDirection) => {
    setSortConfig({ key, direction });
  };

  // Navigation handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  // Extract data from all items upfront for sorting and filtering
  const extractedData = useMemo<Record<string, ExtractedRowData<any>>>(() => {
    const data: Record<string, ExtractedRowData<any>> = {};
    const tableData = extractTableData(items, columns, column => {
      return column.dataExtractor;
    });

    // Store extracted data by item ID for easy access
    items.forEach((item, index) => {
      data[item.id] = tableData[index];
    });

    return data;
  }, [items, columns]);

  // Apply filtering, then sorting to the data
  const filteredAndSortedItems = useMemo(() => {
    return sortItems(items, sortConfig, columns);
  }, [items, sortConfig, columns]);

  // Calculate pagination values
  const totalItems = filteredAndSortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);

  const footers = useMemo(() => {
    const flatColumns = getFlatColumns(columns);
    const results: { text: string; value: string }[] = aggregateColumnData(items, flatColumns);
    return flatColumns.map((column, index) => (
      <TableCell
        key={column.key}
        border={false}
        className={cn('text-muted-foreground text-xs p-0', column.className)}>
        <div className="h-12 border-r flex items-center">
          {!column.aggregateDisabled && (
            <div className="flex items-center space-x-4 w-full justify-between px-4">
              <span className="font-bold">{results[index].text}</span>
              <span>
                {column.type === ColumnType.NUMBER
                  ? formatNumber(results[index].value)
                  : results[index].value}
              </span>
            </div>
          )}
        </div>
      </TableCell>
    ));
  }, [columns, items]);

  return (
    <PaginatedTable
      header={
        <TableRow>
          {renderHeaders(columns, column => (
            <TableHead key={column.key} border={column.border} className={column.className}>
              <SortableHeader
                column={column}
                sortKey={sortConfig.key}
                sortDirection={sortConfig.direction}
                onSort={handleSort}
              />
            </TableHead>
          ))}
        </TableRow>
      }
      content={paginatedItems.map(item => (
        <TableRow
          key={item.id}
          className={cn('hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors')}>
          {renderColumns(item, columns, column => {
            const data = extractedData[item.id][column.key];
            return (
              <TableCell key={column.key} border={column.border} className={column.className}>
                {data && column.contentRenderer(data)}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
      footer={<TableRow>{footers}</TableRow>}
      pagination={{
        startIndex,
        currentPage,
        totalItems,
        itemsPerPage,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
      }}
    />
  );
}
