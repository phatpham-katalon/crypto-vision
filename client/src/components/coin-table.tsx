import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  StarOff,
  Search,
  Filter,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatCompactCurrency, formatPercentage, cn } from '@/lib/utils';
import type { Coin, CoinCategory } from '@shared/types';

type SortField = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';
type SortOrder = 'asc' | 'desc';

interface CoinTableProps {
  coins: Coin[];
  isLoading?: boolean;
}

const categories: { value: CoinCategory; label: string }[] = [
  { value: 'all', label: 'All Coins' },
  { value: 'defi', label: 'DeFi' },
  { value: 'nft', label: 'NFT' },
  { value: 'meme', label: 'Meme' },
  { value: 'layer2', label: 'Layer 2' },
  { value: 'gaming', label: 'Gaming' },
];

export function CoinTable({ coins, isLoading }: CoinTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [category, setCategory] = useState<CoinCategory>('all');

  const { profile, addToWatchlist, removeFromWatchlist } = useAppStore();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'market_cap_rank' ? 'asc' : 'desc');
    }
  };

  const filteredCoins = coins
    .filter((coin) => {
      const matchesSearch =
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      return ((aVal ?? 0) - (bVal ?? 0)) * modifier;
    });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 font-medium hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortOrder === 'asc' ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      )}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h %</TableHead>
                <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Volume (24h)</TableHead>
                <TableHead className="w-24 hidden sm:table-cell">Last 7 Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-coins"
          />
        </div>
        <Select value={category} onValueChange={(v: CoinCategory) => setCategory(v)}>
          <SelectTrigger className="w-full sm:w-40" data-testid="select-category">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden bg-card/30">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <SortButton field="market_cap_rank">#</SortButton>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">
                <SortButton field="current_price">Price</SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton field="price_change_percentage_24h">24h %</SortButton>
              </TableHead>
              <TableHead className="text-right hidden md:table-cell">
                <SortButton field="market_cap">Market Cap</SortButton>
              </TableHead>
              <TableHead className="text-right hidden lg:table-cell">
                <SortButton field="total_volume">Volume (24h)</SortButton>
              </TableHead>
              <TableHead className="w-24 hidden sm:table-cell">Last 7 Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoins.map((coin, index) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              const isWatchlisted = profile.watchlist.includes(coin.id);

              return (
                <motion.tr
                  key={coin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {coin.market_cap_rank}
                  </TableCell>
                  <TableCell>
                    <Link href={`/coin/${coin.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer" data-testid={`row-coin-${coin.id}`}>
                        <div className="relative">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-8 h-8 rounded-full"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{coin.name}</p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {coin.symbol}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            isWatchlisted
                              ? removeFromWatchlist(coin.id)
                              : addToWatchlist(coin.id);
                          }}
                        >
                          {isWatchlisted ? (
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                          ) : (
                            <StarOff className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(coin.current_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono',
                        isPositive
                          ? 'text-success bg-success/10 border-success/20'
                          : 'text-destructive bg-destructive/10 border-destructive/20'
                      )}
                    >
                      {formatPercentage(coin.price_change_percentage_24h)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono hidden md:table-cell">
                    {formatCompactCurrency(coin.market_cap)}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden lg:table-cell">
                    {formatCompactCurrency(coin.total_volume)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {coin.sparkline_in_7d?.price && (
                      <MiniSparkline data={coin.sparkline_in_7d.price} isPositive={isPositive} />
                    )}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredCoins.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No coins found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const samples = data.slice(-24);
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = samples.map((value, index) => {
    const x = (index / (samples.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
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
