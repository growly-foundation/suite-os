'use client';

import { TableColumn } from '@/components/app-users/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

import { SortDirection, SortIndicator } from './sort-indicator';

interface SortableHeaderProps<T> {
  column: TableColumn<T>;
  sortKey: string | null;
  sortDirection: SortDirection;
  onSort: (key: string, direction: SortDirection) => void;
}

/**
 * Renders a table column header with interactive sorting controls.
 *
 * Displays the column header text and, if the column is sortable, provides clickable sorting functionality and a dropdown menu for selecting sort order or clearing sorting. The available sort options are determined by the column's data type.
 *
 * @param column - The table column definition, including key, header label, type, and sortable flag
 * @param sortKey - The key of the currently sorted column, or null if no sorting is active
 * @param sortDirection - The current sort direction ('asc', 'desc', or null)
 * @param onSort - Callback invoked with the column key and direction to update sorting state
 *
 * @returns A React element representing the sortable table header cell
 */
export function SortableHeader<T>({
  column,
  sortKey,
  sortDirection,
  onSort,
}: SortableHeaderProps<T>) {
  const isActive = sortKey === column.key;
  const currentDirection = isActive ? sortDirection : null;

  // Only show sort options if column is marked as sortable
  if (!column.sortable) {
    return <>{column.header}</>;
  }

  // Generate appropriate sort options based on column type
  const getSortOptions = () => {
    switch (column.type) {
      case 'date':
        return [
          { label: 'Newest first', value: 'desc' },
          { label: 'Oldest first', value: 'asc' },
        ];
      case 'number':
        return [
          { label: 'Highest to lowest', value: 'desc' },
          { label: 'Lowest to highest', value: 'asc' },
        ];
      case 'array':
        return [
          { label: 'Most to fewest', value: 'desc' },
          { label: 'Fewest to most', value: 'asc' },
        ];
      default: // string and others
        return [
          { label: 'A to Z', value: 'asc' },
          { label: 'Z to A', value: 'desc' },
        ];
    }
  };

  const sortOptions = getSortOptions();

  const handleClickHeader = () => {
    // Cycle through: null -> asc -> desc -> null
    if (!isActive) {
      onSort(column.key, 'asc');
    } else if (currentDirection === 'asc') {
      onSort(column.key, 'desc');
    } else {
      // Clear sorting
      onSort(null as any, null);
    }
  };

  return (
    <div className="flex items-center select-none">
      <div
        className="flex items-center cursor-pointer hover:text-primary transition-colors"
        onClick={handleClickHeader}>
        {column.header}
        <SortIndicator direction={currentDirection} />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 ml-0.5">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {sortOptions.map(option => (
            <DropdownMenuItem
              key={option.value}
              className={
                currentDirection === option.value && sortKey === column.key ? 'bg-accent' : ''
              }
              onClick={() => onSort(column.key, option.value as SortDirection)}>
              {option.label}
            </DropdownMenuItem>
          ))}
          {isActive && (
            <DropdownMenuItem onClick={() => onSort(null as any, null)}>
              Clear sorting
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
