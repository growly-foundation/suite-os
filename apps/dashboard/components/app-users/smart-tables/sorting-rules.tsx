'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, X } from 'lucide-react';

interface SortingRulesProps<TData> {
  table: Table<TData>;
}

export function SortingRules<TData>({ table }: SortingRulesProps<TData>) {
  const sortingState = table.getState().sorting;
  const sortedColumnsCount = sortingState.length;

  if (sortedColumnsCount === 0) {
    return null;
  }

  const handleClearAll = () => {
    table.resetSorting();
  };

  const handleRemoveSort = (columnId: string) => {
    const newSorting = sortingState.filter(sort => sort.id !== columnId);
    table.setSorting(newSorting);
  };

  const getSortIcon = (direction: 'asc' | 'desc' | false) => {
    if (direction === 'asc') {
      return <ArrowUp className="h-3 w-3" />;
    }
    if (direction === 'desc') {
      return <ArrowDown className="h-3 w-3" />;
    }
    return <ArrowUpDown className="h-3 w-3" />;
  };

  const getColumnDisplayName = (columnId: string) => {
    const column = table.getAllColumns().find(col => col.id === columnId);
    if (!column) return columnId;

    // Try to get header value
    const header = column.columnDef.header;
    if (typeof header === 'string') {
      return header;
    }

    // Fallback to column id with capitalization
    return columnId.charAt(0).toUpperCase() + columnId.slice(1);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 relative">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sorting
          <Badge
            variant="secondary"
            className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {sortedColumnsCount}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Active Sorting Rules
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
          {sortingState.map((sort, index) => (
            <DropdownMenuItem
              key={sort.id}
              className="flex items-center justify-between gap-2 cursor-default focus:bg-muted/50"
              onSelect={e => e.preventDefault()}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-muted-foreground font-mono w-4 text-center">
                  {index + 1}
                </span>
                {getSortIcon(sort.desc ? 'desc' : 'asc')}
                <span className="truncate text-sm">{getColumnDisplayName(sort.id)}</span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge variant={sort.desc ? 'destructive' : 'default'} className="text-xs px-2">
                  {sort.desc ? 'DESC' : 'ASC'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/10"
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveSort(sort.id);
                  }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {sortedColumnsCount > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleClearAll}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <X className="mr-2 h-4 w-4" />
              Clear All Sorting
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
