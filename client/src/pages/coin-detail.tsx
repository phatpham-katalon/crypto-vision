import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import {
  ArrowLeft,
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Bell,
  ArrowUpDown,
  Globe,
  BarChart3,
  Coins,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PriceChart } from '@/components/price-chart';
import { TradeModal } from '@/components/trade-modal';
import { useAppStore } from '@/lib/store';
import {
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
  formatCompactNumber,
  cn,
  getTimeRangeDays,
} from '@/lib/utils';
import type { Coin, CoinDetail, PriceHistory, TimeRange } from '@shared/types';

export default function CoinDetailPage() {
  const [, params] = useRoute('/coin/:id');
  const coinId = params?.id;
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState('1');

  const { profile, addToWatchlist, removeFromWatchlist, trackCoinView } = useAppStore();
  const isWatchlisted = coinId ? profile.watchlist.includes(coinId) : false;

  useEffect(() => {
    if (coinId) {
      trackCoinView(coinId);
    }
  }, [coinId, trackCoinView]);

  const { data: coin, isLoading: coinLoading, error: coinError, isFetching: coinFetching } = useQuery<Coin>({
    queryKey: ['/api/crypto/coin', coinId],
    enabled: !!coinId,
    retry: 1,
    retryDelay: 1500,
  });

  const { data: coinDetail } = useQuery<CoinDetail>({
    queryKey: ['/api/crypto/coin-detail', coinId],
    enabled: !!coinId,
    retry: 1,
  });

  const { data: priceHistory, isLoading: historyLoading, error: historyError } = useQuery<PriceHistory>({
    queryKey: ['/api/crypto/history', coinId, selectedRange],
    enabled: !!coinId,
    retry: 2,
    retryDelay: 1000,
  });

  const isQueryDone = !coinLoading && !coinFetching;
  const hasError = coinError || (isQueryDone && !coin);
  
  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/markets">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Markets
            </Button>
          </Link>
        </div>
        <Card className="border border-border/50 bg-card/50 p-8">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold" data-testid="text-error-heading">Unable to load coin data</h2>
            <p className="text-muted-foreground">
              The CoinGecko API is temporarily unavailable. This often happens due to rate limiting on the free tier.
            </p>
            <Button onClick={() => window.location.reload()} data-testid="button-try-again">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (coinLoading || !coin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  const isPositive = coin.price_change_percentage_24h >= 0;
  const convertedAmount = (parseFloat(convertAmount) || 0) * coin.current_price;

  const stats = [
    { label: 'Market Cap', value: formatCompactCurrency(coin.market_cap), icon: Globe },
    { label: '24h Volume', value: formatCompactCurrency(coin.total_volume), icon: BarChart3 },
    { label: 'Circulating Supply', value: `${formatCompactNumber(coin.circulating_supply)} ${coin.symbol.toUpperCase()}`, icon: Coins },
    { label: '24h High', value: formatCurrency(coin.high_24h), icon: TrendingUp },
    { label: '24h Low', value: formatCurrency(coin.low_24h), icon: TrendingDown },
    { label: 'All-Time High', value: formatCurrency(coin.ath), icon: Target },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/markets">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </Button>
        </Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <img
            src={coin.image}
            alt={coin.name}
            className="w-14 h-14 rounded-full"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-display">{coin.name}</h1>
              <Badge variant="secondary" className="uppercase">
                {coin.symbol}
              </Badge>
              <Badge variant="outline">Rank #{coin.market_cap_rank}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-bold font-mono">
                {formatCurrency(coin.current_price)}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'gap-1',
                  isPositive
                    ? 'text-success bg-success/10 border-success/20'
                    : 'text-destructive bg-destructive/10 border-destructive/20'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {formatPercentage(coin.price_change_percentage_24h)}
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              isWatchlisted ? removeFromWatchlist(coin.id) : addToWatchlist(coin.id)
            }
            className="gap-2"
            data-testid="button-toggle-watchlist"
          >
            {isWatchlisted ? (
              <>
                <Star className="w-4 h-4 fill-warning text-warning" />
                Watching
              </>
            ) : (
              <>
                <StarOff className="w-4 h-4" />
                Add to Watchlist
              </>
            )}
          </Button>
          <Link href="/alerts">
            <Button variant="outline" className="gap-2" data-testid="button-set-alert">
              <Bell className="w-4 h-4" />
              Set Alert
            </Button>
          </Link>
          <Button
            onClick={() => setTradeModalOpen(true)}
            className="gap-2"
            data-testid="button-trade"
          >
            <ArrowUpDown className="w-4 h-4" />
            Trade
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceChart
            data={priceHistory}
            isLoading={historyLoading}
            isPositive={isPositive}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />

          {coinDetail?.description?.en && (
            <Card className="border border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle>About {coin.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: coinDetail.description.en.split('.').slice(0, 3).join('.') + '.',
                  }}
                />
                {coinDetail.links?.homepage?.[0] && (
                  <a
                    href={coinDetail.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline"
                  >
                    Visit website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">Price Converter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-xs text-muted-foreground">
                  {coin.symbol.toUpperCase()}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="font-mono text-lg"
                  data-testid="input-convert-amount"
                />
              </div>
              <div className="flex items-center justify-center">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">USD</Label>
                <div className="h-10 px-3 rounded-md border border-input bg-muted/50 flex items-center font-mono text-lg">
                  {formatCurrency(convertedAmount)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4" />
                      {stat.label}
                    </div>
                    <span className="font-mono text-sm font-medium">{stat.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {coinDetail?.categories && coinDetail.categories.length > 0 && (
            <Card className="border border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {coinDetail.categories.slice(0, 6).map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TradeModal
        coin={coin}
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
      />
    </div>
  );
}
