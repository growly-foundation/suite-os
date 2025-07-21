'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, GripVertical, Search, Settings2 } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  enableColumnVisibility?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  tableLabel?: string;
  additionalActions?: ReactNode;
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
  enablePagination = false,
}: TableToolbarProps<TData>) {
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Initialize column order once on mount
  useEffect(() => {
    const currentOrder = table
      .getAllColumns()
      .filter(col => col.getCanHide() || col.id === 'select')
      .map(col => col.id);

    setColumnOrder(currentOrder);
    table.setColumnOrder(currentOrder);
  }, [table]);

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);

    // Create custom drag preview
    const dragPreview = e.currentTarget.cloneNode(true) as HTMLElement;
    dragPreview.style.opacity = '0.8';
    dragPreview.style.transform = 'rotate(5deg)';
    dragPreview.style.pointerEvents = 'none';
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);

    // Remove preview after drag starts
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedColumn && draggedColumn !== columnId) {
      setDragOverColumn(columnId);

      // Determine drop position based on mouse position
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseY = e.clientY;
      const centerY = rect.top + rect.height / 2;

      setDropPosition(mouseY < centerY ? 'before' : 'after');
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnId) return;

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1);

      // Insert based on drop position
      const insertIndex = dropPosition === 'before' ? targetIndex : targetIndex + 1;
      newOrder.splice(insertIndex, 0, draggedColumn);

      setColumnOrder(newOrder);
      table.setColumnOrder(newOrder); // ✅ Apply immediately
    }

    setDraggedColumn(null);
    setDragOverColumn(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
    setDropPosition(null);
  };

  return (
    <div className="flex items-center justify-between py-4 px-4">
      <div className="flex flex-1 items-center space-x-4">
        {tableLabel && (
          <span className="text-sm text-muted-foreground font-medium">{tableLabel}</span>
        )}

        {(onSearch || (searchQuery !== undefined && setSearchQuery)) && (
          <div className="relative flex items-center gap-1 border rounded-md px-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery || ''}
              onChange={e => {
                const value = e.target.value;
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

        {enablePagination && table.getPageCount() > 1 && (
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
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
            {enableColumnVisibility && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Columns</div>
                {columnOrder.map(columnId => {
                  const column = table.getAllColumns().find(c => c.id === columnId);
                  if (!column || !column.getCanHide()) return null;

                  return (
                    <div
                      key={column.id}
                      className={`relative cursor-move transition-all duration-200 ${
                        draggedColumn === column.id
                          ? 'opacity-50 scale-95'
                          : 'opacity-100 scale-100'
                      }`}
                      draggable
                      onDragOver={e => handleDragOver(e, column.id)}
                      onDrop={e => handleDrop(e, column.id)}
                      onDragEnd={handleDragEnd}
                      onDragStart={e => handleDragStart(e, column.id)}>
                      {/* Drop preview indicator */}
                      {dragOverColumn === column.id && draggedColumn !== column.id && (
                        <div
                          className={`absolute left-0 right-0 h-0.5 bg-primary transition-all duration-200 z-10 ${
                            dropPosition === 'before' ? 'top-0' : 'bottom-0'
                          }`}
                        />
                      )}

                      <DropdownMenuCheckboxItem
                        className={`capitalize flex items-center gap-4 justify-between transition-all duration-200 ${
                          dragOverColumn === column.id && draggedColumn !== column.id
                            ? 'bg-primary/5 border-primary/20'
                            : ''
                        }`}
                        checked={column.getIsVisible()}
                        onCheckedChange={value => column.toggleVisibility(!!value)}
                        onSelect={e => e.preventDefault()}>
                        {column.id}
                        <GripVertical
                          className={`h-4 w-4 text-muted-foreground transition-all duration-200 ${
                            draggedColumn === column.id
                              ? 'opacity-50 scale-90'
                              : 'opacity-100 scale-100'
                          } cursor-move hover:scale-110`}
                        />
                      </DropdownMenuCheckboxItem>
                    </div>
                  );
                })}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {additionalActions}
      </div>
    </div>
  );
}
