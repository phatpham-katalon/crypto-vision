import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Portfolio, PriceAlert, UserProfile, Achievement, PortfolioHolding, Transaction } from '@shared/types';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-trade', name: 'First Steps', description: 'Complete your first trade', icon: 'Rocket', category: 'trading', xpReward: 100, isUnlocked: false },
  { id: 'diamond-hands', name: 'Diamond Hands', description: 'Hold a position for 7 days', icon: 'Gem', category: 'trading', xpReward: 250, isUnlocked: false },
  { id: 'diversified', name: 'Diversified', description: 'Own 5 different coins', icon: 'PieChart', category: 'portfolio', xpReward: 200, isUnlocked: false },
  { id: 'early-bird', name: 'Early Bird', description: 'Check your portfolio before 8 AM', icon: 'Sun', category: 'streak', xpReward: 50, isUnlocked: false },
  { id: 'night-owl', name: 'Night Owl', description: 'Trade after midnight', icon: 'Moon', category: 'streak', xpReward: 50, isUnlocked: false },
  { id: 'week-streak', name: 'Weekly Warrior', description: '7-day check-in streak', icon: 'Flame', category: 'streak', xpReward: 300, isUnlocked: false, progress: 0, maxProgress: 7 },
  { id: 'explorer', name: 'Explorer', description: 'View 10 different coins', icon: 'Compass', category: 'exploration', xpReward: 150, isUnlocked: false, progress: 0, maxProgress: 10 },
  { id: 'whale', name: 'Whale Watcher', description: 'Portfolio value reaches $50,000', icon: 'Fish', category: 'portfolio', xpReward: 500, isUnlocked: false },
  { id: 'profit-master', name: 'Profit Master', description: 'Achieve 100% profit on any trade', icon: 'TrendingUp', category: 'trading', xpReward: 400, isUnlocked: false },
  { id: 'alert-setter', name: 'Vigilant Trader', description: 'Set your first price alert', icon: 'Bell', category: 'exploration', xpReward: 75, isUnlocked: false },
];

interface AppState {
  portfolio: Portfolio;
  alerts: PriceAlert[];
  profile: UserProfile;
  viewedCoins: Set<string>;

  addToWatchlist: (coinId: string) => void;
  removeFromWatchlist: (coinId: string) => void;
  
  executeTrade: (trade: Omit<Transaction, 'id' | 'timestamp'>) => boolean;
  updateHoldingPrices: (prices: Record<string, number>) => void;
  
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  removeAlert: (alertId: string) => void;
  triggerAlert: (alertId: string) => void;
  
  addXp: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  
  setTheme: (theme: UserProfile['theme']) => void;
  trackCoinView: (coinId: string) => void;
}

