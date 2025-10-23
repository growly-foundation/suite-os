import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { usePeekExplorer } from '@/hooks/use-peek-explorer';
import { WalletData } from '@/hooks/use-wallet-data';
import { formatAssetValue } from '@/lib/number.utils';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, ExternalLink, MoreHorizontal } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { ChainIcon } from '../ui/chain-icon';
import { DynamicTable } from './smart-tables/dynamic-table';

interface PortfolioTokenTableProps {
  walletData: WalletData;
}

// Define the token data type based on unified TokenPortfolioPosition format
interface TokenData {
  id: string;
  symbol: string;
  name: string;
  logoURI?: string;
  marketPrice: number;
  balance: number;
  chainId: number;
  address?: string;
  value: number; // USD value
  quantity: any; // Raw quantity data
}

export function PortfolioTokenTable({ walletData }: PortfolioTokenTableProps) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();
  const { handlePeekTokenMultichain } = usePeekExplorer();

  // Transform unified TokenPortfolioPosition to the format expected by table
  const allTokenData: TokenData[] = useMemo(() => {
    return walletData.fungiblePositions.map(position => {
      return {
        id: position.id || '',
        symbol: position.symbol || '',
        name: position.name || '',
        logoURI: position.logo || undefined,
        marketPrice: position.price || 0,
        balance: position.tokenBalanceFloat || 0,
        chainId: parseInt(position.chainId) || 1,
        address: position.tokenAddress || undefined,
        value: position.value || 0,
        quantity: position.tokenBalance || '', // Raw balance string
      };
    });
  }, [walletData.fungiblePositions]);

  // Filter and paginate tokens
  const filteredTokenData = useMemo(() => {
    if (!searchQuery) return allTokenData;
    return allTokenData.filter(
      token =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTokenData, searchQuery]);

  // Apply pagination
  const tokenData = useMemo(() => {
    return filteredTokenData.slice(0, page * PAGE_SIZE);
  }, [filteredTokenData, page]);

  // Check if there are more items to load
  const hasMore = useMemo(() => {
    return page * PAGE_SIZE < filteredTokenData.length;
  }, [filteredTokenData.length, page]);

  // Update handleLoadMore
  const handleLoadMore = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setPage(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate total value
  const totalValue = useMemo(() => {
    return walletData.fungibleTotalUsd;
  }, [walletData.fungibleTotalUsd]);

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
              <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-lg" />
            ) : (
              <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {token.symbol.charAt(0) || 'T'}
              </div>
            )}

            {/* Token Info */}
            <div className="font-semibold text-xs text-gray-900">{token.symbol}</div>
          </div>
        );
      },
      size: 100,
      minSize: 100,
      meta: {
        frozen: true,
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const token = row.original;
        return <div className="text-xs text-gray-600 truncate max-w-[150px]">{token.name}</div>;
      },
      size: 150,
      minSize: 150,
    },
    {
      accessorKey: 'marketPrice',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.original.marketPrice;
        return <div className="font-medium text-xs text-gray-900">${formatAssetValue(price)}</div>;
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
          <div className="font-medium text-xs text-gray-900">
            <div>{formatAssetValue(token.balance)}</div>
          </div>
        );
      },
      size: 140,
      minSize: 140,
    },
    {
      accessorKey: 'value',
      id: 'value',
      header: 'Value',
      cell: ({ row }) => {
        const token = row.original;
        const value = token.value;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        return (
          <div className="text-gray-900">
            <div className="font-semibold">${formatAssetValue(value)}</div>
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
        return <ChainIcon chainIds={[row.original.chainId]} showTooltip />;
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
              <DropdownMenuItem onClick={() => handlePeekTokenMultichain(token.address || '')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
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
      <div className="border border-gray-200 rounded-lg overflow-hidden h-[400px]">
        <DynamicTable
          data={tokenData}
          columns={columns}
          enableSorting={true}
          enableColumnResizing={true}
          enableColumnReordering={true}
          emptyMessage="No tokens found"
          emptyDescription="No tokens match your search criteria."
          className="h-[400px]"
          pageSize={PAGE_SIZE}
          getFooterValue={key => {
            switch (key) {
              case 'symbol':
                return 'Total';
              case 'marketPrice':
                return '';
              case 'balance':
                return '';
              case 'value':
                return totalValue;
              default:
                return '';
            }
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search tokens..."
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loadingMore={isLoading}
        />
      </div>
    </div>
  );
}
