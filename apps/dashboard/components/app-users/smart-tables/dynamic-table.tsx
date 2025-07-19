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
import { useState } from 'react';

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
  enableColumnVisibility?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  itemsPerPage?: number;
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
  enableColumnVisibility = true,
  enableSorting = true,
  enablePagination = true,
  itemsPerPage = 100,
}: DynamicTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnResizing, setColumnResizing] = useState({});

  const table = useReactTable({
    data,
    columns,
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
    enableColumnVisibility,
  });

  // Handle empty state
  if (!isLoading && data.length === 0) {
    return (
      <EmptyState message={emptyMessage} description={emptyDescription} className={className} />
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Table Toolbar */}
      {(enableColumnVisibility || enableColumnReordering) && (
        <TableToolbar
          table={table}
          enableColumnVisibility={enableColumnVisibility}
          enableColumnReordering={enableColumnReordering}
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        position: 'relative',
                      }}
                      className={cn(
                        'relative',
                        header.column.getCanResize() && 'cursor-col-resize'
                      )}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                  onClick={() => onRowClick?.(row.original)}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                      }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
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
      </div>
    </div>
  );
}
