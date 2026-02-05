import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { MarketStats } from '@/components/market-stats';
import { CoinTable } from '@/components/coin-table';
import type { Coin, GlobalMarketData } from '@shared/types';

export default function Markets() {
  const { data: globalData, isLoading: globalLoading } = useQuery<GlobalMarketData>({
    queryKey: ['/api/crypto/global'],
  });

  const { data: coins, isLoading: coinsLoading } = useQuery<Coin[]>({
    queryKey: ['/api/crypto/coins', { limit: 100 }],
  });

  return (
    <div className="space-y-8">
      <header>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Markets</h1>
            <p className="text-muted-foreground">
              Browse and track all cryptocurrencies
            </p>
          </div>
        </motion.div>
      </header>

      <MarketStats data={globalData} isLoading={globalLoading} />

      <CoinTable coins={coins || []} isLoading={coinsLoading} />
    </div>
  );
}
