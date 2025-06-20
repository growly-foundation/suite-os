'use client';

export enum ColumnType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
}

export enum AdvancedColumnType {
  BATCH = 'BATCH',
}

export enum AggregationOption {
  SUM = 'SUM',
  COUNT = 'COUNT',
}

export type DateColumn<T> = {
  type: ColumnType.DATE;
  dataExtractor: (item: T) => number | undefined;
  contentRenderer(extractedData: number): React.ReactNode;
};

export type NumberColumn<T> = {
  type: ColumnType.NUMBER;
  dataExtractor: (item: T) => number;
  contentRenderer(extractedData: number): React.ReactNode;
};

export type StringColumn<T> = {
  type: ColumnType.STRING;
  dataExtractor: (item: T) => string;
  contentRenderer(extractedData: string): React.ReactNode;
};

export type ArrayColumn<T> = {
  type: ColumnType.ARRAY;
  dataExtractor: (item: T) => any[];
  contentRenderer(extractedData: any[]): React.ReactNode;
};

export type ObjectColumn<T> = {
  type: ColumnType.OBJECT;
  dataExtractor: (item: T) => Record<string, any>;
  contentRenderer(extractedData: Record<string, any>): React.ReactNode;
};

export type BooleanColumn<T> = {
  type: ColumnType.BOOLEAN;
  dataExtractor: (item: T) => boolean;
  contentRenderer(extractedData: boolean): React.ReactNode;
};

export interface BatchRenderTableColumn<T> {
  type: AdvancedColumnType.BATCH;
  batchRenderer: (item?: T) => TableColumn<T>[];
}

export type TableColumn<T> = TableColumnMeta &
  SortableColumn<T> &
  (
    | DateColumn<T>
    | NumberColumn<T>
    | StringColumn<T>
    | ArrayColumn<T>
    | ObjectColumn<T>
    | BooleanColumn<T>
  );

export type SmartTableColumn<T> = TableColumn<T> | BatchRenderTableColumn<T>;

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

export type SortableColumn<T> =
  | {
      sortable?: true;
      sortingValueGetter?: (item: T) => any;
    }
  | {
      sortable?: false;
    };
