'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { IconContainer } from '@/components/ui/icon-container';
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
import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { EmptyState } from './empty-state';
import { TableToolbar } from './table-toolbar';

// Skeleton component for loading cells
const SkeletonCell = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
}: {
  width?: string;
  height?: string;
  variant?: 'text' | 'avatar' | 'badge' | 'number';
}) => {
  switch (variant) {
    case 'avatar':
      return (
        <div className="flex items-center gap-3">
          <div className="animate-pulse bg-muted rounded-full w-8 h-8" />
          <div
            className="animate-pulse bg-muted rounded"
            style={{ width: '60%', height: '1rem' }}
          />
        </div>
      );
    case 'badge':
      return (
        <div
          className="animate-pulse bg-muted rounded-full px-2 py-1"
          style={{ width: '80px', height: '24px' }}
        />
      );
    case 'number':
      return <div className="animate-pulse bg-muted rounded" style={{ width: '40%', height }} />;
    default:
      return <div className="animate-pulse bg-muted rounded" style={{ width, height }} />;
  }
};

// Helper function to determine skeleton variant based on column ID
const getSkeletonVariant = (columnId: string): 'text' | 'avatar' | 'badge' | 'number' => {
  if (columnId.includes('identity') || columnId.includes('name') || columnId.includes('user')) {
    return 'avatar';
  }
  if (columnId.includes('trait') || columnId.includes('status') || columnId.includes('activity')) {
    return 'badge';
  }
  if (
    columnId.includes('value') ||
    columnId.includes('count') ||
    columnId.includes('transaction')
  ) {
    return 'number';
  }
  return 'text';
};

