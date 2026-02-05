import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatCompactCurrency, cn } from '@/lib/utils';
import type { PriceHistory, TimeRange } from '@shared/types';

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '1M' },
  { value: '90d', label: '3M' },
  { value: '1y', label: '1Y' },
  { value: 'max', label: 'All' },
];

interface PriceChartProps {
  data?: PriceHistory;
  isLoading?: boolean;
  isPositive?: boolean;
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export function PriceChart({
  data,
  isLoading,
  isPositive = true,
  selectedRange,
  onRangeChange,
}: PriceChartProps) {
  const chartData = useMemo(() => {
    if (!data?.prices) return [];
    return data.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
      date: new Date(timestamp),
    }));
  }, [data]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (selectedRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (selectedRange === '7d' || selectedRange === '30d') {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;

    const { timestamp, price } = payload[0].payload;
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleString()}
        </p>
        <p className="text-sm font-bold font-mono">{formatCurrency(price)}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6 border border-border/50 bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1">
            {timeRanges.map((_, i) => (
              <Skeleton key={i} className="h-8 w-12" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  const gradientId = `chart-gradient-${isPositive ? 'up' : 'down'}`;
  const strokeColor = isPositive ? 'rgb(34 197 94)' : 'rgb(239 68 68)';

  return (
    <Card className="p-6 border border-border/50 bg-card/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold">Price Chart</h3>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => onRangeChange(range.value)}
              data-testid={`range-${range.value}`}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={50}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => formatCompactCurrency(value)}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                stroke: strokeColor,
                strokeWidth: 2,
                fill: 'hsl(var(--background))',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
