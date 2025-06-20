'use client';

export enum ColumnType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  COMPONENT = 'COMPONENT',
  DATE = 'DATE',
}

export enum AdvancedColumnType {
  BATCH = 'BATCH',
}

export type DateColumn = {
  type: ColumnType.DATE;
};

export type NumberColumn = {
  type: ColumnType.NUMBER;
};

export type StringColumn = {
  type: ColumnType.STRING;
};

export type ArrayColumn<T> = {
  type: ColumnType.ARRAY;
};

export type ObjectColumn<T> = {
  type: ColumnType.OBJECT;
};

export type ComponentColumn<T> = {
  type: ColumnType.COMPONENT;
};

export interface BatchRenderTableColumn<T> {
  type: AdvancedColumnType.BATCH;
  batchRenderer: (item?: T) => TableColumn<T>[];
}

export type TableColumn<T> = TableColumnMeta<T> &
  (
    | DateColumn
    | NumberColumn
    | StringColumn
    | ArrayColumn<T>
    | ObjectColumn<T>
    | ComponentColumn<T>
  );

export type SmartTableColumn<T> = TableColumn<T> | BatchRenderTableColumn<T>;

// Extracted cell data that can be used for sorting, filtering, etc.
export interface ExtractedCellData {
  raw: any; // The raw value used for sorting/filtering
  display?: string; // Optional formatted value for display and filtering
}

export type ExtractedRowData = Record<string, ExtractedCellData>;

export type TableColumnMeta<T> = {
  key: string;
  header: string | React.ReactNode;
  headerIcon?: React.ReactNode;
  width?: string;
  className?: string;
  sticky?: boolean;
  border?: boolean;
  sortable?: boolean;
  // Updated to optionally receive extracted data for the item
  contentRenderer: (item: T, extractedData: ExtractedRowData) => React.ReactNode;
  // Extract a value from the item that can be used for sorting and filtering
  dataExtractor?: (item: T) => ExtractedCellData;
  // For backward compatibility - will be used if dataExtractor is not provided
  sortingValueGetter?: (item: T) => any;
};

type Nullable<T> = T | null | undefined;
