'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useGoldPrice } from '@/hooks/useCafeF';
import { formatDate } from 'date-fns';
import { useState } from 'react';
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from 'recharts';

const chartConfig = {
  buy: {
    label: 'Buy',
    color: 'var(--chart-2)',
  },
  sell: {
    label: 'Sell',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export default function GoldPage() {
  const [interval, setInterval] = useState<'1w' | '2w' | '1m'>('1m');
  const { data, isLoading, isError } = useGoldPrice(interval);

  if (isLoading) return <div className="p-6">Loading gold price data...</div>;
  if (isError || !data) return <div className="p-6">Failed to load data</div>;

  const chartData = data.goldPriceWorldHistories
    .filter(item => {
      const days = interval === '1m' ? 30 : interval === '2w' ? 14 : 7;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return new Date(item.createdAt) >= cutoff;
    })
    .map(item => ({
      time: formatDate(new Date(item.createdAt), 'MM/dd'),
      buy: item.buyPrice,
      sell: item.sellPrice,
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vietnam Gold Price */}
        <Card>
          <CardHeader>
            <CardTitle>Vietnam Gold Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xl font-semibold">🇻🇳 {data.goldPriceWorldHistories[0]?.name}</p>
            <p className="text-md">
              Buy: {(data.goldPriceWorldHistories[0]?.buyPrice * 1_000_000).toLocaleString('vi-VN')}{' '}
              VND
            </p>
            <p className="text-md">
              Sell:{' '}
              {(data.goldPriceWorldHistories[0]?.sellPrice * 1_000_000).toLocaleString('vi-VN')} VND
            </p>
            <p className="text-xs text-muted-foreground">
              Updated:{' '}
              {new Date(data.goldPriceWorldHistories[0]?.createdAt).toLocaleString('vi-VN')}
            </p>
          </CardContent>
        </Card>

        {/* World Gold Price */}
        <Card>
          <CardHeader>
            <CardTitle>World Gold Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xl font-semibold">🌍 {data.goldPriceWorlds.name}</p>
            <p className="text-md">
              Price: {data.goldPriceWorlds.price.toLocaleString('vi-VN')} (
              {data.goldPriceWorlds.rate} USD/oz)
            </p>
            <p
              className={`text-sm ${
                data.goldPriceWorlds.changePrice >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {data.goldPriceWorlds.changePrice >= 0 ? '+' : ''}
              {data.goldPriceWorlds.changePrice} ({data.goldPriceWorlds.changePricePercent}%)
            </p>
            <p className="text-xs text-muted-foreground">
              Updated: {new Date(data.goldPriceWorlds.lastUpdate).toLocaleString('vi-VN')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Buy/Sell Price Chart</CardTitle>
          <div className="flex gap-2">
            {['1w', '2w', '1m'].map(key => (
              <Button
                key={key}
                variant={interval === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInterval(key as never)}>
                {key.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Line
                dataKey="buy"
                type="monotone"
                stroke="var(--color-buy)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-buy)',
                }}
                activeDot={{
                  r: 6,
                }}>
                <LabelList
                  position="bottom"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Line>
              <Line
                dataKey="sell"
                type="monotone"
                stroke="var(--color-sell)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-sell)',
                }}
                activeDot={{
                  r: 6,
                }}>
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
              </Line>
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
