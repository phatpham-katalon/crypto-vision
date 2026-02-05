import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart3, Coins, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCompactCurrency, formatPercentage, cn } from '@/lib/utils';
import type { GlobalMarketData } from '@shared/types';

interface MarketStatsProps {
  data?: GlobalMarketData;
  isLoading?: boolean;
}

export function MarketStats({ data, isLoading }: MarketStatsProps) {
  if (isLoading || !data || !data.total_market_cap) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 border border-border/50 bg-card/50">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const marketData = data;
  const isPositive = (marketData.market_cap_change_percentage_24h_usd || 0) >= 0;

  const stats = [
    {
      icon: Globe,
      label: 'Total Market Cap',
      value: formatCompactCurrency(marketData.total_market_cap?.usd || 0),
      change: marketData.market_cap_change_percentage_24h_usd,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Activity,
      label: '24h Volume',
      value: formatCompactCurrency(marketData.total_volume?.usd || 0),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      label: 'BTC Dominance',
      value: `${(marketData.market_cap_percentage?.btc || 0).toFixed(1)}%`,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: Coins,
      label: 'Active Cryptos',
      value: (marketData.active_cryptocurrencies || 0).toLocaleString(),
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="p-4 border border-border/50 bg-card/50 backdrop-blur-sm"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                  stat.gradient
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold font-mono">{stat.value}</p>
                    {stat.change !== undefined && (
                      <span
                        className={cn(
                          'flex items-center gap-0.5 text-xs font-medium',
                          stat.change >= 0 ? 'text-success' : 'text-destructive'
                        )}
                      >
                        {stat.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatPercentage(stat.change)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
