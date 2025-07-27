import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { consumePersona } from '@/core/persona';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, MoreHorizontal, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TContractToken } from '@getgrowly/chainsmith/types';
import { getChainNameById } from '@getgrowly/chainsmith/utils';

import { DynamicTable } from './smart-tables/dynamic-table';

interface PortfolioTokenTableProps {
  userPersona: ReturnType<typeof consumePersona>;
}

// Define the token data type
interface TokenData {
  symbol: string;
  name: string;
  logoURI?: string;
  marketPrice: number;
  balance: number;
  chainId: number;
  address?: string;
  token: TContractToken;
}

export function PortfolioTokenTable({ userPersona }: PortfolioTokenTableProps) {
  const tokens = userPersona.universalTokenList();
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Transform tokens to the format expected by table
  const tokenData: TokenData[] = useMemo(() => {
    return tokens.map(token => ({
      symbol: token.symbol || '',
      name: token.name || '',
      logoURI: token.logoURI,
      marketPrice: token.marketPrice || 0,
      balance: token.balance || 0,
      chainId: token.chainId,
      address: (token as TContractToken).address,
      token: token as TContractToken,
    }));
  }, [tokens]);

  // Calculate total value
  const totalValue = useMemo(() => {
    return tokens.reduce((sum, token) => sum + (token.marketPrice || 0) * (token.balance || 0), 0);
  }, [tokens]);

  // Define columns for the DynamicTable
  const columns: ColumnDef<TokenData>[] = [
    {
      accessorKey: 'symbol',
      header: 'Token',
      cell: ({ row }) => {
        const token = row.original;
        return (
          <div className="flex items-center space-x-3">
            {/* Token Icon */}
            {token.logoURI ? (
              <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {token.symbol.charAt(0) || 'T'}
              </div>
            )}

            {/* Token Info */}
            <div className="flex flex-col">
              <div className="font-semibold text-gray-900">{token.symbol}</div>
              <div className="text-sm text-gray-600 truncate max-w-[150px]">{token.name}</div>
            </div>
          </div>
        );
      },
      size: 200,
      minSize: 200,
      meta: {
        frozen: true,
      },
    },
    {
      accessorKey: 'marketPrice',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.original.marketPrice;
        return <div className="font-medium text-gray-900">${price.toFixed(6)}</div>;
      },
      size: 120,
      minSize: 120,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => {
        const token = row.original;
        return (
          <div className="font-medium text-gray-900">
            <div>{token.balance.toFixed(4)}</div>
            <div className="text-sm text-gray-600">{token.symbol}</div>
          </div>
        );
      },
      size: 140,
      minSize: 140,
    },
    {
      accessorKey: 'marketPrice',
      id: 'value',
      header: 'Value',
      cell: ({ row }) => {
        const token = row.original;
        const value = token.marketPrice * token.balance;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return (
          <div className="text-gray-900">
            <div className="font-semibold">${value.toFixed(2)}</div>
            <div className="text-xs text-gray-500">{percentage.toFixed(1)}% of portfolio</div>
          </div>
        );
      },
      size: 150,
      minSize: 150,
    },
    {
      accessorKey: 'chainId',
      header: 'Chain',
      cell: ({ row }) => {
        const chainName = getChainNameById(row.original.chainId);
        return (
          <Badge variant="outline" className="text-xs">
            {chainName}
          </Badge>
        );
      },
      size: 100,
      minSize: 100,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const token = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(token.address || '')}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
      minSize: 50,
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* DynamicTable */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <DynamicTable
          data={tokenData}
          columns={columns}
          enableSorting={true}
          enableColumnResizing={true}
          enableColumnReordering={true}
          enablePagination={true}
          pageSize={100}
          emptyMessage="No tokens found"
          emptyDescription="No tokens match your search criteria."
          className="h-[400px]"
          tableLabel="Token Holdings"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search tokens..."
        />
      </div>
    </div>
  );
}
