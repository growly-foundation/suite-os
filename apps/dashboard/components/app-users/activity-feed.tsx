import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { usePeekExplorer } from '@/hooks/use-peek-explorer';
import { WalletData } from '@/hooks/use-wallet-data';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ArrowUpRight,
  Check,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Gift,
  Lock,
  PlusCircle,
  TrendingUp,
  Unlock,
  XCircle,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { getChainIdByName } from '@getgrowly/chainsmith/utils';

import { ChainIcon } from '../ui/chain-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { DynamicTable } from './smart-tables/dynamic-table';

interface ActivityFeedProps {
  walletData: WalletData;
}

type ActivityFeedItem = {
  id: string;
  chainId: number;
  hash: string;
  from: string;
  to: string;
  value: number;
  symbol: string;
  decimals: number;
  timestamp: number;
  operationType: string;
  isNFT?: boolean;
  image?: string;
};

export function ActivityFeed({ walletData }: ActivityFeedProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  const { copyToClipboard, copied } = useCopyToClipboard();
  const { handlePeekTransactionMultichain } = usePeekExplorer();

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (
    from: string,
    to: string,
    userAddress: string,
    operationType?: string
  ) => {
    const type = (operationType || '').toLowerCase();

    // Updated mapping aligned with latest Zerion operation types
    switch (type) {
      case 'approve':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'borrow':
        return <ArrowDownToLine className="h-4 w-4 text-amber-600" />;
      case 'burn':
        return <Flame className="h-4 w-4 text-orange-600" />;
      case 'cancel':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'claim':
        return <Gift className="h-4 w-4 text-violet-600" />;
      case 'deploy':
        return <PlusCircle className="h-4 w-4 text-teal-600" />;
      case 'deposit':
        return <ArrowDownToLine className="h-4 w-4 text-green-600" />;
      case 'execute':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'mint':
        return <PlusCircle className="h-4 w-4 text-emerald-600" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'repay':
        return <ArrowUpFromLine className="h-4 w-4 text-rose-600" />;
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'stake':
        return <Lock className="h-4 w-4 text-indigo-600" />;
      case 'trade':
        return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
      case 'unstake':
        return <Unlock className="h-4 w-4 text-indigo-600" />;
      case 'withdraw':
        return <ArrowUpFromLine className="h-4 w-4 text-red-600" />;
      default:
        break;
    }

    // Fallback: infer from addresses relative to user
    if (from?.toLowerCase() === userAddress?.toLowerCase())
      return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    if (to?.toLowerCase() === userAddress?.toLowerCase())
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    return <TrendingUp className="h-4 w-4 text-blue-600" />;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Transform Zerion transaction data for the table
  const allTableData: ActivityFeedItem[] = useMemo(() => {
    return walletData.transactionItems
      .map((tx: any) => {
        // Get the first transfer from the transaction
        const transfer = tx.transfers?.[0] || {};
        const chainName = tx.chainName || 'base';
        const chainId = getChainIdByName(chainName === 'ethereum' ? 'mainnet' : chainName);
        return {
          id: tx.hash || Math.random().toString(),
          chainId,
          hash: tx.hash || '',
          from: transfer.from || tx.from || '',
          to: transfer.to || tx.to || '',
          value: transfer.value || 0,
          symbol: transfer.symbol || 'ETH',
          decimals: transfer.decimals || 18,
          timestamp: transfer.timestamp || tx.timestamp || Math.floor(Date.now() / 1000),
          operationType: tx.operationType || transfer.operationType || 'transfer',
          isNFT: transfer.isNFT || false,
          image: transfer.image,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [walletData.transactionItems]);

  // Get paginated data for current page
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return allTableData.slice(0, endIndex); // Show all items up to current page
  }, [allTableData, currentPage]);

  // Check if there are more items to load
  const hasMore = useMemo(() => {
    return (currentPage + 1) * PAGE_SIZE < allTableData.length;
  }, [currentPage, allTableData.length]);

  // Handle loading more data
  const handleLoadMore = useCallback(({ page }: { page: number; pageSize: number }) => {
    setLoadingMore(true);

    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage(page);
      setLoadingMore(false);
    }, 500);
  }, []);

  // Column definitions
  const columns: ColumnDef<ActivityFeedItem>[] = useMemo(
    () => [
      {
        accessorKey: 'operationType',
        header: 'Type',
        size: 80,
        cell: ({ row }) => {
          const { from, to, operationType } = row.original;
          const userAddress = '';
          const actionType = operationType || 'transfer';
          const camelCaseAction = actionType.charAt(0).toLowerCase() + actionType.slice(1);

          return (
            <div className="flex justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {getTransactionIcon(from, to, userAddress, operationType)}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{camelCaseAction}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
      {
        accessorKey: 'symbol',
        header: 'Token',
        size: 120,
        cell: ({ row }) => {
          const { symbol, isNFT, image } = row.original;

          return (
            <div className="flex items-center gap-2">
              {image && <img src={image} alt={symbol} className="w-4 h-4 rounded" />}
              <span className="font-medium">{symbol}</span>
              {isNFT && <span className="text-xs text-purple-600">NFT</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'value',
        header: 'Amount',
        size: 120,
        cell: ({ row }) => {
          const { value, symbol, from, to } = row.original;
          const userAddress = ''; // TODO: Get from wallet context
          const isReceived = to.toLowerCase() === userAddress.toLowerCase();
          const isSent = from.toLowerCase() === userAddress.toLowerCase();

          const textColor = isReceived
            ? 'text-green-700'
            : isSent
              ? 'text-red-700'
              : 'text-gray-900';
          const prefix = isReceived ? '+' : isSent ? '-' : '';

          return (
            <div className="text-right">
              <div className={`font-semibold ${textColor}`}>
                {prefix}
                {value.toFixed(6)}
              </div>
              <div className="text-xs text-gray-500">{symbol}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'from',
        header: 'From',
        size: 140,
        cell: ({ row }) => {
          const { from } = row.original;
          return <div className="text-sm">{formatAddress(from)}</div>;
        },
      },
      {
        accessorKey: 'to',
        header: 'To',
        size: 140,
        cell: ({ row }) => {
          const { to } = row.original;
          return <div className="text-sm">{formatAddress(to)}</div>;
        },
      },
      {
        accessorKey: 'chainId',
        header: 'Chain',
        size: 100,
        cell: ({ row }) => {
          const { chainId } = row.original;
          return <ChainIcon chainIds={[chainId]} />;
        },
      },
      {
        accessorKey: 'timestamp',
        header: 'Date',
        size: 120,
        cell: ({ row }) => {
          return (
            <div className="text-sm text-gray-500">{formatTimestamp(row.original.timestamp)}</div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        cell: ({ row }) => {
          const { hash } = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    handlePeekTransactionMultichain(hash);
                  }}>
                  View Transaction
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyToClipboard(hash)}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy Hash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [copyToClipboard, copied, handlePeekTransactionMultichain]
  );

  if (walletData.transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (walletData.transactionsError) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500 text-center">
          <p>Failed to load transactions</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (allTableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500 text-center">
          <p>No transactions found</p>
          <p className="text-sm mt-1">This user hasn't made any transactions yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden h-[400px]">
        <DynamicTable
          data={paginatedData}
          columns={columns}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalItems={allTableData.length}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          isLoading={walletData.transactionsLoading}
          emptyMessage="No transactions found"
          emptyDescription="This user hasn't made any transactions yet"
        />
      </div>
    </div>
  );
}
