import { ColumnDef, SortingState } from '@tanstack/react-table';
import { ReactNode } from 'react';

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
  // All data identifiers for "select all pages" functionality
  allDataIdentifiers?: string[];
  // Generic data type support
  getRowDisplayValue?: (row: TData, key: string) => any;
  // Footer props
  enableFooter?: boolean;
  getFooterValue?: (key: string) => any;
  // Initial sorting
  initialSorting?: SortingState;
  // Toolbar props
  tableLabel?: string | ReactNode;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  searchPlaceholder?: string;
  additionalActions?: ReactNode;
  // Spreadsheet functionality
  enableCellEditing?: boolean;
  onCellChange?: (change: {
    rowIndex: number;
    columnId: string;
    oldValue: any;
    newValue: any;
    row: TData;
  }) => void;
  onCellsChange?: (
    changes: Array<{
      rowIndex: number;
      columnId: string;
      oldValue: any;
      newValue: any;
      row: TData;
    }>
  ) => void;
  // Custom columns support
  enableCustomColumns?: boolean;
  customColumns?: import('./add-column-dialog').CustomColumn[];
  onCustomColumnsChange?: (columns: import('./add-column-dialog').CustomColumn[]) => void;
  customColumnData?: Record<string, Record<string, any>>;
  onCustomColumnDataChange?: (data: Record<string, Record<string, any>>) => void;
}

export interface CellEditState {
  rowIndex: number;
  columnId: string;
}

export interface CellSelectState {
  rowIndex: number;
  columnId: string;
}
