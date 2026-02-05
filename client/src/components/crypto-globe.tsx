import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  amount: string;
  coin: string;
  color: string;
  progress: number;
}

interface CryptoGlobeProps {
  className?: string;
  compact?: boolean;
}

const CRYPTO_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  XRP: '#23292F',
  DOGE: '#C3A634',
  ADA: '#0033AD',
  DOT: '#E6007A',
  LINK: '#2A5ADA',
};

const MAJOR_CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
  { name: 'Seoul', lat: 37.5665, lng: 126.978 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
];

function generateTransaction(): Transaction {
  const coins = Object.keys(CRYPTO_COLORS);
  const coin = coins[Math.floor(Math.random() * coins.length)];
  const fromCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
  let toCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
  while (toCity.name === fromCity.name) {
    toCity = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
  }
  
  const amounts = ['0.5', '1.2', '2.8', '5.0', '10.5', '25', '100', '500'];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    from: { lat: fromCity.lat, lng: fromCity.lng },
    to: { lat: toCity.lat, lng: toCity.lng },
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    coin,
    color: CRYPTO_COLORS[coin],
    progress: 0,
  };
}

function latLngToXY(lat: number, lng: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

function TransactionParticle({ tx, width, height }: { tx: Transaction; width: number; height: number }) {
  const from = latLngToXY(tx.from.lat, tx.from.lng, width, height);
  const to = latLngToXY(tx.to.lat, tx.to.lng, width, height);
  
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 30 - Math.random() * 20;
  
  return (
    <motion.g>
      <motion.path
        d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
        fill="none"
        stroke={tx.color}
        strokeWidth="1"
        strokeOpacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.circle
        r="4"
        fill={tx.color}
        filter="url(#glow)"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          offsetDistance: ['0%', '100%'],
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          offsetPath: `path("M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}")`,
        }}
      >
        <animate
          attributeName="r"
          values="3;5;3"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </motion.circle>
      <motion.circle
        cx={from.x}
        cy={from.y}
        r="3"
        fill={tx.color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.5] }}
        transition={{ duration: 0.5 }}
      />
      <motion.circle
        cx={to.x}
        cy={to.y}
        r="3"
        fill={tx.color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 0, 1] }}
        transition={{ duration: 2, delay: 1.5 }}
      />
    </motion.g>
  );
}

export function CryptoGlobe({ className, compact = false }: CryptoGlobeProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const width = compact ? 300 : 500;
  const height = compact ? 150 : 250;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTxs = [...prev];
        if (newTxs.length < 8) {
          newTxs.push(generateTransaction());
        }
        return newTxs;
      });
    }, 800);
    
    const cleanupInterval = setInterval(() => {
      setTransactions(prev => prev.slice(-6));
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, []);
  
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(rotationInterval);
  }, []);

  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 2,
    })), []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900",
        className
      )}
    >
      <div className="absolute inset-0">
        {stars.map(star => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>
      
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                       radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)`,
        }}
        animate={{
          background: [
            `radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)`,
            `radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 60% 50%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)`,
            `radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
             radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)`,
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ minHeight: compact ? 150 : 200 }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
            <stop offset="50%" stopColor="rgba(6, 182, 212, 0.1)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
          </linearGradient>
        </defs>
        
        {Array.from({ length: 12 }, (_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={(i / 12) * width}
            y1="0"
            x2={(i / 12) * width}
            y2={height}
            stroke="url(#gridGradient)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={(i / 6) * height}
            x2={width}
            y2={(i / 6) * height}
            stroke="url(#gridGradient)"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}

        {MAJOR_CITIES.map((city, i) => {
          const pos = latLngToXY(city.lat, city.lng, width, height);
          return (
            <motion.g key={city.name}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="2"
                fill="rgba(6, 182, 212, 0.8)"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="6"
                fill="none"
                stroke="rgba(6, 182, 212, 0.3)"
                strokeWidth="1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 2, 3],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            </motion.g>
          );
        })}

        <AnimatePresence>
          {transactions.map(tx => (
            <TransactionParticle key={tx.id} tx={tx} width={width} height={height} />
          ))}
        </AnimatePresence>
      </svg>

      <div className="absolute bottom-2 left-2 right-2">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {Object.entries(CRYPTO_COLORS).slice(0, 5).map(([coin, color]) => (
            <motion.div
              key={coin}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-white/80 font-medium">{coin}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute top-2 right-2 text-[10px] text-white/60 font-mono bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        LIVE
      </motion.div>
    </div>
  );
}