const INITIAL_CASH = 10000;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      portfolio: {
        id: 'default',
        cashBalance: INITIAL_CASH,
        holdings: [],
        transactions: [],
        totalValue: INITIAL_CASH,
        totalProfitLoss: 0,
        totalProfitLossPercentage: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      alerts: [],
      profile: {
        id: 'default',
        xp: 0,
        level: 1,
        streak: 0,
        lastVisit: Date.now(),
        theme: 'dark',
        achievements: DEFAULT_ACHIEVEMENTS,
        watchlist: ['bitcoin', 'ethereum', 'solana'],
        createdAt: Date.now(),
      },
      viewedCoins: new Set(),

      addToWatchlist: (coinId) => set((state) => ({
        profile: {
          ...state.profile,
          watchlist: state.profile.watchlist.includes(coinId)
            ? state.profile.watchlist
            : [...state.profile.watchlist, coinId],
        },
      })),

      removeFromWatchlist: (coinId) => set((state) => ({
        profile: {
          ...state.profile,
          watchlist: state.profile.watchlist.filter((id) => id !== coinId),
        },
      })),

      executeTrade: (trade) => {
        const state = get();
        const totalCost = trade.totalValue + trade.fee;

        if (trade.type === 'buy') {
          if (state.portfolio.cashBalance < totalCost) return false;

          const existingHolding = state.portfolio.holdings.find(
            (h) => h.coinId === trade.coinId
          );

          let newHoldings: PortfolioHolding[];
          if (existingHolding) {
            const newQuantity = existingHolding.quantity + trade.quantity;
            const newTotalInvested = existingHolding.totalInvested + trade.totalValue;
            newHoldings = state.portfolio.holdings.map((h) =>
              h.coinId === trade.coinId
                ? {
                    ...h,
                    quantity: newQuantity,
                    totalInvested: newTotalInvested,
                    averageBuyPrice: newTotalInvested / newQuantity,
                  }
                : h
            );
          } else {
            newHoldings = [
              ...state.portfolio.holdings,
              {
                id: `holding-${Date.now()}`,
                coinId: trade.coinId,
                symbol: trade.symbol,
                name: trade.name,
                image: '',
                quantity: trade.quantity,
                averageBuyPrice: trade.pricePerCoin,
                totalInvested: trade.totalValue,
              },
            ];
          }

          const transaction: Transaction = {
            ...trade,
            id: `tx-${Date.now()}`,
            timestamp: Date.now(),
          };

          set((state) => ({
            portfolio: {
              ...state.portfolio,
              cashBalance: state.portfolio.cashBalance - totalCost,
              holdings: newHoldings,
              transactions: [transaction, ...state.portfolio.transactions],
              updatedAt: Date.now(),
            },
          }));

          if (state.portfolio.transactions.length === 0) {
            get().unlockAchievement('first-trade');
          }

          return true;
        } else {
          const holding = state.portfolio.holdings.find(
            (h) => h.coinId === trade.coinId
          );
          if (!holding || holding.quantity < trade.quantity) return false;

          const newQuantity = holding.quantity - trade.quantity;
          let newHoldings: PortfolioHolding[];
          if (newQuantity === 0) {
            newHoldings = state.portfolio.holdings.filter(
              (h) => h.coinId !== trade.coinId
            );
          } else {
            const soldRatio = trade.quantity / holding.quantity;
            newHoldings = state.portfolio.holdings.map((h) =>
              h.coinId === trade.coinId
                ? {
                    ...h,
                    quantity: newQuantity,
                    totalInvested: h.totalInvested * (1 - soldRatio),
                  }
                : h
            );
          }

          const transaction: Transaction = {
            ...trade,
            id: `tx-${Date.now()}`,
            timestamp: Date.now(),
          };

          set((state) => ({
            portfolio: {
              ...state.portfolio,
              cashBalance: state.portfolio.cashBalance + trade.totalValue - trade.fee,
              holdings: newHoldings,
              transactions: [transaction, ...state.portfolio.transactions],
              updatedAt: Date.now(),
            },
          }));

          return true;
        }
      },

      updateHoldingPrices: (prices) => set((state) => {
        const updatedHoldings = state.portfolio.holdings.map((h) => {
          const currentPrice = prices[h.coinId] || h.currentPrice || h.averageBuyPrice;
          const currentValue = h.quantity * currentPrice;
          const profitLoss = currentValue - h.totalInvested;
          const profitLossPercentage = (profitLoss / h.totalInvested) * 100;

          return {
            ...h,
            currentPrice,
            currentValue,
            profitLoss,
            profitLossPercentage,
          };
        });

        const holdingsValue = updatedHoldings.reduce(
          (sum, h) => sum + (h.currentValue || 0),
          0
        );
        const totalValue = state.portfolio.cashBalance + holdingsValue;
        const totalInvested = INITIAL_CASH;
        const totalProfitLoss = totalValue - totalInvested;
        const totalProfitLossPercentage = (totalProfitLoss / totalInvested) * 100;

        return {
          portfolio: {
            ...state.portfolio,
            holdings: updatedHoldings,
            totalValue,
            totalProfitLoss,
            totalProfitLossPercentage,
          },
        };
      }),

      addAlert: (alert) => set((state) => ({
        alerts: [
          ...state.alerts,
          {
            ...alert,
            id: `alert-${Date.now()}`,
            createdAt: Date.now(),
            isTriggered: false,
          },
        ],
      })),

      removeAlert: (alertId) => set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== alertId),
      })),

      triggerAlert: (alertId) => set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId
            ? { ...a, isTriggered: true, triggeredAt: Date.now(), isActive: false }
            : a
        ),
      })),

      addXp: (amount) => set((state) => {
        const newXp = state.profile.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;

        return {
          profile: {
            ...state.profile,
            xp: newXp,
            level: newLevel,
          },
        };
      }),

      unlockAchievement: (achievementId) => set((state) => {
        const achievement = state.profile.achievements.find(
          (a) => a.id === achievementId
        );
        if (!achievement || achievement.isUnlocked) return state;

        const updatedAchievements = state.profile.achievements.map((a) =>
          a.id === achievementId
            ? { ...a, isUnlocked: true, unlockedAt: Date.now() }
            : a
        );

        return {
          profile: {
            ...state.profile,
            achievements: updatedAchievements,
            xp: state.profile.xp + achievement.xpReward,
          },
        };
      }),

      updateStreak: () => set((state) => {
        const now = Date.now();
        const lastVisit = state.profile.lastVisit;
        const daysDiff = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

        let newStreak = state.profile.streak;
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }

        return {
          profile: {
            ...state.profile,
            streak: newStreak,
            lastVisit: now,
          },
        };
      }),

      setTheme: (theme) => set((state) => ({
        profile: { ...state.profile, theme },
      })),

      trackCoinView: (coinId) => {
        const state = get();
        const newViewedCoins = new Set(state.viewedCoins);
        newViewedCoins.add(coinId);

        set({ viewedCoins: newViewedCoins });

        if (newViewedCoins.size >= 10) {
          get().unlockAchievement('explorer');
        }
      },
    }),
    {
      name: 'cryptovision-storage',
      partialize: (state) => ({
        portfolio: state.portfolio,
        alerts: state.alerts,
        profile: state.profile,
      }),
    }
  )
);
