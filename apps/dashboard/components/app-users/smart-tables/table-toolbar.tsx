'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, GripVertical, Search, Settings2 } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  enableColumnVisibility?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  tableLabel?: string;
  additionalActions?: ReactNode;
  // Pagination props
  enablePagination?: boolean;
}

export function TableToolbar<TData>({
  table,
  enableColumnVisibility = true,
  searchPlaceholder = 'Search...',
  onSearch,
  searchQuery,
  setSearchQuery,
  tableLabel,
  additionalActions,
  // Pagination props
  enablePagination = false,
}: TableToolbarProps<TData>) {
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const handleMoveColumn = (fromIndex: number, direction: 'up' | 'down') => {
    const newOrder = [...columnOrder];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex >= 0 && toIndex < newOrder.length) {
      const [movedColumn] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedColumn);
      setColumnOrder(newOrder);
    }
  };

  const handleApplyReorder = () => {
    // Apply the new column order to the table using the correct API
    table.setColumnOrder(columnOrder);
    setIsReorderModalOpen(false);
  };

  const handleCancelReorder = () => {
    setIsReorderModalOpen(false);
  };

  return (
    <div className="flex items-center justify-between py-4 px-4">
      <div className="flex flex-1 items-center space-x-4">
        {/* Table Label */}
        {tableLabel && (
          <span className="text-sm text-muted-foreground font-medium">{tableLabel}</span>
        )}

        {/* Search Input */}
        {(onSearch || (searchQuery !== undefined && setSearchQuery)) && (
          <div className="relative flex items-center gap-1 border rounded-md px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery || ''}
              onChange={event => {
                const value = event.target.value;
                if (onSearch) {
                  onSearch(value);
                } else if (setSearchQuery) {
                  setSearchQuery(value);
                }
              }}
              className="h-8 w-[150px] border-none lg:w-[250px] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}

        {/* Pagination Info - Compact display */}
        {enablePagination && table.getPageCount() > 1 && (
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Pagination Controls - Compact */}
        {enablePagination && table.getPageCount() > 1 && (
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0">
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Table Actions Dropdown - Consolidates all table actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Settings2 className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-fit"
            onCloseAutoFocus={e => e.preventDefault()}>
            {/* Column Visibility */}
            {enableColumnVisibility && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Columns</div>
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value => {
                          column.toggleVisibility(!!value);
                        }}
                        onSelect={e => e.preventDefault()}>
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Column Reorder */}
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Actions</div>
            <Dialog open={isReorderModalOpen} onOpenChange={setIsReorderModalOpen}>
              <DialogTrigger asChild>
                <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <GripVertical className="mr-2 h-4 w-4" />
                  Reorder Columns
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reorder Columns</DialogTitle>
                  <DialogDescription>
                    Use the up and down arrows to reorder columns. Click Apply to save changes.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {columnOrder.map((columnId, index) => {
                    const column = table.getColumn(columnId);
                    if (!column) return null;

                    return (
                      <div
                        key={columnId}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium capitalize">{columnId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled={index === 0}
                            onClick={() => handleMoveColumn(index, 'up')}>
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            disabled={index === columnOrder.length - 1}
                            onClick={() => handleMoveColumn(index, 'down')}>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancelReorder}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyReorder}>Apply Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Additional Actions (Import Button, etc.) */}
        {additionalActions}
      </div>
    </div>
  );
}