// Generate skeleton rows that match the table structure
const SkeletonTableRows = ({
  columns,
  rowCount = 10,
  enableRowSelection = false,
}: {
  columns: ColumnDef<any>[];
  rowCount?: number;
  enableRowSelection?: boolean;
}) => {
  // Create skeleton columns that match the actual table structure
  const skeletonColumns = enableRowSelection
    ? [
        { id: 'select', size: 50, meta: { frozen: true } },
        ...columns.map(col => ({
          id: col.id || 'col',
          size: (col as any).size || 150,
          meta: (col as any).meta || {},
        })),
      ]
    : columns.map(col => ({
        id: col.id || 'col',
        size: (col as any).size || 150,
        meta: (col as any).meta || {},
      }));

  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className="border-b">
          {skeletonColumns.map((col, colIndex) => {
            const isFrozen = (col.meta as any)?.frozen;
            const leftPosition = isFrozen
              ? calculateFrozenColumnPosition(
                  colIndex,
                  skeletonColumns.map(c => ({
                    column: {
                      columnDef: { meta: c.meta },
                      getSize: () => c.size,
                    },
                  }))
                )
              : 'auto';

            return (
              <TableCell
                key={`skeleton-cell-${rowIndex}-${colIndex}`}
                style={{
                  width: col.size,
                  position: isFrozen ? ('sticky' as const) : ('relative' as const),
                  left: leftPosition,
                  zIndex: isFrozen ? 5 : 'auto',
                  backgroundColor: isFrozen ? 'hsl(var(--background))' : 'transparent',
                  boxShadow: isFrozen ? '1px 0 0 0 hsl(var(--border))' : 'none',
                }}
                className={cn('overflow-hidden py-3', isFrozen && 'shadow-sm')}>
                {col.id === 'select' ? (
                  <SkeletonCell width="16px" height="16px" />
                ) : (
                  <SkeletonCell
                    width={`${Math.random() * 40 + 60}%`} // Random width between 60-100%
                    height="1rem"
                    variant={getSkeletonVariant(col.id)}
                  />
                )}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
};

function calculateFrozenColumnPosition(
  index: number,
  columns: Array<{ column: { columnDef: { meta?: any }; getSize: () => number } }>
): string {
  if (index === 0) return '0px';

  let cumulativeWidth = 0;
  for (let i = 0; i < index; i++) {
    const col = columns[i];
    if (col.column.columnDef.meta?.frozen) {
      cumulativeWidth += col.column.getSize();
    }
  }
  return `${cumulativeWidth}px`;
}

export interface DynamicTableProps<TData = any> {
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
  // Pagination and infinite loading props
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  onLoadMore?: (pageInfo: { page: number; pageSize: number }) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onError?: (error: Error) => void;
  // Selection props
  enableRowSelection?: boolean;
  selectedRows?: Record<string, boolean>;
  onRowSelectionChange?: (selectedRows: Record<string, boolean>) => void;
  getRowId?: (row: TData) => string;
  // Generic data type support
  getRowDisplayValue?: (row: TData, key: string) => any;
  // Footer props
  enableFooter?: boolean;
  getFooterValue?: (key: string) => any;
  // Initial sorting
  initialSorting?: SortingState;
  // Toolbar props
  tableLabel?: string;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  searchPlaceholder?: string;
  additionalActions?: ReactNode;
}

// CSS variables for layout calculations
const TOOLBAR_HEIGHT = '4rem';
const FOOTER_HEIGHT = '3rem';
const HEADER_HEIGHT = '3rem';

export function DynamicTable<TData = any>({
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
  // Pagination and infinite loading props
  pageSize = 20,
  currentPage = 0,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  totalItems = 0,
  // Selection props
  enableRowSelection = false,
  selectedRows,
  onRowSelectionChange,
  getRowId,
  getRowDisplayValue,
  enableFooter = false,
  getFooterValue,
  initialSorting = [],
  tableLabel,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = 'Search...',
  additionalActions,
}: DynamicTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = useState({});

  // Use external row selection state if provided, otherwise use internal state
  const [internalRowSelection, setInternalRowSelection] = useState({});
  const rowSelection = selectedRows || internalRowSelection;

  // Handle row selection change with proper type conversion
  const handleRowSelectionChange = useCallback(
    (updaterOrValue: any) => {
      let newSelection: Record<string, boolean>;

      if (typeof updaterOrValue === 'function') {
        newSelection = updaterOrValue(rowSelection);
      } else {
        newSelection = updaterOrValue;
      }

      if (onRowSelectionChange) {
        onRowSelectionChange(newSelection);
      } else {
        setInternalRowSelection(newSelection);
      }
    },
    [onRowSelectionChange, rowSelection]
  );

  // Create selection column if enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => {
        // Get all rows (not just current page)
        const allRows = table.getFilteredRowModel().rows;
        const selectedRows = Object.keys(rowSelection);
        const allSelected = allRows.length > 0 && selectedRows.length === allRows.length;
        const someSelected = selectedRows.length > 0 && selectedRows.length < allRows.length;

        return (
          <Checkbox
            checked={allSelected || (someSelected && 'indeterminate')}
            onClick={e => e.stopPropagation()}
            onCheckedChange={value => {
              if (value) {
                // Select all rows
                const newSelection: Record<string, boolean> = {};
                allRows.forEach(row => {
                  newSelection[row.id] = true;
                });
                handleRowSelectionChange(newSelection);
              } else {
                // Deselect all rows
                handleRowSelectionChange({});
              }
            }}
            aria-label="Select all"
            className="h-4 w-4 rounded border-gray-300"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          onClick={e => e.stopPropagation()}
          aria-label="Select row"
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 50,
      minSize: 50,
      meta: { frozen: true },
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection, rowSelection, handleRowSelectionChange]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: handleRowSelectionChange,

    columnResizeMode: 'onChange' as ColumnResizeMode,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing,
      rowSelection,
    },
    enableSorting,
    enableColumnResizing,
    // Ensure columns respect their minimum sizes
    columnResizeDirection: 'ltr',
    // Prevent columns from being resized below their minimum width
    onColumnSizingChange: updater => {
      if (typeof updater === 'function') {
        setColumnSizing(prev => {
          const newSizing = updater(prev);
          // Ensure no column goes below its minimum width
          const updatedSizing = { ...newSizing };
          table.getAllColumns().forEach(column => {
            const minSize = column.columnDef.minSize || 50;
            if (updatedSizing[column.id] && updatedSizing[column.id] < minSize) {
              updatedSizing[column.id] = minSize;
            }
          });
          return updatedSizing;
        });
      } else {
        setColumnSizing(updater);
      }
    },
    // Enable row selection
    enableRowSelection: enableRowSelection,
    getRowId:
      getRowId ||
      ((row: TData) => {
        // Fallback row ID generation
        if (getRowDisplayValue) {
          return (
            getRowDisplayValue(row, 'walletAddress') || getRowDisplayValue(row, 'id') || String(row)
          );
        }
        return String(row);
      }),
  });

  // Sortable header component
  const SortableHeader = ({ column }: { column: any }) => {
    if (!column.getCanSort()) {
      return flexRender(column.columnDef.header, { column });
    }

    const sortDirection = column.getIsSorted();
    const sortIcon =
      sortDirection === 'asc' ? (
        <ChevronUp className="h-3 w-3 transition-transform duration-200" />
      ) : sortDirection === 'desc' ? (
        <ChevronDown className="h-3 w-3 transition-transform duration-200" />
      ) : (
        <ArrowUpDown className="h-3 w-3 transition-transform duration-200" />
      );

    return (
      <div className="flex items-center text-xs gap-3 justify-between">
        {flexRender(column.columnDef.header, { column })}
        <div className="hover:scale-105 active:scale-95 transition-transform duration-200">
          <IconContainer
            className="flex items-center gap-1 hover:bg-muted/50 px-2 py-1 rounded cursor-pointer group"
            onClick={column.getToggleSortingHandler()}>
            <span
              className={`text-muted-foreground text-xs transition-all duration-200 ${
                sortDirection ? 'text-primary scale-110' : 'group-hover:scale-105'
              }`}>
              {sortIcon}
            </span>
          </IconContainer>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Table Container */}
      <div className="flex-1 flex flex-col h-full">
        {/* Fixed Table Toolbar */}
        {enableColumnReordering && (
          <div
            className="flex-shrink-0 bg-background border-b z-20"
            style={{ height: TOOLBAR_HEIGHT }}>
            <TableToolbar
              table={table}
              enableColumnVisibility={true}
              tableLabel={tableLabel}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchPlaceholder={searchPlaceholder}
              additionalActions={additionalActions}
            />
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex-1 overflow-auto relative h-full">
            <Table className="w-full table-fixed">
              <TableHeader
                className="sticky top-0 bg-background shadow-sm"
                style={{ height: HEADER_HEIGHT }}>
                {/* Show actual headers even during loading */}
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header, index) => {
                      const isFrozen = (header.column.columnDef.meta as any)?.frozen;
                      const isSortable = enableSorting && header.column.getCanSort();
                      const leftPosition = isFrozen
                        ? calculateFrozenColumnPosition(index, headerGroup.headers)
                        : 'auto';

                      return (
                        <TableHead
                          key={`${header.id}-${index}`}
                          style={{
                            width: header.getSize(),
                            position: isFrozen ? ('sticky' as const) : ('relative' as const),
                            left: leftPosition,
                            zIndex: isFrozen ? 20 : 'auto',
                            backgroundColor: isFrozen ? 'hsl(var(--background))' : 'transparent',
                            boxShadow: isFrozen ? '1px 0 0 0 hsl(var(--border))' : 'none',
                          }}
                          className={cn(
                            'relative overflow-hidden py-3',
                            header.column.getCanResize() && 'cursor-col-resize',
                            isFrozen && 'shadow-sm'
                          )}>
                          {header.isPlaceholder ? null : isSortable ? (
                            <SortableHeader column={header.column} />
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <SkeletonTableRows
                  columns={tableColumns}
                  rowCount={pageSize || 10}
                  enableRowSelection={enableRowSelection}
                />
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyState
              message={emptyMessage}
              description={emptyDescription}
              className={className}
              status={searchQuery ? 'no-results' : 'empty'}
              action={
                searchQuery
                  ? {
                      label: 'Clear search',
                      onClick: () => setSearchQuery?.(''),
                    }
                  : undefined
              }
            />
          </div>
        )}

        {!isLoading && data.length > 0 && (
          <React.Fragment>
            {/* Table with sticky header */}
            <div
              className="flex-1 overflow-auto relative h-full"
              onScroll={event => {
                const target = event.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = target;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

                if (isNearBottom && !isLoading && hasMore && onLoadMore) {
                  const nextPage = currentPage + 1;
                  onLoadMore({ page: nextPage, pageSize });
                }
              }}>
              <Table className="w-full table-fixed">
                <TableHeader
                  className="sticky top-0 bg-background shadow-sm"
                  style={{ height: HEADER_HEIGHT }}>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header, index) => {
                        const isFrozen = (header.column.columnDef.meta as any)?.frozen;
                        const isSortable = enableSorting && header.column.getCanSort();
                        const leftPosition = isFrozen
                          ? calculateFrozenColumnPosition(index, headerGroup.headers)
                          : 'auto';

                        return (
                          <TableHead
                            key={`${header.id}-${index}`}
                            style={{
                              width: header.getSize(),
                              position: isFrozen ? ('sticky' as const) : ('relative' as const),
                              left: leftPosition,
                              zIndex: isFrozen ? 20 : 'auto',
                              backgroundColor: isFrozen ? 'hsl(var(--background))' : 'transparent',
                              boxShadow: isFrozen ? '1px 0 0 0 hsl(var(--border))' : 'none',
                            }}
                            className={cn(
                              'relative overflow-hidden py-3',
                              header.column.getCanResize() && 'cursor-col-resize',
                              isFrozen && 'shadow-sm'
                            )}>
                            {header.isPlaceholder ? null : isSortable ? (
                              <SortableHeader column={header.column} />
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={cn(
                                  'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/50 active:bg-primary',
                                  header.column.getIsResizing() && 'bg-primary'
                                )}
                                style={{ zIndex: 30 }}
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
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow
                        key={`${row.id}-${index}`}
                        data-state={row.getIsSelected() && 'selected'}
                        className={cn(
                          onRowClick && 'cursor-pointer hover:bg-muted/50',
                          'transition-all duration-200 ease-out animate-row-in border-b',
                          row.getIsSelected() && 'bg-muted/30'
                        )}
                        style={{
                          animationDelay: `${index * 30}ms`,
                          animationFillMode: 'both',
                        }}
                        onClick={e => {
                          if ((e.target as HTMLElement).tagName === 'INPUT') return;
                          // Prevent multiple rapid clicks
                          if (e.detail > 1) return;
                          // Use requestAnimationFrame to debounce the click
                          requestAnimationFrame(() => {
                            onRowClick?.(row.original);
                          });
                        }}>
                        {row.getVisibleCells().map((cell, index) => {
                          const isFrozen = (cell.column.columnDef.meta as any)?.frozen;
                          const leftPosition = isFrozen
                            ? calculateFrozenColumnPosition(index, row.getVisibleCells())
                            : 'auto';

                          return (
                            <TableCell
                              key={cell.id}
                              style={{
                                width: cell.column.getSize(),
                                position: isFrozen ? ('sticky' as const) : ('relative' as const),
                                left: leftPosition,
                                zIndex: isFrozen ? 5 : 'auto',
                                backgroundColor: isFrozen
                                  ? 'hsl(var(--background))'
                                  : 'transparent',
                                boxShadow: isFrozen ? '1px 0 0 0 hsl(var(--border))' : 'none',
                              }}
                              className={cn('overflow-hidden py-3', isFrozen && 'shadow-sm')}>
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
              </Table>

              {/* Loading indicators */}
              {loadingMore && (
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  <span className="text-sm text-muted-foreground">Loading more items...</span>
                </div>
              )}
              {hasMore &&
                totalItems > 0 &&
                totalItems > data.length &&
                !loadingMore &&
                data.length > 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Scroll to load more ({data.length} items loaded)
                  </div>
                )}
            </div>

            {/* Fixed Footer */}
            {enableFooter && (
              <div
                className="w-full flex-none border-t bg-muted/50"
                style={{ height: FOOTER_HEIGHT }}>
                <Table className="w-full table-fixed">
                  <TableHeader>
                    <TableRow>
                      {table.getHeaderGroups()[0].headers.map((header, index) => {
                        const isFrozen = (header.column.columnDef.meta as any)?.frozen;
                        const footerValue = getFooterValue?.(header.column.id);
                        const leftPosition = isFrozen
                          ? calculateFrozenColumnPosition(index, table.getHeaderGroups()[0].headers)
                          : 'auto';

                        return (
                          <TableHead
                            key={`footer-${header.id}-${index}`}
                            style={{
                              width: header.getSize(),
                              position: isFrozen ? ('sticky' as const) : ('relative' as const),
                              left: leftPosition,
                              zIndex: isFrozen ? 20 : 'auto',
                              backgroundColor: 'hsl(var(--muted))',
                              boxShadow: isFrozen ? '1px 0 0 0 hsl(var(--border))' : 'none',
                            }}
                            className={cn(
                              'font-semibold text-xs overflow-hidden py-3',
                              isFrozen && 'shadow-sm'
                            )}>
                            {index > 0 ? formatFooterValue(footerValue, header.column.id) : ''}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

const formatFooterValue = (value: any, columnId: string) => {
  if (value === undefined || value === null || value === '') return '';
  switch (columnId) {
    case 'identity':
      return value;
    case 'portfolioValue':
      return `$${Number(value).toLocaleString()} USD`;
    case 'transactions':
    case 'tokens':
      return Number(value).toLocaleString();
    case 'firstSignedIn':
    case 'walletCreatedAt':
      return value;
    default:
      return value;
  }
};
