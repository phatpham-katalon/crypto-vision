import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY!,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL!,
});

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = {
  coins: 60 * 1000,
  global: 2 * 60 * 1000,
  trending: 5 * 60 * 1000,
  history: 60 * 1000,
  detail: 5 * 60 * 1000,
};

function getCached(key: string, ttl: number): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchCoinGecko(endpoint: string, cacheKey: string, ttl: number, retries = 3): Promise<any> {
  const cached = getCached(cacheKey, ttl);
  if (cached) {
    return cached;
  }

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${COINGECKO_BASE_URL}${endpoint}`);
      if (response.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/crypto/coins", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const cacheKey = `coins-${limit}`;
      const data = await fetchCoinGecko(
        `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h,7d`,
        cacheKey,
        CACHE_TTL.coins
      );
      res.json(data || []);
    } catch (error: any) {
      console.error("Error fetching coins:", error.message);
      res.json([]);
    }
  });

  app.get("/api/crypto/coin/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = `coin-${id}`;
      const data = await fetchCoinGecko(
        `/coins/markets?vs_currency=usd&ids=${id}&sparkline=true&price_change_percentage=24h,7d`,
        cacheKey,
        CACHE_TTL.coins
      );
      if (data && data.length > 0) {
        res.json(data[0]);
      } else {
        res.status(404).json({ error: "Coin not found" });
      }
    } catch (error: any) {
      console.error("Error fetching coin:", error.message);
      res.status(500).json({ error: "Failed to fetch coin" });
    }
  });

  app.get("/api/crypto/coin-detail/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cacheKey = `detail-${id}`;
      const data = await fetchCoinGecko(
        `/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
        cacheKey,
        CACHE_TTL.detail
      );
      res.json(data || {});
    } catch (error: any) {
      console.error("Error fetching coin detail:", error.message);
      res.json({});
    }
  });

  app.get("/api/crypto/history/:id/:range", async (req, res) => {
    try {
      const { id, range } = req.params;
      const daysMap: Record<string, string> = {
        "1d": "1",
        "7d": "7",
        "30d": "30",
        "90d": "90",
        "1y": "365",
        all: "max",
      };
      const days = daysMap[range] || "7";
      const cacheKey = `history-${id}-${range}`;
      const data = await fetchCoinGecko(
        `/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
        cacheKey,
        CACHE_TTL.history
      );
      
      if (!data || !data.prices) {
        return res.json({ prices: [], market_caps: [], total_volumes: [] });
      }
      
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching price history:", error.message);
      res.json({ prices: [], market_caps: [], total_volumes: [] });
    }
  });

  app.get("/api/crypto/global", async (req, res) => {
    try {
      const data = await fetchCoinGecko("/global", "global", CACHE_TTL.global);
      if (data && data.data) {
        res.json(data.data);
      } else {
        res.json({
          total_market_cap: { usd: 0 },
          total_volume: { usd: 0 },
          market_cap_percentage: { btc: 0 },
          active_cryptocurrencies: 0,
          market_cap_change_percentage_24h_usd: 0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching global data:", error.message);
      res.json({
        total_market_cap: { usd: 0 },
        total_volume: { usd: 0 },
        market_cap_percentage: { btc: 0 },
        active_cryptocurrencies: 0,
        market_cap_change_percentage_24h_usd: 0,
      });
    }
  });

  app.get("/api/crypto/trending", async (req, res) => {
    try {
      const data = await fetchCoinGecko("/search/trending", "trending", CACHE_TTL.trending);
      res.json(data || { coins: [] });
    } catch (error: any) {
      console.error("Error fetching trending:", error.message);
      res.json({ coins: [] });
    }
  });

  app.get("/api/ai/market-insight", async (req, res) => {
    try {
      const [globalData, topCoins] = await Promise.all([
        fetchCoinGecko("/global", "global", CACHE_TTL.global),
        fetchCoinGecko(
          "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h",
          "ai-coins-10",
          CACHE_TTL.coins
        ),
      ]);

      const marketContext = {
        totalMarketCap: globalData.data.total_market_cap?.usd || 0,
        totalVolume: globalData.data.total_volume?.usd || 0,
        btcDominance: globalData.data.market_cap_percentage?.btc || 0,
        marketCapChange24h: globalData.data.market_cap_change_percentage_24h_usd || 0,
        topCoins: topCoins.slice(0, 5).map((c: any) => ({
          name: c.name,
          symbol: c.symbol,
          price: c.current_price,
          change24h: c.price_change_percentage_24h,
        })),
      };

      const prompt = `You are a cryptocurrency market analyst. Based on the following market data, provide a brief market insight.

Market Data:
- Total Market Cap: $${(marketContext.totalMarketCap / 1e12).toFixed(2)}T
- 24h Volume: $${(marketContext.totalVolume / 1e9).toFixed(2)}B
- BTC Dominance: ${marketContext.btcDominance.toFixed(1)}%
- Market Cap Change (24h): ${marketContext.marketCapChange24h.toFixed(2)}%

Top Coins Performance (24h):
${marketContext.topCoins.map((c: any) => `- ${c.name} (${c.symbol.toUpperCase()}): $${c.price.toLocaleString()} (${c.change24h >= 0 ? '+' : ''}${c.change24h.toFixed(2)}%)`).join('\n')}

Respond with a JSON object containing:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "summary": "A 2-3 sentence market summary",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"]
}

Be concise and analytical. Focus on actionable insights.`;

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const insight = JSON.parse(jsonMatch[0]);
          res.json({
            ...insight,
            generatedAt: new Date().toISOString(),
          });
        } else {
          throw new Error("Could not parse AI response");
        }
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error generating market insight:", error.message);
      res.json({
        sentiment: "neutral",
        summary: "Unable to generate market insight at this time. Please try again later.",
        highlights: [],
        generatedAt: new Date().toISOString(),
      });
    }
  });

  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { question } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
      }

      const topCoins = await fetchCoinGecko(
        "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h",
        "ai-coins-20",
        CACHE_TTL.coins
      );

      const marketContext = topCoins.slice(0, 10).map((c: any) => 
        `${c.name} (${c.symbol.toUpperCase()}): $${c.current_price.toLocaleString()}, 24h: ${c.price_change_percentage_24h >= 0 ? '+' : ''}${c.price_change_percentage_24h.toFixed(2)}%`
      ).join('\n');

      const prompt = `You are a helpful cryptocurrency market assistant. Answer the user's question based on current market context.

Current Market (Top 10 by Market Cap):
${marketContext}

User Question: ${question}

Provide a helpful, concise answer (2-4 sentences). Be informative but not financial advice. Focus on factual market analysis.`;

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.content[0];
      if (content.type === "text") {
        res.json({ answer: content.text });
      } else {
        throw new Error("Unexpected response type");
      }
    } catch (error: any) {
      console.error("Error answering question:", error.message);
      res.status(500).json({ error: "Failed to generate answer" });
    }
  });

  return httpServer;
}
