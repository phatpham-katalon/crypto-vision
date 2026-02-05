# CryptoVision - Real-Time Crypto Trading Dashboard

## Overview

CryptoVision is a modern cryptocurrency visualization web application that provides real-time market data, virtual portfolio tracking (paper trading), and AI-powered market insights. The application features a React frontend with a polished UI using shadcn/ui components, an Express backend serving as an API proxy for cryptocurrency data, and AI integration via Anthropic's Claude for market analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: Zustand with persist middleware for local storage persistence
- **Data Fetching**: TanStack React Query for server state management with caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (supports dark, light, bull-run, crypto-winter themes)
- **Animations**: Framer Motion for micro-interactions and transitions
- **Charts**: Recharts for price visualization

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Design**: RESTful endpoints prefixed with `/api`
- **Caching**: In-memory cache with TTL for CoinGecko API responses to handle rate limits
- **Static Serving**: Vite dev server in development, static file serving in production

### Data Flow
1. Frontend components query `/api/crypto/*` endpoints via React Query
2. Backend proxies requests to CoinGecko API with caching and retry logic
3. AI insights are generated via Anthropic Claude API at `/api/ai/*` endpoints
4. Portfolio and user preferences are persisted client-side using Zustand's localStorage persistence

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**: 
  - `users` - Basic user authentication (id, username, password)
  - `conversations` - AI chat conversation threads
  - `messages` - Individual messages within conversations
- **Migrations**: Drizzle Kit for schema migrations stored in `/migrations`

### Key Design Decisions
- **Paper Trading**: All trading is simulated with virtual $10,000 starting balance, no real transactions
- **API Rate Limiting**: CoinGecko free tier (30 calls/min) handled via server-side caching with different TTLs per endpoint type
- **Client-Side Persistence**: Portfolio holdings, watchlists, price alerts, and achievements stored in browser localStorage
- **Theming**: Multiple theme support including special "bull-run" and "crypto-winter" modes

## External Dependencies

### APIs
- **CoinGecko API**: Primary cryptocurrency data source (prices, market data, trending coins, historical data)
  - Free tier: 30 calls/minute, no API key required for basic endpoints
  - Endpoints used: `/coins/markets`, `/global`, `/search/trending`, `/coins/{id}`, `/coins/{id}/market_chart`

### AI Services
- **Anthropic Claude**: Used for AI-powered market insights and Q&A
  - Configured via `AI_INTEGRATIONS_ANTHROPIC_API_KEY` and `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` environment variables
  - Batch processing utilities available for concurrent AI requests with rate limit handling

### Database
- **PostgreSQL**: Required for user data and chat persistence
  - Connection via `DATABASE_URL` environment variable
  - Session storage via `connect-pg-simple`

### Key npm Packages
- `@anthropic-ai/sdk` - Anthropic AI integration
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `zustand` - Client-side state management
- `@tanstack/react-query` - Server state management
- `framer-motion` - Animations
- `recharts` - Chart visualizations
- `wouter` - Client-side routing