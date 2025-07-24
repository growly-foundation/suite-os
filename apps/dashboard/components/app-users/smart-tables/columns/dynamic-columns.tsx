'use client';

import { ColumnDef, Row } from '@tanstack/react-table';

import { TableUserData, getFormatter } from './column-formatters';

// Field metadata for dynamic column generation
export interface FieldMetadata {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'list' | 'object' | 'custom';
  accessor?: (row: TableUserData) => any;
  formatter?: string;
  size?: number;
  minSize?: number;
  frozen?: boolean;
  sortable?: boolean;
  resizable?: boolean;
}

// Base column definitions for common data types
export const baseColumnDefinitions: Record<
  string,
  (metadata: FieldMetadata) => ColumnDef<TableUserData>
> = {
  string: (metadata: FieldMetadata) => ({
    id: metadata.key,
    accessorFn: (row: TableUserData) => {
      if (metadata.key in row) {
        const value = row[metadata.key as keyof TableUserData];
        return value ?? '';
      }
      return '';
    },
    header: metadata.label,
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter(metadata.formatter || metadata.key)(row.original),
    enableSorting: metadata.sortable !== false,
    enableResizing: metadata.resizable !== false,
    meta: { frozen: metadata.frozen || false },
    size: metadata.size || 150,
    minSize: metadata.minSize || 100,
  }),

  number: (metadata: FieldMetadata) => ({
    id: metadata.key,
    accessorFn:
      metadata.accessor ||
      ((row: TableUserData) => {
        const value = metadata.key in row ? (row as any)[metadata.key] : 0;
        return typeof value === 'number' ? value : 0;
      }),
    header: metadata.label,
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter(metadata.formatter || metadata.key)(row.original),
    enableSorting: metadata.sortable !== false,
    enableResizing: metadata.resizable !== false,
    meta: { frozen: metadata.frozen || false },
    size: metadata.size || 120,
    minSize: metadata.minSize || 80,
  }),

  date: (metadata: FieldMetadata) => ({
    id: metadata.key,
    accessorFn:
      metadata.accessor ||
      ((row: TableUserData) => {
        const value = metadata.key in row ? (row as any)[metadata.key] : null;
        return value ? new Date(value).getTime() : 0;
      }),
    header: metadata.label,
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter(metadata.formatter || metadata.key)(row.original),
    enableSorting: metadata.sortable !== false,
    enableResizing: metadata.resizable !== false,
    meta: { frozen: metadata.frozen || false },
    size: metadata.size || 150,
    minSize: metadata.minSize || 120,
  }),

  boolean: (metadata: FieldMetadata) => ({
    id: metadata.key,
    accessorFn:
      metadata.accessor ||
      ((row: TableUserData) => {
        const value = metadata.key in row ? (row as any)[metadata.key] : false;
        return value ? 1 : 0;
      }),
    header: metadata.label,
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter(metadata.formatter || metadata.key)(row.original),
    enableSorting: metadata.sortable !== false,
    enableResizing: metadata.resizable !== false,
    meta: { frozen: metadata.frozen || false },
    size: metadata.size || 100,
    minSize: metadata.minSize || 80,
  }),

  list: (metadata: FieldMetadata) => ({
    id: metadata.key,
    accessorFn:
      metadata.accessor ||
      ((row: TableUserData) => {
        const value = metadata.key in row ? (row as any)[metadata.key] : [];
        return Array.isArray(value) ? value.length : 0;
      }),
    header: metadata.label,
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter(metadata.formatter || metadata.key)(row.original),
    enableSorting: metadata.sortable !== false,
    enableResizing: metadata.resizable !== false,
    meta: { frozen: metadata.frozen || false },
    size: metadata.size || 200,
    minSize: metadata.minSize || 150,
  }),

  object: (metadata: FieldMetadata) => ({
    id: metadata.key,
    accessorFn:
      metadata.accessor ||
      ((row: TableUserData) => {
        const value = metadata.key in row ? (row as any)[metadata.key] : null;
        return value && typeof value === 'object' ? JSON.stringify(value) : '';
      }),
    header: metadata.label,
    cell: ({ row }: { row: Row<TableUserData> }) =>
      getFormatter(metadata.formatter || metadata.key)(row.original),
    enableSorting: metadata.sortable !== false,
    enableResizing: metadata.resizable !== false,
    meta: { frozen: metadata.frozen || false },
    size: metadata.size || 200,
    minSize: metadata.minSize || 150,
  }),
};

// Function to create column from field metadata
export function createColumnFromMetadata(metadata: FieldMetadata): ColumnDef<TableUserData> {
  const baseDefinition = baseColumnDefinitions[metadata.type];
  if (baseDefinition) {
    return baseDefinition(metadata);
  }

  // Fallback to string type for unknown types
  return baseColumnDefinitions.string(metadata);
}

// Function to create columns from field metadata array
export function createColumnsFromMetadata(fields: FieldMetadata[]): ColumnDef<TableUserData>[] {
  return fields.map(createColumnFromMetadata);
}

// Utility function to create any table configuration from field metadata
export function createTableConfiguration(fields: FieldMetadata[]): ColumnDef<TableUserData>[] {
  const columns: ColumnDef<TableUserData>[] = [];
  columns.push(...createColumnsFromMetadata(fields));
  return columns;
}
