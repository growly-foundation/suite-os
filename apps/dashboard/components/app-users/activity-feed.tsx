import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { consumePersona } from '@/core/persona';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { usePeekExplorer } from '@/hooks/use-peek-explorer';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { TChainId } from '@getgrowly/chainsmith/types';
import { getChainIdByName } from '@getgrowly/chainsmith/utils';
import { ParsedUser } from '@getgrowly/core';

import { ChainIcon } from '../ui/chain-icon';
import { DynamicTable } from './smart-tables/dynamic-table';

interface ActivityFeedProps {
  user: ParsedUser;
}

type ActivityFeedItem = {
  chainId: TChainId;
  activity: any;
  userAddress: string;
};

export function ActivityFeed({ user }: ActivityFeedProps) {
  const [currentPage, setCurrentPage] = useState(0); // Start from 0 to match DynamicTable's expectation
  const PAGE_SIZE = 20;

  const persona = useMemo(() => consumePersona(user), [user]);
  const activityFeed = useMemo(() => persona.activityFeed(), [persona]);
  const userAddress = useMemo(() => persona.address(), [persona]);
  const { copyToClipboard, copied } = useCopyToClipboard();
  const { handlePeekTransactionMultichain } = usePeekExplorer();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: string | number, decimals?: string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const decimalPlaces = decimals ? parseInt(decimals) : 18;
    return (numValue / Math.pow(10, decimalPlaces)).toFixed(4);
  };

  const getTransactionIcon = (activity: any, userAddress: string) => {
    if (activity.from === userAddress) return <ArrowUpRight className="h-4 w-4 text-red-600" />;
    if (activity.to === userAddress) return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    return <TrendingUp className="h-4 w-4 text-blue-600" />;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Transform data for the table
  const allTableData = useMemo(() => {
    return activityFeed.map(({ activity, chainName }) => ({
      chainId: getChainIdByName(chainName),
      activity,
      userAddress,
    }));
  }, [activityFeed, userAddress]);

  // Column definitions
  const columns: ColumnDef<ActivityFeedItem>[] = useMemo(
    () => [
      {
        accessorKey: 'activity',
        header: 'Type',
        size: 80,
        cell: ({ row }) => {
          const { activity, userAddress } = row.original;
          return (
            <div className="flex justify-center">{getTransactionIcon(activity, userAddress)}</div>
          );
        },
      },
      {
        accessorKey: 'activity.symbol',
        header: 'Token',
        size: 120,
        cell: ({ row }) => {
          const { activity } = row.original;

          return <span className="font-medium">{activity.symbol}</span>;
        },
      },
      {
        accessorKey: 'activity.value',
        header: 'Amount',
        size: 120,
        cell: ({ row }) => {
          const { activity, userAddress } = row.original;
          const isReceived = activity.to === userAddress;
          const isSent = activity.from === userAddress;

          const formattedValue = formatValue(activity.value, activity.tokenDecimal);
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
              <div className="text-xs text-gray-500">{activity.symbol}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'activity.from',
        header: 'From',
        size: 140,
        cell: ({ row }) => {
          const { activity } = row.original;
          return <div className="text-sm">{formatAddress(activity.from)}</div>;
        },
      },
      {
        accessorKey: 'activity.to',
        header: 'To',
        size: 140,
        cell: ({ row }) => {
          const { activity } = row.original;
          return <div className="text-sm">{formatAddress(activity.to)}</div>;
        },
      },
      {
        accessorKey: 'chainName',
        header: 'Chain',
        size: 100,
        cell: ({ row }) => {
          return <ChainIcon chainIds={[row.original.chainId]} />;
        },
      },
      {
        accessorKey: 'activity.timeStamp',
        header: 'Date',
        size: 140,
        cell: ({ row }) => {
          const { activity } = row.original;
          return (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              {formatTimestamp(activity.timeStamp)}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        cell: ({ row }) => {
          const { activity } = row.original;
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
                    handlePeekTransactionMultichain(activity.hash);
                  }}>
                  View Transaction
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyToClipboard(activity.hash)}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy Hash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
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
              case 'activity':
                return 'Total';
              case 'activity.value':
                // Calculate total value across all transactions
                return allTableData
                  .reduce((sum, item) => {
                    const value = formatValue(item.activity.value, item.activity.tokenDecimal);
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
