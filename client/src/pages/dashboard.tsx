import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Wallet, Target, Sparkles, ArrowRight, Flame, Globe } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PriceCard, PriceCardSkeleton } from '@/components/price-card';
import { MarketStats } from '@/components/market-stats';
import { AIInsights } from '@/components/ai-insights';
import { CryptoGlobe } from '@/components/crypto-globe';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import type { Coin, GlobalMarketData, TrendingCoin } from '@shared/types';

export default function Dashboard() {
  const { profile, portfolio, updateStreak } = useAppStore();

  const { data: globalData, isLoading: globalLoading } = useQuery<GlobalMarketData>({
    queryKey: ['/api/crypto/global'],
  });

  const { data: topCoins, isLoading: coinsLoading } = useQuery<Coin[]>({
    queryKey: ['/api/crypto/coins', { limit: 12 }],
  });

  const { data: trendingData, isLoading: trendingLoading } = useQuery<{ coins: TrendingCoin[] }>({
    queryKey: ['/api/crypto/trending'],
  });

  const watchlistCoins = topCoins?.filter((c) => profile.watchlist.includes(c.id)) || [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold font-display"
          >
            Dashboard
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Track your portfolio and market trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/portfolio">
            <Button variant="outline" className="gap-2" data-testid="button-view-portfolio">
              <Wallet className="w-4 h-4" />
              View Portfolio
            </Button>
          </Link>
          <Link href="/markets">
            <Button className="gap-2" data-testid="button-explore-markets">
              <TrendingUp className="w-4 h-4" />
              Explore Markets
            </Button>
          </Link>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Global Crypto Activity</CardTitle>
            </div>
            <CardDescription>Live transactions flowing around the world</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CryptoGlobe className="h-[200px]" />
          </CardContent>
        </Card>
      </motion.section>

      <MarketStats data={globalData} isLoading={globalLoading} />

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold">Top Cryptocurrencies</h2>
            <p className="text-muted-foreground text-sm mt-1">Real-time prices for the top coins by market cap</p>
          </div>
          <Link href="/markets">
            <Button variant="outline" className="gap-1" data-testid="link-view-markets">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        {coinsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <PriceCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {topCoins?.slice(0, 8).map((coin, index) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PriceCard coin={coin} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Your virtual trading account</CardDescription>
              </div>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm" className="gap-1" data-testid="link-portfolio">
                  View all <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold font-mono mt-1">
                    {formatCurrency(portfolio.totalValue)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Cash Balance</p>
                  <p className="text-2xl font-bold font-mono mt-1">
                    {formatCurrency(portfolio.cashBalance)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p
                    className={cn(
                      'text-2xl font-bold font-mono mt-1',
                      portfolio.totalProfitLoss >= 0 ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {formatPercentage(portfolio.totalProfitLossPercentage)}
                  </p>
                </div>
              </div>
              {portfolio.holdings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">Holdings</p>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.holdings.slice(0, 5).map((holding) => (
                      <Badge key={holding.id} variant="secondary" className="gap-1.5 py-1 px-2">
                        <span className="uppercase font-mono">{holding.symbol}</span>
                        <span className="text-muted-foreground">
                          {holding.quantity.toFixed(4)}
                        </span>
                      </Badge>
                    ))}
                    {portfolio.holdings.length > 5 && (
                      <Badge variant="outline">+{portfolio.holdings.length - 5} more</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Watchlist</h2>
              <Link href="/markets">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            {watchlistCoins.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlistCoins.slice(0, 6).map((coin) => (
                  <PriceCard key={coin.id} coin={coin} />
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-border/50 bg-card/30">
                <CardContent className="py-8 text-center">
                  <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Your watchlist is empty</p>
                  <Link href="/markets">
                    <Button variant="outline" size="sm" className="mt-3" data-testid="button-add-coins">
                      Add coins
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-warning" />
                <h2 className="text-xl font-semibold">Trending Now</h2>
              </div>
            </div>
            {trendingLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <PriceCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingData?.coins.slice(0, 6).map((trending, index) => {
                  const coin = topCoins?.find((c) => c.id === trending.item.id);
                  if (coin) {
                    return <PriceCard key={coin.id} coin={coin} />;
                  }
                  return (
                    <motion.div
                      key={trending.item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/coin/${trending.item.id}`}>
                        <Card className="p-4 cursor-pointer border border-border/50 bg-card/50 hover-elevate">
                          <div className="flex items-center gap-3">
                            <img
                              src={trending.item.thumb}
                              alt={trending.item.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-semibold">{trending.item.name}</p>
                              <p className="text-sm text-muted-foreground uppercase">
                                {trending.item.symbol}
                              </p>
                            </div>
                            <Badge variant="secondary" className="ml-auto">
                              #{trending.item.market_cap_rank}
                            </Badge>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <AIInsights />

          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Your Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Level {profile.level}</span>
                  <span className="font-mono">{profile.xp % 500} / 500 XP</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile.xp % 500) / 5}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">Recent Achievements</p>
                <div className="space-y-2">
                  {profile.achievements
                    .filter((a) => a.isUnlocked)
                    .slice(0, 3)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">+{achievement.xpReward} XP</p>
                        </div>
                      </div>
                    ))}
                  {profile.achievements.filter((a) => a.isUnlocked).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No achievements yet. Start trading!
                    </p>
                  )}
                </div>
              </div>

              <Link href="/profile">
                <Button variant="outline" className="w-full" data-testid="button-view-profile">
                  View All Achievements
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
