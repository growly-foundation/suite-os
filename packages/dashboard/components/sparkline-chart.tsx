'use client';

import { Line, LineChart, YAxis } from 'recharts';
import { ChartConfig, ChartContainer } from './ui/chart';

const chartConfig = {
  bull: {
    label: 'Bulls',
    color: 'var(--color-green-500)',
  },
  bear: {
    label: 'Bear',
    color: 'var(--color-red-500)',
  },
} satisfies ChartConfig;

export const SparklineChart = ({ data }: { data: { time: number; value: number }[] }) => {
  return (
    <ChartContainer config={chartConfig} className="max-w-[200px] max-h-[50px]">
      <LineChart accessibilityLayer data={data}>
        <Line
          dataKey="value"
          type="monotone"
          stroke={
            data[0].value > data[data.length - 1].value ? 'var(--color-bear)' : 'var(--color-bull)'
          }
          strokeWidth={2}
          dot={false}
        />
        <YAxis
          type="number"
          domain={[data[0].value, data[data.length - 1].value]}
          width={0}
          axisLine={false}
        />
      </LineChart>
    </ChartContainer>
  );
};
