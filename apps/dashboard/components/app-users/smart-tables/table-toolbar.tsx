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
import { Search, Settings2 } from 'lucide-react';

interface TableToolbarProps<TData> {
  table: Table<TData>;
  enableColumnVisibility?: boolean;
  enableColumnReordering?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function TableToolbar<TData>({
  table,
  enableColumnVisibility = true,
  enableColumnReordering = false,
  searchPlaceholder = 'Search...',
  onSearch,
}: TableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              onChange={event => onSearch(event.target.value)}
              className="pl-8 h-8 w-[150px] lg:w-[250px]"
            />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Settings2 className="mr-2 h-4 w-4" />
                Views
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
