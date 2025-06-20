'use client';

export type ColumnType = 'string' | 'number' | 'array' | 'object' | 'component' | 'date';

export interface TableColumn<T = any> {
  key: string;
  header: string | React.ReactNode;
  type: ColumnType;
  headerIcon?: React.ReactNode;
  width?: string;
  className?: string;
  sticky?: boolean;
  border?: boolean;
  sortable?: boolean;
  contentRenderer: (item: T) => React.ReactNode;
  // Optional getter function to extract sortable value
  sortingValueGetter?: (item: T) => any;
}

export interface BatchRenderTableColumn<T> {
  type: 'batch';
  batchRenderer: (item?: T) => TableColumn<T>[];
}

export type SmartTableColumn<T> = TableColumn<T> | BatchRenderTableColumn<T>;
