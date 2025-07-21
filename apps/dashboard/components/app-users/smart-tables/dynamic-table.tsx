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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

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
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
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
  // Pagination props
  enablePagination = false,
  pageSize = 10,
  currentPage = 1,
  // Selection props
  enableRowSelection = false,
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
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: (currentPage || 1) - 1,
    pageSize: pageSize,
  });

  // Create selection column if enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<TData> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onClick={e => e.stopPropagation()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
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
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,

    columnResizeMode: 'onChange' as ColumnResizeMode,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing,
      rowSelection,
      pagination,
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
      {/* Fixed Table Toolbar */}
      {enableColumnReordering && (
        <div className="flex-shrink-0 bg-background border-b">
          <TableToolbar
            table={table}
            enableColumnVisibility={true}
            tableLabel={tableLabel}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder={searchPlaceholder}
            additionalActions={additionalActions}
            // Pagination props
            enablePagination={enablePagination}
          />
        </div>
      )}

      {!isLoading && data.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState message={emptyMessage} description={emptyDescription} className={className} />
        </div>
      )}

      {/* Single Table with Fixed Header/Footer and Scrollable Body */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Single Table Container */}
            <div className="flex-1 overflow-auto">
              <div className="overflow-x-auto">
                <Table>
                  {/* Fixed Header */}
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header, index) => {
                          const isFrozen = (header.column.columnDef.meta as any)?.frozen;
                          const isSortable = enableSorting && header.column.getCanSort();

                          // Calculate left position for frozen columns
                          let leftPosition = 'auto';
                          if (isFrozen) {
                            if (index === 0) {
                              leftPosition = '0px';
                            } else {
                              // Calculate cumulative width of previous frozen columns
                              let cumulativeWidth = 0;
                              for (let i = 0; i < index; i++) {
                                const prevHeader = headerGroup.headers[i];
                                if ((prevHeader.column.columnDef.meta as any)?.frozen) {
                                  cumulativeWidth += prevHeader.getSize();
                                }
                              }
                              leftPosition = `${cumulativeWidth}px`;
                            }
                          }

                          return (
                            <TableHead
                              key={header.id}
                              style={{
                                width: header.getSize(),
                                position: isFrozen ? ('sticky' as const) : ('relative' as const),
                                left: leftPosition,
                                zIndex: isFrozen ? 20 : 'auto',
                                backgroundColor: isFrozen
                                  ? 'hsl(var(--background))'
                                  : 'transparent',
                                borderRight: '1px solid hsl(var(--border))',
                              }}
                              className={cn(
                                'relative',
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
                                    'absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none hover:bg-primary/50 active:bg-primary',
                                    header.column.getIsResizing() && 'bg-primary'
                                  )}
                                  style={{
                                    zIndex: 30,
                                  }}
                                />
                              )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>

                  {/* Table Body */}
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className={cn(
                            onRowClick && 'cursor-pointer hover:bg-muted/50',
                            'transition-all duration-300 ease-out animate-row-in'
                          )}
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both',
                          }}
                          onClick={e => {
                            // Prevent double click by checking if click is on checkbox
                            if ((e.target as HTMLElement).tagName === 'INPUT') {
                              return;
                            }
                            onRowClick?.(row.original);
                          }}>
                          {row.getVisibleCells().map((cell, index) => {
                            const isFrozen = (cell.column.columnDef.meta as any)?.frozen;

                            // Calculate left position for frozen columns
                            let leftPosition = 'auto';
                            if (isFrozen) {
                              if (index === 0) {
                                leftPosition = '0px';
                              } else {
                                // Calculate cumulative width of previous frozen columns
                                let cumulativeWidth = 0;
                                for (let i = 0; i < index; i++) {
                                  const prevCell = row.getVisibleCells()[i];
                                  if ((prevCell.column.columnDef.meta as any)?.frozen) {
                                    cumulativeWidth += prevCell.column.getSize();
                                  }
                                }
                                leftPosition = `${cumulativeWidth}px`;
                              }
                            }

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
                                  borderRight: '1px solid hsl(var(--border))',
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

                  {/* Fixed Footer */}
                  {enableFooter && (
                    <TableHeader className="sticky bottom-0 z-10 bg-background border-t">
                      <TableRow className="bg-muted/50">
                        {table.getHeaderGroups()[0].headers.map((header, index) => {
                          const isFrozen = (header.column.columnDef.meta as any)?.frozen;
                          const footerValue = getFooterValue?.(header.column.id);

                          // Calculate left position for frozen columns
                          let leftPosition = 'auto';
                          if (isFrozen) {
                            if (index === 0) {
                              leftPosition = '0px';
                            } else {
                              // Calculate cumulative width of previous frozen columns
                              let cumulativeWidth = 0;
                              for (let i = 0; i < index; i++) {
                                const prevHeader = table.getHeaderGroups()[0].headers[i];
                                if ((prevHeader.column.columnDef.meta as any)?.frozen) {
                                  cumulativeWidth += prevHeader.getSize();
                                }
                              }
                              leftPosition = `${cumulativeWidth}px`;
                            }
                          }

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
                                position: isFrozen ? ('sticky' as const) : ('relative' as const),
                                left: leftPosition,
                                zIndex: isFrozen ? 20 : 'auto',
                                backgroundColor: 'hsl(var(--muted))',
                                borderRight: '1px solid hsl(var(--border))',
                              }}
                              className={cn('font-semibold text-xs', isFrozen && 'shadow-sm')}>
                              {index > 0 ? formatFooterValue(footerValue, header.column.id) : ''}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                  )}
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
