export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  market_cap_rank: number;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_date: { usd: string };
  };
  categories: string[];
  links: {
    homepage: string[];
    blockchain_site: string[];
    subreddit_url: string;
    twitter_screen_name: string;
  };
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface GlobalMarketData {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
  };
}

export interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
    data: {
      price: number;
      price_change_percentage_24h: { usd: number };
      market_cap: string;
      total_volume: string;
      sparkline: string;
    };
  };
}

export interface PortfolioHolding {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  quantity: number;
  averageBuyPrice: number;
  totalInvested: number;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export interface Transaction {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: number;
  pricePerCoin: number;
  totalValue: number;
  fee: number;
  timestamp: number;
}

export interface Portfolio {
  id: string;
  cashBalance: number;
  holdings: PortfolioHolding[];
  transactions: Transaction[];
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  createdAt: number;
  updatedAt: number;
}

export interface PriceAlert {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: number;
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'trading' | 'streak' | 'portfolio' | 'exploration';
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface UserProfile {
  id: string;
  xp: number;
  level: number;
  streak: number;
  lastVisit: number;
  theme: 'dark' | 'light' | 'bull-run' | 'crypto-winter';
  achievements: Achievement[];
  watchlist: string[];
  createdAt: number;
}

export interface MarketInsight {
  id: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  highlights: string[];
  generatedAt: number;
}

export type TimeRange = '1d' | '7d' | '30d' | '90d' | '1y' | 'all';

export type ChartType = 'line' | 'area' | 'candlestick';

export type CoinCategory = 'all' | 'defi' | 'nft' | 'meme' | 'layer2' | 'gaming';
