import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { consumePersona } from '@/core/persona';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight, Clock, ExternalLink, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { DynamicTable } from './smart-tables/dynamic-table';

interface ActivityFeedProps {
  user: ParsedUser;
}

type ActivityFeedItem = {
  chainName: string;
  activity: any;
  userAddress: string;
};

export function ActivityFeed({ user }: ActivityFeedProps) {
  const persona = consumePersona(user);
  const activityFeed = persona.activityFeed();
  const userAddress = persona.address();

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
  const tableData = useMemo(() => {
    return activityFeed.map(({ activity, chainName }) => ({
      chainName,
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
          return <div className="font-mono text-sm">{formatAddress(activity.from)}</div>;
        },
      },
      {
        accessorKey: 'activity.to',
        header: 'To',
        size: 140,
        cell: ({ row }) => {
          const { activity } = row.original;
          return <div className="font-mono text-sm">{formatAddress(activity.to)}</div>;
        },
      },
      {
        accessorKey: 'chainName',
        header: 'Chain',
        size: 100,
        cell: ({ row }) => {
          const { chainName } = row.original;
          return <div className="capitalize text-sm font-medium">{chainName}</div>;
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
        cell: () => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Transaction</DropdownMenuItem>
                <DropdownMenuItem>Copy Hash</DropdownMenuItem>
                <DropdownMenuItem>View on Explorer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  // Filter data based on selected tab
  const [activeTab, setActiveTab] = useState('all');

  const filteredData = useMemo(() => {
    switch (activeTab) {
      case 'received':
        return tableData.filter(({ activity }) => activity.to === userAddress);
      case 'sent':
        return tableData.filter(({ activity }) => activity.from === userAddress);
      default:
        return tableData;
    }
  }, [tableData, activeTab, userAddress]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="received" className="text-xs">
            Received
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs">
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <DynamicTable
              data={filteredData}
              columns={columns}
              enableSorting={true}
              enableColumnResizing={true}
              enableColumnReordering={true}
              enablePagination={true}
              pageSize={100}
              emptyMessage="No transactions found"
              emptyDescription="No transactions match your current filter."
              className="h-[400px]"
              tableLabel="Transaction History"
              searchPlaceholder="Search transactions..."
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
