import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Check,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { formatCurrency, timeAgo, cn } from '@/lib/utils';
import type { Coin } from '@shared/types';

export default function Alerts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [searchQuery, setSearchQuery] = useState('');

  const { alerts, addAlert, removeAlert, unlockAchievement } = useAppStore();

  const { data: coins } = useQuery<Coin[]>({
    queryKey: ['/api/crypto/coins', { limit: 100 }],
  });

  const activeAlerts = alerts.filter((a) => a.isActive && !a.isTriggered);
  const triggeredAlerts = alerts.filter((a) => a.isTriggered);

  const filteredCoins = coins?.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCoin = coins?.find((c) => c.id === selectedCoinId);

  const handleCreateAlert = () => {
    if (!selectedCoin || !targetPrice) return;

    addAlert({
      coinId: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      image: selectedCoin.image,
      targetPrice: parseFloat(targetPrice),
      condition,
      isActive: true,
    });

    if (alerts.length === 0) {
      unlockAchievement('alert-setter');
    }

    setIsModalOpen(false);
    setSelectedCoinId('');
    setTargetPrice('');
    setCondition('above');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Price Alerts</h1>
            <p className="text-muted-foreground">
              Get notified when prices hit your targets
            </p>
          </div>
        </motion.div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-alert">
              <Plus className="w-4 h-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Search Coin</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-alert-coin"
                  />
                </div>
                <ScrollArea className="h-48 border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredCoins?.slice(0, 20).map((coin) => (
                      <button
                        key={coin.id}
                        onClick={() => {
                          setSelectedCoinId(coin.id);
                          setSearchQuery('');
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors',
                          selectedCoinId === coin.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted'
                        )}
                        data-testid={`select-coin-${coin.id}`}
                      >
                        <img
                          src={coin.image}
                          alt={coin.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{coin.name}</p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {coin.symbol}
                          </p>
                        </div>
                        <span className="text-sm font-mono text-muted-foreground">
                          {formatCurrency(coin.current_price)}
                        </span>
                        {selectedCoinId === coin.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedCoin && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCoin.image}
                      alt={selectedCoin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{selectedCoin.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        Current: {formatCurrency(selectedCoin.current_price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select
                    value={condition}
                    onValueChange={(v: 'above' | 'below') => setCondition(v)}
                  >
                    <SelectTrigger data-testid="select-condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-success" />
                          Price goes above
                        </div>
                      </SelectItem>
                      <SelectItem value="below">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-destructive" />
                          Price goes below
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Price (USD)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="font-mono"
                    data-testid="input-target-price"
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCreateAlert}
                disabled={!selectedCoinId || !targetPrice}
                data-testid="button-confirm-alert"
              >
                <Bell className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              <CardTitle>Active Alerts</CardTitle>
            </div>
            <CardDescription>
              {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No active alerts</p>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  data-testid="button-create-first-alert"
                >
                  Create your first alert
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {activeAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
                    >
                      <img
                        src={alert.image}
                        alt={alert.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{alert.name}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              alert.condition === 'above'
                                ? 'text-success bg-success/10 border-success/20'
                                : 'text-destructive bg-destructive/10 border-destructive/20'
                            )}
                          >
                            {alert.condition === 'above' ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {alert.condition}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          Target: {formatCurrency(alert.targetPrice)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeAlert(alert.id)}
                        data-testid={`delete-alert-${alert.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellOff className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Triggered Alerts</CardTitle>
            </div>
            <CardDescription>
              {triggeredAlerts.length} triggered alert{triggeredAlerts.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {triggeredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No triggered alerts yet
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {triggeredAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 opacity-70"
                    >
                      <img
                        src={alert.image}
                        alt={alert.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{alert.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            Triggered
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.condition === 'above' ? 'Went above' : 'Went below'}{' '}
                          {formatCurrency(alert.targetPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {alert.triggeredAt ? timeAgo(alert.triggeredAt) : ''}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
