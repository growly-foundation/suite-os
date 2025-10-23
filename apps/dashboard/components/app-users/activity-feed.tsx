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
  const [currentPage, setCurrentPage] = useState(0); // Start from 0 to match DynamicTable's expectation
  const PAGE_SIZE = 20;

  const { copyToClipboard, copied } = useCopyToClipboard();
  const { handlePeekTransactionMultichain } = usePeekExplorer();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: number, decimals?: number) => {
    if (decimals && decimals > 0) {
      return (value / Math.pow(10, decimals)).toFixed(4);
    }
    return value.toFixed(4);
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
    return walletData.transactionItems.map((tx: any) => {
      const chainName = tx.chainId === 'ethereum' ? 'mainnet' : tx.chainId;
      // Get the first transfer from the transaction
      const transfer = tx.transfers?.[0] || {};
      const chainId = tx.relationships?.chain?.data?.id || getChainIdByName(chainName) || 1;

      return {
        id: tx.id || tx.hash || '',
        chainId,
        hash: tx.hash || '',
        from: transfer.from || tx.from || '',
        to: transfer.to || tx.to || '',
        value: transfer.value || 0,
        symbol: transfer.symbol || 'ETH',
        decimals: transfer.decimals || 18,
        timestamp: transfer.timestamp || Math.floor(Date.now() / 1000),
        operationType: tx.operationType || transfer.operationType || 'transfer',
        isNFT: transfer.isNFT || false,
        image: transfer.image,
      };
    });
  }, [walletData.transactionItems]);

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
          return (
            <div className="flex justify-center">
              {getTransactionIcon(from, to, userAddress, operationType)}{' '}
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
          const { value, decimals, symbol, from, to } = row.original;
          const userAddress = ''; // TODO: Get from wallet context
          const isReceived = to.toLowerCase() === userAddress.toLowerCase();
          const isSent = from.toLowerCase() === userAddress.toLowerCase();

          const formattedValue = formatValue(value, decimals);
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
                {formattedValue}
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
          return <ChainIcon chainIds={[row.original.chainId]} showTooltip />;
        },
      },
      {
        accessorKey: 'timestamp',
        header: 'Date',
        size: 140,
        cell: ({ row }) => {
          const { timestamp } = row.original;
          return (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              {formatTimestamp(timestamp)}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 80,
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

  const filteredData = useMemo(() => {
    const startIndex = 0;
    const endIndex = (currentPage + 1) * PAGE_SIZE;
    return allTableData.slice(startIndex, endIndex);
  }, [allTableData, currentPage, PAGE_SIZE]);

  const hasMore = useMemo(() => {
    return (currentPage + 1) * PAGE_SIZE < allTableData.length;
  }, [allTableData, currentPage, PAGE_SIZE]);

  const handleLoadMore = useCallback(({ page }: { page: number; pageSize: number }) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden h-[400px]">
        <DynamicTable
          data={filteredData}
          columns={columns}
          enableSorting={true}
          enableColumnResizing={true}
          enableColumnReordering={true}
          enableFooter={false}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          getFooterValue={key => {
            switch (key) {
              case 'operationType':
                return 'Total';
              case 'value':
                // Calculate total value across all transactions
                return allTableData
                  .reduce((sum, item) => {
                    const value = formatValue(item.value, item.decimals);
                    return sum + parseFloat(value);
                  }, 0)
                  .toFixed(4);
              default:
                return '';
            }
          }}
          emptyMessage="No transactions found"
          emptyDescription="No transactions match your current filter."
          className="h-[400px]"
          tableLabel="Transaction History"
          searchPlaceholder="Search transactions..."
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
