import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { ColumnType, CustomColumn } from './add-column-dialog';

export interface CustomColumnData {
  [rowId: string]: {
    [columnId: string]: any;
  };
}

export interface UseCustomColumnsOptions<TData> {
  onDataChange?: (data: CustomColumnData) => void;
  initialColumns?: CustomColumn[];
  initialData?: CustomColumnData;
  getRowId: (row: TData) => string;
}

export interface UseCustomColumnsReturn<TData = any> {
  customColumns: CustomColumn[];
  customData: CustomColumnData;
  addColumn: (column: CustomColumn) => void;
  removeColumn: (columnId: string) => void;
  updateColumnName: (columnId: string, newName: string) => void;
  updateCellValue: (rowId: string, columnId: string, value: any) => void;
  getCellValue: (rowId: string, columnId: string) => any;
  generateColumnDefs: (data: TData[]) => ColumnDef<TData>[];
}

export function useCustomColumns<TData = any>({
  onDataChange,
  initialColumns = [],
  initialData = {},
  getRowId,
}: UseCustomColumnsOptions<TData>): UseCustomColumnsReturn<TData> {
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>(initialColumns);
  const [customData, setCustomData] = useState<CustomColumnData>(initialData);
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);

  const addColumn = useCallback((column: CustomColumn) => {
    setCustomColumns(prev => [...prev, column]);
  }, []);

  const removeColumn = useCallback((columnId: string) => {
    setCustomColumns(prev => prev.filter(col => col.id !== columnId));
    setCustomData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(rowId => {
        delete newData[rowId][columnId];
      });
      return newData;
    });
  }, []);

  const updateColumnName = useCallback((columnId: string, newName: string) => {
    setCustomColumns(prev =>
      prev.map(col => (col.id === columnId ? { ...col, name: newName } : col))
    );
  }, []);

  const updateCellValue = useCallback(
    (rowId: string, columnId: string, value: any) => {
      setCustomData(prev => {
        const newData = {
          ...prev,
          [rowId]: {
            ...prev[rowId],
            [columnId]: value,
          },
        };
        onDataChange?.(newData);
        return newData;
      });
    },
    [onDataChange]
  );

  const getCellValue = useCallback(
    (rowId: string, columnId: string) => {
      return customData[rowId]?.[columnId];
    },
    [customData]
  );

  const renderCellEditor = useCallback(
    (rowId: string, columnId: string, columnType: ColumnType, currentValue: any) => {
      const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId;

      if (!isEditing) {
        return (
          <div
            className="min-h-[2rem] px-2 py-1 cursor-text hover:bg-muted/30 rounded transition-colors"
            onClick={e => {
              e.stopPropagation();
              setEditingCell({ rowId, columnId });
            }}>
            {currentValue || <span className="text-muted-foreground italic">Click to edit...</span>}
          </div>
        );
      }

      const handleBlur = (value: any) => {
        updateCellValue(rowId, columnId, value);
        setEditingCell(null);
      };

      switch (columnType) {
        case 'number':
          return (
            <input
              type="number"
              defaultValue={currentValue}
              autoFocus
              onBlur={e => handleBlur(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleBlur((e.target as HTMLInputElement).value);
                } else if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
              className="w-full h-full px-2 py-1 border-0 bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded"
            />
          );

        case 'date':
          return (
            <input
              type="date"
              defaultValue={currentValue}
              autoFocus
              onBlur={e => handleBlur(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleBlur((e.target as HTMLInputElement).value);
                } else if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
              className="w-full h-full px-2 py-1 border-0 bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded"
            />
          );

        default: // text and others
          return (
            <input
              type="text"
              defaultValue={currentValue}
              autoFocus
              onBlur={e => handleBlur(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleBlur((e.target as HTMLInputElement).value);
                } else if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
              className="w-full h-full px-2 py-1 border-0 bg-background focus:outline-none focus:ring-2 focus:ring-primary rounded"
            />
          );
      }
    },
    [editingCell, updateCellValue]
  );

  const generateColumnDefs = useCallback(
    (data: TData[]): ColumnDef<TData>[] => {
      return customColumns.map(column => ({
        id: column.id,
        accessorFn: (row: TData) => {
          const rowId = getRowId(row);
          return getCellValue(rowId, column.id);
        },
        header: () => (
          <div className="flex items-center justify-between gap-2 group">
            <span className="font-medium">{column.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const newName = prompt('Enter new column name:', column.name);
                    if (newName && newName.trim()) {
                      updateColumnName(column.id, newName.trim());
                    }
                  }}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm(`Delete column "${column.name}"?`)) {
                      removeColumn(column.id);
                    }
                  }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        cell: ({ row }) => {
          const rowId = getRowId(row.original);
          const currentValue = getCellValue(rowId, column.id);
          return renderCellEditor(rowId, column.id, column.type, currentValue);
        },
        size: 200,
        minSize: 150,
        maxSize: 500,
      }));
    },
    [customColumns, getCellValue, renderCellEditor, getRowId, removeColumn, updateColumnName]
  );

  return {
    customColumns,
    customData,
    addColumn,
    removeColumn,
    updateColumnName,
    updateCellValue,
    getCellValue,
    generateColumnDefs,
  };
}
