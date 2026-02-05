import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import type { Coin } from '@shared/types';
import { Link } from 'wouter';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';

interface PriceCardProps {
  coin: Coin;
  showWatchlistButton?: boolean;
}

export function PriceCard({ coin, showWatchlistButton = true }: PriceCardProps) {
  const { profile, addToWatchlist, removeFromWatchlist } = useAppStore();
  const isWatchlisted = profile.watchlist.includes(coin.id);
  const isPositive = coin.price_change_percentage_24h >= 0;

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWatchlisted) {
      removeFromWatchlist(coin.id);
    } else {
      addToWatchlist(coin.id);
    }
  };

  return (
    <Link href={`/coin/${coin.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <Card 
          className="p-4 cursor-pointer border border-border/50 bg-card/50 backdrop-blur-sm hover-elevate group relative overflow-visible"
          data-testid={`price-card-${coin.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-10 h-10 rounded-full"
                  loading="lazy"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center">
                  <span className="text-[8px] font-bold text-muted-foreground">
                    #{coin.market_cap_rank}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{coin.name}</h3>
                <p className="text-sm text-muted-foreground uppercase">
                  {coin.symbol}
                </p>
              </div>
            </div>

            {showWatchlistButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={toggleWatchlist}
                data-testid={`watchlist-toggle-${coin.id}`}
              >
                {isWatchlisted ? (
                  <Star className="w-4 h-4 fill-warning text-warning" />
                ) : (
                  <StarOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold font-mono tracking-tight">
                {formatCurrency(coin.current_price)}
              </p>
              <div
                className={cn(
                  'flex items-center gap-1 mt-1',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {formatPercentage(coin.price_change_percentage_24h)}
                </span>
              </div>
            </div>

            {coin.sparkline_in_7d?.price && (
              <Sparkline
                data={coin.sparkline_in_7d.price}
                isPositive={isPositive}
              />
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

interface SparklineProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

function Sparkline({ data, isPositive, width = 80, height = 32 }: SparklineProps) {
  const samples = data.slice(-24);
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = max - min || 1;

  const points = samples.map((value, index) => {
    const x = (index / (samples.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  const areaPath = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={isPositive ? 'rgb(34 197 94)' : 'rgb(239 68 68)'}
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor={isPositive ? 'rgb(34 197 94)' : 'rgb(239 68 68)'}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
      />
      <path
        d={pathData}
        fill="none"
        stroke={isPositive ? 'rgb(34 197 94)' : 'rgb(239 68 68)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PriceCardSkeleton() {
  return (
    <Card className="p-4 border border-border/50 bg-card/50">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="w-20 h-8" />
      </div>
    </Card>
  );
}
