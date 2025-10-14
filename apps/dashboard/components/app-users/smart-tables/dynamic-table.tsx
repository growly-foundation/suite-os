'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IconContainer } from '@/components/ui/icon-container';
import { useWalletTableContext } from '@/hooks/use-wallet-table-context';
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
import { Plus } from 'lucide-react';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { AddColumnDialog } from './add-column-dialog';
import { ColumnUserDefinitions } from './columns/create-user-columns';
import { CustomSortingFns, createCustomSortingFns } from './constants';
import { EmptyState } from './empty-state';
import { TableToolbar } from './table-toolbar';
import { DynamicTableProps } from './types';
import { useCustomColumns } from './use-custom-columns';

// Skeleton component for loading cells - memoized for performance
const SkeletonCell = memo(
  ({
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
  }
);

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

// Generate skeleton rows that match the table structure - memoized for performance
const SkeletonTableRows = memo(
  ({
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
  }
);

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
  // Spreadsheet functionality
  enableCellEditing = false,
  onCellChange,
  onCellsChange, // Reserved for batch cell changes in future
  // Custom columns
  enableCustomColumns = false,
  customColumns: externalCustomColumns,
  onCustomColumnsChange,
  customColumnData: externalCustomColumnData,
  onCustomColumnDataChange,
}: DynamicTableProps<TData>) {
  // Suppress unused warning - onCellsChange is reserved for future batch operations
  void onCellsChange;

  // Performance optimization: useTransition for non-urgent updates
  const [isPending, startTransition] = useTransition();
  // isPending can be used in the future to show loading indicators during transitions
  void isPending;

  // Add column dialog state
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = useState({});

  // Drag-to-select state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartRowIndex, setDragStartRowIndex] = useState<number | null>(null);
  const [dragAction, setDragAction] = useState<'select' | 'deselect'>('select');
  const dragScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // Cell editing state for spreadsheet functionality
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnId: string } | null>(
    null
  );
  const [cellValue, setCellValue] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; columnId: string } | null>(
    null
  );
  const cellInputRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<any>(null);

  // Get wallet context for custom sorting
  const walletContext = useWalletTableContext();

  // Custom columns hook
  const {
    customColumns: internalCustomColumns,
    addColumn,
    generateColumnDefs: generateCustomColumnDefs,
  } = useCustomColumns<TData>({
    initialColumns: externalCustomColumns || [],
    initialData: externalCustomColumnData || {},
    onDataChange: onCustomColumnDataChange,
    getRowId:
      getRowId ||
      ((row: TData) => {
        if (getRowDisplayValue) {
          return (
            getRowDisplayValue(row, 'walletAddress') || getRowDisplayValue(row, 'id') || String(row)
          );
        }
        return String(row);
      }),
  });

  // Notify parent of custom column changes
  useEffect(() => {
    if (!externalCustomColumns && onCustomColumnsChange) {
      onCustomColumnsChange(internalCustomColumns);
    }
  }, [internalCustomColumns, externalCustomColumns, onCustomColumnsChange]);

  // Use external row selection state if provided, otherwise use internal state
  const [internalRowSelection, setInternalRowSelection] = useState<Record<string, boolean>>({});

  // Memoize row selection to prevent unnecessary re-renders
  const rowSelection = useMemo(
    () => selectedRows || internalRowSelection,
    [selectedRows, internalRowSelection]
  );

  // Memoize the selection change handler to prevent recreation on every render
  const onRowSelectionChangeRef = useRef(onRowSelectionChange);
  useEffect(() => {
    onRowSelectionChangeRef.current = onRowSelectionChange;
  }, [onRowSelectionChange]);

  // Optimized row selection change handler with deferred updates
  const handleRowSelectionChange = useCallback(
    (updaterOrValue: any) => {
      startTransition(() => {
        const currentSelection = selectedRows || internalRowSelection;
        let newSelection: Record<string, boolean>;

        if (typeof updaterOrValue === 'function') {
          newSelection = updaterOrValue(currentSelection);
        } else {
          newSelection = updaterOrValue;
        }

        if (onRowSelectionChangeRef.current) {
          onRowSelectionChangeRef.current(newSelection);
        } else {
          setInternalRowSelection(newSelection);
        }
      });
    },
    [selectedRows, internalRowSelection]
  );

  // Drag-to-select handlers
  const handleRowMouseDown = useCallback(
    (rowIndex: number, rowId: string, e: React.MouseEvent) => {
      // Only enable drag selection if row selection is enabled and not clicking on checkbox or input
      if (!enableRowSelection || (e.target as HTMLElement).tagName === 'INPUT') return;

      // Prevent text selection during drag
      e.preventDefault();

      setIsDragging(true);
      setDragStartRowIndex(rowIndex);

      // Determine action based on current selection state
      const isCurrentlySelected = (rowSelection as Record<string, boolean>)[rowId];
      setDragAction(isCurrentlySelected ? 'deselect' : 'select');

      // Toggle the clicked row
      const newSelection: Record<string, boolean> = { ...rowSelection };
      if (isCurrentlySelected) {
        delete newSelection[rowId];
      } else {
        newSelection[rowId] = true;
      }
      handleRowSelectionChange(newSelection);
    },
    [enableRowSelection, rowSelection, handleRowSelectionChange]
  );

  const handleRowMouseEnter = useCallback(
    (rowIndex: number, rowId: string, allRows: any[]) => {
      if (!isDragging || dragStartRowIndex === null) return;

      // Calculate the range of rows to select/deselect
      const startIndex = Math.min(dragStartRowIndex, rowIndex);
      const endIndex = Math.max(dragStartRowIndex, rowIndex);

      const newSelection: Record<string, boolean> = { ...rowSelection };

      for (let i = startIndex; i <= endIndex; i++) {
        if (i < allRows.length) {
          const row = allRows[i];
          if (dragAction === 'select') {
            newSelection[row.id] = true;
          } else {
            delete newSelection[row.id];
          }
        }
      }

      handleRowSelectionChange(newSelection);
    },
    [isDragging, dragStartRowIndex, dragAction, rowSelection, handleRowSelectionChange]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStartRowIndex(null);
      if (dragScrollIntervalRef.current) {
        clearInterval(dragScrollIntervalRef.current);
        dragScrollIntervalRef.current = null;
      }
    }
  }, [isDragging]);

  // Handle auto-scroll during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !tableContainerRef.current) return;

      const container = tableContainerRef.current;
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const scrollThreshold = 50;

      // Clear existing interval
      if (dragScrollIntervalRef.current) {
        clearInterval(dragScrollIntervalRef.current);
        dragScrollIntervalRef.current = null;
      }

      // Scroll up
      if (mouseY < scrollThreshold && container.scrollTop > 0) {
        dragScrollIntervalRef.current = setInterval(() => {
          container.scrollTop -= 10;
        }, 16);
      }
      // Scroll down
      else if (
        mouseY > rect.height - scrollThreshold &&
        container.scrollTop < container.scrollHeight - container.clientHeight
      ) {
        dragScrollIntervalRef.current = setInterval(() => {
          container.scrollTop += 10;
        }, 16);
      }
    },
    [isDragging]
  );

  // Global event listeners for drag selection
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isDragging, handleMouseUp, handleMouseMove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragScrollIntervalRef.current) {
        clearInterval(dragScrollIntervalRef.current);
      }
    };
  }, []);

  // Cell editing handlers
  const handleCellDoubleClick = useCallback(
    (rowIndex: number, columnId: string, currentValue: any) => {
      if (!enableCellEditing) return;
      setEditingCell({ rowIndex, columnId });
      setSelectedCell({ rowIndex, columnId });
      setCellValue(String(currentValue || ''));
    },
    [enableCellEditing]
  );

  const handleCellClick = useCallback(
    (rowIndex: number, columnId: string, e: React.MouseEvent) => {
      // Don't interfere with drag selection
      if (isDragging) return;
      // Don't select cell if clicking on checkbox
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      setSelectedCell({ rowIndex, columnId });
    },
    [isDragging]
  );

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, columnId: string, currentValue: any) => {
      if (!enableCellEditing) return;

      // Start editing on printable character
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !editingCell) {
        e.preventDefault();
        setEditingCell({ rowIndex, columnId });
        setSelectedCell({ rowIndex, columnId });
        setCellValue(e.key);
      }
      // Enter to edit
      else if (e.key === 'Enter' && !editingCell) {
        e.preventDefault();
        setEditingCell({ rowIndex, columnId });
        setSelectedCell({ rowIndex, columnId });
        setCellValue(String(currentValue || ''));
      }
    },
    [editingCell, enableCellEditing]
  );

  const commitCellEdit = useCallback(() => {
    if (!editingCell || !tableRef.current) return;

    const rows = tableRef.current.getRowModel().rows;
    const row = rows[editingCell.rowIndex];
    if (!row) {
      setEditingCell(null);
      return;
    }

    const cell = row.getVisibleCells().find((c: any) => c.column.id === editingCell.columnId);
    const oldValue = cell ? cell.getValue() : undefined;

    // Only call callback if value actually changed
    if (String(oldValue) !== cellValue && onCellChange) {
      onCellChange({
        rowIndex: editingCell.rowIndex,
        columnId: editingCell.columnId,
        oldValue,
        newValue: cellValue,
        row: row.original,
      });
    }

    setEditingCell(null);
  }, [editingCell, cellValue, onCellChange]);

  const cancelCellEdit = useCallback(() => {
    setEditingCell(null);
    setCellValue('');
  }, []);

  const handleEditingCellKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitCellEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelCellEdit();
      }
    },
    [commitCellEdit, cancelCellEdit]
  );

  // Focus the input when editing starts
  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
      cellInputRef.current.select();
    }
  }, [editingCell]);

  // Copy/Paste functionality
  useEffect(() => {
    const handleCopy = async (e: ClipboardEvent) => {
      if (!selectedCell || editingCell || !tableRef.current) return;

      const rows = tableRef.current.getRowModel().rows;
      const columns = tableRef.current.getVisibleFlatColumns();

      // Get selected rows
      const selectedRowIds = Object.keys(rowSelection);
      if (selectedRowIds.length > 0) {
        // Copy multiple rows
        e.preventDefault();
        const rowSelectionMap = rowSelection as Record<string, boolean>;
        const selectedRowsData = rows.filter((row: any) => rowSelectionMap[row.id]);
        const columnsToInclude = columns.filter((col: any) => col.id !== 'select');

        const copyData = selectedRowsData
          .map((row: any) =>
            columnsToInclude
              .map((col: any) => {
                const cell = row.getVisibleCells().find((c: any) => c.column.id === col.id);
                return cell ? String(cell.getValue() || '') : '';
              })
              .join('\t')
          )
          .join('\n');

        await navigator.clipboard.writeText(copyData);
        console.log('Copied rows to clipboard');
      } else if (selectedCell) {
        // Copy single cell
        e.preventDefault();
        const row = rows[selectedCell.rowIndex];
        if (row) {
          const cell = row
            .getVisibleCells()
            .find((c: any) => c.column.id === selectedCell.columnId);
          if (cell) {
            await navigator.clipboard.writeText(String(cell.getValue() || ''));
            console.log('Copied cell to clipboard');
          }
        }
      }
    };

    const handlePaste = async (e: ClipboardEvent) => {
      if (!selectedCell || editingCell) return;

      e.preventDefault();
      const clipboardData = e.clipboardData?.getData('text');
      if (!clipboardData) return;

      console.log('Pasted data:', clipboardData);
      // Here you would typically parse the clipboard data and update cells
      // For now, we'll just log it
    };

    const handleCopyKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        handleCopy(e as any);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        handlePaste(e as any);
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleCopyKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleCopyKeyDown);
    };
  }, [selectedCell, editingCell, rowSelection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || editingCell || !tableRef.current) return;

      const rows = tableRef.current.getRowModel().rows;
      const columns = tableRef.current.getVisibleFlatColumns();
      const currentRowIndex = selectedCell.rowIndex;
      const currentColIndex = columns.findIndex((col: any) => col.id === selectedCell.columnId);

      let newRowIndex = currentRowIndex;
      let newColIndex = currentColIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRowIndex = Math.max(0, currentRowIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRowIndex = Math.min(rows.length - 1, currentRowIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newColIndex = Math.max(0, currentColIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newColIndex = Math.min(columns.length - 1, currentColIndex + 1);
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            newColIndex = currentColIndex - 1;
            if (newColIndex < 0 && currentRowIndex > 0) {
              newRowIndex = currentRowIndex - 1;
              newColIndex = columns.length - 1;
            }
          } else {
            newColIndex = currentColIndex + 1;
            if (newColIndex >= columns.length && currentRowIndex < rows.length - 1) {
              newRowIndex = currentRowIndex + 1;
              newColIndex = 0;
            }
          }
          newColIndex = Math.max(0, Math.min(columns.length - 1, newColIndex));
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          // Clear cell content
          console.log('Clear cell:', {
            rowIndex: currentRowIndex,
            columnId: selectedCell.columnId,
          });
          break;
        default:
          return;
      }

      if (newRowIndex !== currentRowIndex || newColIndex !== currentColIndex) {
        setSelectedCell({ rowIndex: newRowIndex, columnId: columns[newColIndex].id });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, editingCell]);

  // Update columns with custom sorting functions
  const updatedColumns = useMemo(() => {
    return columns.map(column => {
      const columnId = column.id as ColumnUserDefinitions;
      // Apply custom sorting functions to specific columns
      if (columnId === 'portfolioValue') {
        return { ...column, sortingFn: 'portfolioSorting' as keyof CustomSortingFns };
      }
      if (columnId === 'transactions') {
        return { ...column, sortingFn: 'transactionSorting' as keyof CustomSortingFns };
      }
      if (columnId === 'tokens') {
        return { ...column, sortingFn: 'tokensSorting' as keyof CustomSortingFns };
      }
      if (columnId === 'activity') {
        return { ...column, sortingFn: 'activitySorting' as keyof CustomSortingFns };
      }
      if (columnId === 'walletFundedAt' || columnId === 'privyCreatedAt') {
        return { ...column, sortingFn: 'dateSorting' as keyof CustomSortingFns };
      }
      return column;
    });
  }, [columns]);

  // Create selection column if enabled
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return updatedColumns;

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

    return [selectionColumn, ...updatedColumns];
  }, [updatedColumns, enableRowSelection, rowSelection, handleRowSelectionChange]);

  // Generate custom column definitions
  const customColumnDefs = useMemo(() => {
    if (!enableCustomColumns) return [];
    return generateCustomColumnDefs(data);
  }, [enableCustomColumns, generateCustomColumnDefs, data]);

  // Add "+ Add" button column if custom columns are enabled
  const addButtonColumn = useMemo((): ColumnDef<TData> | null => {
    if (!enableCustomColumns) return null;

    return {
      id: '__add_column__',
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddColumnDialogOpen(true)}
          className="h-8 w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
          <Plus className="h-4 w-4" />
          <span>Add</span>
        </Button>
      ),
      cell: () => <div />,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 100,
      minSize: 100,
      maxSize: 100,
    };
  }, [enableCustomColumns]);

  // Combine all columns: selection + regular + custom + add button
  const finalColumns = useMemo(() => {
    const cols = [...tableColumns, ...customColumnDefs];
    if (addButtonColumn) {
      cols.push(addButtonColumn);
    }
    return cols;
  }, [tableColumns, customColumnDefs, addButtonColumn]);

  // Memoize sorting functions to prevent recreation on every render
  const sortingFns = useMemo(
    () => createCustomSortingFns(walletContext) as CustomSortingFns,
    [walletContext]
  );

  const table = useReactTable({
    data,
    columns: finalColumns as any,
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
    // Add custom sorting functions with wallet context
    sortingFns,
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

  // Store table reference for use in effects
  tableRef.current = table;

  // Sortable header component - memoized to prevent unnecessary re-renders
  const SortableHeader = memo(({ column }: { column: any }) => {
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
  });

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
          <div className="flex-1 overflow-auto scrollbar-hidden relative h-full">
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
                  columns={tableColumns as any}
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
              ref={tableContainerRef}
              className="flex-1 overflow-auto scrollbar-hidden relative h-full"
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
                          row.getIsSelected() && 'bg-muted/30',
                          isDragging && 'select-none'
                        )}
                        style={{
                          animationDelay: `${index * 30}ms`,
                          animationFillMode: 'both',
                          userSelect: isDragging ? 'none' : 'auto',
                        }}
                        onMouseDown={e => {
                          handleRowMouseDown(index, row.id, e);
                        }}
                        onMouseEnter={() => {
                          handleRowMouseEnter(index, row.id, table.getRowModel().rows);
                        }}
                        onClick={e => {
                          if (isDragging) return;
                          if ((e.target as HTMLElement).tagName === 'INPUT') return;
                          // Prevent multiple rapid clicks
                          if (e.detail > 1) return;
                          // Use requestAnimationFrame to debounce the click
                          requestAnimationFrame(() => {
                            onRowClick?.(row.original);
                          });
                        }}>
                        {row.getVisibleCells().map((cell, cellIndex) => {
                          const isFrozen = (cell.column.columnDef.meta as any)?.frozen;
                          const leftPosition = isFrozen
                            ? calculateFrozenColumnPosition(cellIndex, row.getVisibleCells())
                            : 'auto';

                          const rowIndex = index;
                          const columnId = cell.column.id;
                          const isEditing =
                            editingCell?.rowIndex === rowIndex &&
                            editingCell?.columnId === columnId;
                          const isSelected =
                            selectedCell?.rowIndex === rowIndex &&
                            selectedCell?.columnId === columnId;
                          const isSelectColumn = columnId === 'select';

                          return (
                            <TableCell
                              key={cell.id}
                              tabIndex={isSelectColumn ? -1 : 0}
                              style={{
                                width: cell.column.getSize(),
                                position: isFrozen ? ('sticky' as const) : ('relative' as const),
                                left: leftPosition,
                                zIndex: isFrozen ? 5 : 'auto',
                                backgroundColor: isFrozen
                                  ? 'hsl(var(--background))'
                                  : 'transparent',
                                boxShadow: isFrozen
                                  ? '1px 0 0 0 hsl(var(--border))'
                                  : isSelected
                                    ? '0 0 0 2px hsl(var(--primary))'
                                    : 'none',
                                outline: 'none',
                              }}
                              className={cn(
                                'overflow-hidden py-3 relative',
                                isFrozen && 'shadow-sm',
                                isSelected && 'ring-2 ring-primary ring-inset',
                                !isSelectColumn && 'cursor-cell'
                              )}
                              onClick={e => {
                                if (!isSelectColumn) {
                                  handleCellClick(rowIndex, columnId, e);
                                }
                              }}
                              onDoubleClick={() => {
                                if (!isSelectColumn) {
                                  handleCellDoubleClick(rowIndex, columnId, cell.getValue());
                                }
                              }}
                              onKeyDown={e => {
                                if (!isSelectColumn) {
                                  handleCellKeyDown(e, rowIndex, columnId, cell.getValue());
                                }
                              }}>
                              {isEditing && !isSelectColumn ? (
                                <input
                                  ref={cellInputRef}
                                  type="text"
                                  value={cellValue}
                                  onChange={e => setCellValue(e.target.value)}
                                  onKeyDown={handleEditingCellKeyDown}
                                  onBlur={commitCellEdit}
                                  className="w-full h-full px-2 py-1 border-0 bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                flexRender(cell.column.columnDef.cell, cell.getContext())
                              )}
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

      {/* Add Column Dialog */}
      {enableCustomColumns && (
        <AddColumnDialog
          open={isAddColumnDialogOpen}
          onOpenChange={setIsAddColumnDialogOpen}
          onAdd={addColumn}
        />
      )}
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
    case 'walletFundedAt':
      return value;
    default:
      return value;
  }
};
