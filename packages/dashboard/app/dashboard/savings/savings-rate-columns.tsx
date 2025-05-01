'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColumnDef } from '@tanstack/react-table';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Bank',
    enableSorting: true,
    cell: ({ row }) => {
      const icon = row.original.icon;
      const name = row.original.name;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={icon} className="rounded-full" />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: '0m',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Flexible" />,
    enableSorting: true,
  },
  {
    accessorKey: '1m',
    header: ({ column }) => <DataTableColumnHeader column={column} title="1M" />,
    enableSorting: true,
  },
  {
    accessorKey: '3m',
    header: ({ column }) => <DataTableColumnHeader column={column} title="3M" />,
    enableSorting: true,
  },
  {
    accessorKey: '6m',
    header: ({ column }) => <DataTableColumnHeader column={column} title="6M" />,
    enableSorting: true,
  },
  {
    accessorKey: '12m',
    header: ({ column }) => <DataTableColumnHeader column={column} title="12M" />,
    enableSorting: true,
  },
  {
    accessorKey: '18m',
    header: ({ column }) => <DataTableColumnHeader column={column} title="18M" />,
    enableSorting: true,
  },
  {
    accessorKey: '24m',
    header: ({ column }) => <DataTableColumnHeader column={column} title="24M" />,
    enableSorting: true,
  },
];
