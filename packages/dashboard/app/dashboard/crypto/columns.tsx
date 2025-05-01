import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SparklineChart } from '@/components/sparkline-chart';
import { CoingeckoMarket } from '@/types/coingecko';

export const columns: ColumnDef<CoingeckoMarket>[] = [
  {
    accessorKey: 'name',
    header: 'Coin',
    cell: ({ row }) => {
      const coin = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={coin.image} />
            <AvatarFallback>{coin.symbol.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{coin.name}</span>
          <span>{coin.symbol.toUpperCase()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'current_price',
    header: 'Price',
    cell: ({ row }) =>
      `$${row.original.current_price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
  },
  {
    accessorKey: 'price_change_percentage_24h',
    header: '24h Change',
    cell: ({ row }) => {
      const val = row.original.price_change_percentage_24h;
      return (
        <span className={val >= 0 ? 'text-green-600' : 'text-red-600'}>{val?.toFixed(2)}%</span>
      );
    },
  },
  {
    accessorKey: 'market_cap',
    header: 'Market Cap',
    cell: ({ row }) => `$${row.original.market_cap.toLocaleString('en-US')}`,
  },
  {
    id: 'sparkline',
    header: '7d Trend',
    cell: ({ row }) => {
      const data =
        row.original.sparkline_in_7d?.price?.map((value: number, i: number) => ({
          value,
          time: i,
        })) ?? [];
      return <SparklineChart data={data} />;
    },
  },
];
