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
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Card 
          className="p-5 cursor-pointer border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md hover-elevate group relative overflow-visible shadow-lg hover:shadow-xl transition-shadow duration-300"
          data-testid={`price-card-${coin.id}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-md scale-110" />
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="relative w-14 h-14 rounded-full ring-2 ring-border/50"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-sm">
                    <span className="text-[9px] font-bold text-muted-foreground">
                      #{coin.market_cap_rank}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold truncate">{coin.name}</h3>
                  <p className="text-sm text-muted-foreground uppercase font-medium tracking-wider">
                    {coin.symbol}
                  </p>
                </div>
              </div>

              {showWatchlistButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  onClick={toggleWatchlist}
                  data-testid={`watchlist-toggle-${coin.id}`}
                >
                  {isWatchlisted ? (
                    <Star className="w-5 h-5 fill-warning text-warning" />
                  ) : (
                    <StarOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold font-mono tracking-tight">
                  {formatCurrency(coin.current_price)}
                </p>
                <div
                  className={cn(
                    'flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full w-fit',
                    isPositive 
                      ? 'text-success bg-success/10' 
                      : 'text-destructive bg-destructive/10'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {formatPercentage(coin.price_change_percentage_24h)}
                  </span>
                </div>
              </div>

              {coin.sparkline_in_7d?.price && (
                <Sparkline
                  data={coin.sparkline_in_7d.price}
                  isPositive={isPositive}
                  width={100}
                  height={45}
                />
              )}
            </div>
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
    <Card className="p-5 border border-border/50 bg-card/50">
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="w-24 h-11" />
      </div>
    </Card>
  );
}
