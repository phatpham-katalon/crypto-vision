import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpDown,
  Clock,
  BarChart3,
  PiggyBank,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatPercentage, timeAgo, cn } from '@/lib/utils';
import type { Coin } from '@shared/types';

export default function Portfolio() {
  const { portfolio, updateHoldingPrices } = useAppStore();

  const { data: coins } = useQuery<Coin[]>({
    queryKey: ['/api/crypto/coins', { limit: 100 }],
  });

  useEffect(() => {
    if (coins) {
      const prices: Record<string, number> = {};
      coins.forEach((coin) => {
        prices[coin.id] = coin.current_price;
      });
      updateHoldingPrices(prices);
    }
  }, [coins, updateHoldingPrices]);

  const holdingsValue = portfolio.holdings.reduce(
    (sum, h) => sum + (h.currentValue || 0),
    0
  );

  const stats = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(portfolio.totalValue),
      icon: Wallet,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Cash Balance',
      value: formatCurrency(portfolio.cashBalance),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Holdings Value',
      value: formatCurrency(holdingsValue),
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total P&L',
      value: formatPercentage(portfolio.totalProfitLossPercentage),
      icon: portfolio.totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      gradient: portfolio.totalProfitLoss >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500',
      valueColor: portfolio.totalProfitLoss >= 0 ? 'text-success' : 'text-destructive',
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Portfolio</h1>
            <p className="text-muted-foreground">
              Manage your virtual trading portfolio
            </p>
          </div>
        </motion.div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                        stat.gradient
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={cn('text-xl font-bold font-mono', stat.valueColor)}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border border-border/50 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Holdings</CardTitle>
              <CardDescription>Your cryptocurrency positions</CardDescription>
            </div>
            <Link href="/markets">
              <Button size="sm" className="gap-1" data-testid="button-buy-more">
                <ArrowUpDown className="w-4 h-4" />
                Trade
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {portfolio.holdings.length === 0 ? (
              <div className="text-center py-12">
                <PiggyBank className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No holdings yet</p>
                <Link href="/markets">
                  <Button data-testid="button-start-trading">Start Trading</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {portfolio.holdings.map((holding) => {
                  const isPositive = (holding.profitLossPercentage || 0) >= 0;
                  const coinData = coins?.find((c) => c.id === holding.coinId);

                  return (
                    <Link key={holding.id} href={`/coin/${holding.coinId}`}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 cursor-pointer hover-elevate"
                        data-testid={`holding-${holding.coinId}`}
                      >
                        <img
                          src={coinData?.image || ''}
                          alt={holding.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{holding.name}</p>
                            <Badge variant="secondary" className="uppercase text-xs">
                              {holding.symbol}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {holding.quantity.toFixed(6)} {holding.symbol.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono">
                            {formatCurrency(holding.currentValue || 0)}
                          </p>
                          <p
                            className={cn(
                              'text-sm font-mono',
                              isPositive ? 'text-success' : 'text-destructive'
                            )}
                          >
                            {formatPercentage(holding.profitLossPercentage || 0)}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Transaction History</CardTitle>
            </div>
            <CardDescription>Your recent trades</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {portfolio.transactions.map((tx) => {
                    const isBuy = tx.type === 'buy';
                    const coinData = coins?.find((c) => c.id === tx.coinId);

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            isBuy ? 'bg-success/10' : 'bg-destructive/10'
                          )}
                        >
                          {isBuy ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                isBuy
                                  ? 'text-success bg-success/10 border-success/20'
                                  : 'text-destructive bg-destructive/10 border-destructive/20'
                              )}
                            >
                              {isBuy ? 'Buy' : 'Sell'}
                            </Badge>
                            <span className="font-medium">{tx.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {tx.quantity.toFixed(6)} {tx.symbol.toUpperCase()} @ {formatCurrency(tx.pricePerCoin)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono">
                            {isBuy ? '-' : '+'}{formatCurrency(tx.totalValue)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {timeAgo(tx.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
