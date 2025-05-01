'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CafeFExchangeRate } from '@/types/cafef';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const getCurrencyIcon = (currency: string) => {
  return `https://cafef1.mediacdn.vn/Images/ExchangeRate/flag_${currency}.svg`;
};

export const columns: ColumnDef<CafeFExchangeRate>[] = [
  {
    accessorKey: 'currencyName',
    header: 'Name',
    cell: ({ row }) => {
      const name = row.original.currencyName;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={getCurrencyIcon(name)} className="rounded-full" />
            <AvatarFallback>{name}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'buyCash',
    header: 'Buy Cash', // Format currency VND
    cell: ({ row }) => (row.original.buyCash ? row.original.buyCash.toLocaleString('vi-VN') : ''),
  },
  {
    accessorKey: 'purchaseTransfer',
    header: 'Purchase Transfer',
    cell: ({ row }) => row.original.purchaseTransfer.toLocaleString('vi-VN'),
  },
  {
    accessorKey: 'price',
    header: 'Price', // Format currency VND
    cell: ({ row }) => row.original.price.toLocaleString('vi-VN'),
  },
];
