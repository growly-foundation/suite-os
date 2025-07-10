'use client';

export enum ColumnType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',
  COMPONENT = 'COMPONENT',
}

export type ColumnValueExtractor<T, R> = (item: T) => R;

export enum AdvancedColumnType {
  BATCH = 'BATCH',
}

export enum AggregationOption {
  SUM = 'SUM',
  COUNT = 'COUNT',
}

export type DateColumn<T> = {
  type: ColumnType.DATE;
  dataExtractor: ColumnValueExtractor<T, number | undefined>;
  contentRenderer(extractedData: number): React.ReactNode;
};

export type NumberColumn<T> = {
  type: ColumnType.NUMBER;
  dataExtractor: ColumnValueExtractor<T, number>;
  contentRenderer(extractedData: number): React.ReactNode;
};

export type StringColumn<T> = {
  type: ColumnType.STRING;
  dataExtractor: ColumnValueExtractor<T, string>;
  contentRenderer(extractedData: string): React.ReactNode;
};

export type ArrayColumn<T> = {
  type: ColumnType.ARRAY;
  dataExtractor: ColumnValueExtractor<T, any[]>;
  contentRenderer(extractedData: any[]): React.ReactNode;
};

export type ObjectColumn<T> = {
  type: ColumnType.OBJECT;
  dataExtractor: ColumnValueExtractor<T, Record<string, any>>;
  contentRenderer(extractedData: Record<string, any>): React.ReactNode;
};

export type BooleanColumn<T> = {
  type: ColumnType.BOOLEAN;
  dataExtractor: ColumnValueExtractor<T, boolean>;
  contentRenderer(extractedData: boolean): React.ReactNode;
};

export type ComponentColumn<T> = {
  type: ColumnType.COMPONENT;
  dataExtractor: () => undefined;
  contentRenderer(extractedData: any): React.ReactNode;
};

export interface BatchRenderTableColumn<T> {
  type: AdvancedColumnType.BATCH;
  batchRenderer: (item?: T) => TableColumn<T>[];
}

export type TableColumn<T> = TableColumnMeta &
  SortableColumn<T> &
  AggregationColumn<T> &
  (
    | DateColumn<T>
    | NumberColumn<T>
    | StringColumn<T>
    | ArrayColumn<T>
    | ObjectColumn<T>
    | BooleanColumn<T>
    | ComponentColumn<T>
  );

export type SmartTableColumn<T> = TableColumn<T> | BatchRenderTableColumn<T>;

export interface AggregationColumn<T> {
  aggregate?: (extractedData: any) => any;
  aggregateDisabled?: boolean;
}

// Map the column key to the extracted data
export type ExtractedRowData<T> = Record<string, T>;

export type TableColumnMeta = {
  key: string;
  header: string | React.ReactNode;
  headerIcon?: React.ReactNode;
  width?: string;
  className?: string;
  sticky?: boolean;
  border?: boolean;
  contentRenderer(extractedData: any): React.ReactNode;
};

export type SortableColumn<T> = {
  sortable?: boolean;
  sortingValueGetter?: ColumnValueExtractor<T, any>;
};
