'use client';

import { cn } from '@/lib/utils';
import {
  ColumnDef,
  ColumnOrderState,
  ColumnResizeMode,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { EmptyState } from './empty-state';
import { TableToolbar } from './table-toolbar';

export interface DynamicTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (row: TData) => void;
  className?: string;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  enableSorting?: boolean;
  enableInfiniteScroll?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  // Selection props
  enableRowSelection?: boolean;
  selectedRows?: Record<string, boolean>;
  onRowSelectionChange?: (selectedRows: Record<string, boolean>) => void;
  getRowId?: (row: TData) => string;
  // Generic data type support
  getRowDisplayValue?: (row: TData, key: string) => any;
  hasRowProperty?: (row: TData, property: string) => boolean;
  // Footer props
  enableFooter?: boolean;
  footerData?: Record<string, any>;
  getFooterValue?: (key: string) => any;
  // Initial sorting
  initialSorting?: SortingState;
}

export function DynamicTable<TData>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyDescription = 'There are no items to display.',
  onRowClick,
  className,
  enableColumnResizing = true,
  enableColumnReordering = true,
  enableSorting = true,
  enableInfiniteScroll = false,
  onLoadMore,
  hasMore = false,
  enableRowSelection = false,
  selectedRows = {},
  onRowSelectionChange,
  getRowId,
  getRowDisplayValue,
  hasRowProperty,
  enableFooter = false,
  footerData = {},
  getFooterValue,
  initialSorting = [],
}: DynamicTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnResizing, setColumnResizing] = useState({});

  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll effect
  useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [enableInfiniteScroll, onLoadMore, hasMore, isLoading]);

  // Create selection column if enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={
            data.length > 0 &&
            data.every(row => {
              const rowId = getRowId
                ? getRowId(row)
                : getRowDisplayValue?.(row, 'walletAddress') ||
                  getRowDisplayValue?.(row, 'id') ||
                  '';
              return selectedRows[rowId];
            })
          }
          onChange={e => {
            const newSelection: Record<string, boolean> = {};
            data.forEach(row => {
              const rowId = getRowId
                ? getRowId(row)
                : getRowDisplayValue?.(row, 'walletAddress') ||
                  getRowDisplayValue?.(row, 'id') ||
                  '';
              newSelection[rowId] = e.target.checked;
            });
            onRowSelectionChange?.(newSelection);
          }}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      cell: ({ row }) => {
        const rowId = getRowId
          ? getRowId(row.original)
          : getRowDisplayValue?.(row.original, 'walletAddress') ||
            getRowDisplayValue?.(row.original, 'id') ||
            '';
        return (
          <input
            type="checkbox"
            checked={selectedRows[rowId] || false}
            onChange={e => {
              const newSelection = {
                ...selectedRows,
                [rowId]: e.target.checked,
              };
              onRowSelectionChange?.(newSelection);
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
      meta: { frozen: true },
    };

    return [selectionColumn, ...columns];
  }, [
    columns,
    enableRowSelection,
    selectedRows,
    onRowSelectionChange,
    getRowId,
    data,
    getRowDisplayValue,
  ]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnResizing,
    columnResizeMode: 'onChange' as ColumnResizeMode,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing: columnResizing,
    },
    enableSorting,
    enableColumnResizing,
  });

  // Handle empty state
  if (!isLoading && data.length === 0) {
    return (
      <EmptyState message={emptyMessage} description={emptyDescription} className={className} />
    );
  }

  // Sortable header component
  const SortableHeader = ({ column }: { column: any }) => {
    if (!column.getCanSort()) {
      return flexRender(column.columnDef.header, { column });
    }

    const sortDirection = column.getIsSorted();
    const sortIcon =
      sortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : sortDirection === 'desc' ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4" />
      );

    return (
      <button
        className="flex items-center gap-1 hover:bg-muted/50 px-2 py-1 rounded transition-colors"
        onClick={column.getToggleSortingHandler()}>
        {flexRender(column.columnDef.header, { column })}
        {sortIcon}
      </button>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Table Toolbar */}
      {enableColumnReordering && <TableToolbar table={table} enableColumnVisibility={true} />}

      {/* Table with frozen column support */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const isFrozen = (header.column.columnDef.meta as any)?.frozen;
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          width: header.getSize(),
                          position: isFrozen ? 'sticky' : 'relative',
                          left: isFrozen ? 0 : 'auto',
                          zIndex: isFrozen ? 10 : 'auto',
                          backgroundColor: isFrozen ? 'hsl(var(--background))' : 'transparent',
                          borderRight: isFrozen
                            ? '1px solid hsl(var(--border))'
                            : '1px solid hsl(var(--border))',
                        }}
                        className={cn(
                          'relative',
                          header.column.getCanResize() && 'cursor-col-resize',
                          isFrozen && 'shadow-sm'
                        )}>
                        {header.isPlaceholder ? null : enableSorting &&
                          header.column.getCanSort() ? (
                          <SortableHeader column={header.column} />
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
                              header.column.getIsResizing() && 'bg-primary'
                            )}
                          />
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      'transition-colors'
                    )}
                    onClick={e => {
                      // Prevent double click by checking if click is on checkbox
                      if ((e.target as HTMLElement).tagName === 'INPUT') {
                        return;
                      }
                      onRowClick?.(row.original);
                    }}>
                    {row.getVisibleCells().map((cell, index) => {
                      const isFrozen = (cell.column.columnDef.meta as any)?.frozen;
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: cell.column.getSize(),
                            position: isFrozen ? 'sticky' : 'relative',
                            left: isFrozen ? 0 : 'auto',
                            zIndex: isFrozen ? 5 : 'auto',
                            backgroundColor: isFrozen ? 'hsl(var(--background))' : 'transparent',
                            borderRight: isFrozen
                              ? '1px solid hsl(var(--border))'
                              : '1px solid hsl(var(--border))',
                          }}
                          className={cn(isFrozen && 'shadow-sm')}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {/* Footer with aggregated data - Notion style */}
            {enableFooter && (
              <TableHeader>
                <TableRow className="bg-muted/50 border-t">
                  {table.getHeaderGroups()[0].headers.map((header, index) => {
                    const isFrozen = (header.column.columnDef.meta as any)?.frozen;
                    const footerValue = getFooterValue?.(header.column.id);

                    // Format footer values based on column type
                    const formatFooterValue = (value: any, columnId: string) => {
                      if (value === undefined || value === null || value === '') {
                        return '';
                      }

                      switch (columnId) {
                        case 'identity':
                          return value; // Already formatted as "X users"
                        case 'portfolioValue':
                          return `$${Number(value).toLocaleString()} USD`;
                        case 'transactions':
                        case 'tokens':
                          return Number(value).toLocaleString();
                        case 'firstSignedIn':
                        case 'walletCreatedAt':
                          return value; // Date formatting handled in formatter
                        default:
                          return value;
                      }
                    };

                    return (
                      <TableHead
                        key={`footer-${header.id}`}
                        style={{
                          width: header.getSize(),
                          position: isFrozen ? 'sticky' : 'relative',
                          left: isFrozen ? 0 : 'auto',
                          zIndex: isFrozen ? 10 : 'auto',
                          backgroundColor: 'hsl(var(--muted))',
                          borderRight: isFrozen
                            ? '1px solid hsl(var(--border))'
                            : '1px solid hsl(var(--border))',
                        }}
                        className={cn('font-semibold text-sm', isFrozen && 'shadow-sm')}>
                        {index === 0 ? 'Total' : formatFooterValue(footerValue, header.column.id)}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
            )}
          </Table>
        </div>
      </div>

      {/* Infinite Scroll Load More */}
      {enableInfiniteScroll && hasMore && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
