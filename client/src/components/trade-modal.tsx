import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { formatCurrency, cn } from '@/lib/utils';
import type { Coin } from '@shared/types';

interface TradeModalProps {
  coin: Coin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRADE_FEE_PERCENT = 0.001;

export function TradeModal({ coin, open, onOpenChange }: TradeModalProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { portfolio, executeTrade } = useAppStore();
  const holding = portfolio.holdings.find((h) => h.coinId === coin.id);

  const parsedAmount = parseFloat(amount) || 0;
  const quantity = parsedAmount / coin.current_price;
  const fee = parsedAmount * TRADE_FEE_PERCENT;
  const total = tradeType === 'buy' ? parsedAmount + fee : parsedAmount - fee;

  const maxBuyAmount = portfolio.cashBalance - (portfolio.cashBalance * TRADE_FEE_PERCENT);
  const maxSellAmount = (holding?.quantity || 0) * coin.current_price;

  const isValid = useMemo(() => {
    if (parsedAmount <= 0) return false;
    if (tradeType === 'buy') {
      return total <= portfolio.cashBalance;
    } else {
      return quantity <= (holding?.quantity || 0);
    }
  }, [parsedAmount, tradeType, total, quantity, portfolio.cashBalance, holding?.quantity]);

  const handleSubmit = () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      const success = executeTrade({
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        type: tradeType,
        quantity,
        pricePerCoin: coin.current_price,
        totalValue: parsedAmount,
        fee,
      });

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          setAmount('');
          setSuccess(false);
        }, 1500);
      } else {
        setError('Trade failed. Please check your balance and try again.');
      }

      setIsSubmitting(false);
    }, 500);
  };

  const handleQuickAmount = (percent: number) => {
    const maxAmount = tradeType === 'buy' ? maxBuyAmount : maxSellAmount;
    const newAmount = maxAmount * percent;
    setAmount(newAmount.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
            <div>
              <DialogTitle>Trade {coin.name}</DialogTitle>
              <DialogDescription className="font-mono">
                {formatCurrency(coin.current_price)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className={cn(
                  'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                  tradeType === 'buy' ? 'bg-success/10' : 'bg-destructive/10'
                )}
              >
                {tradeType === 'buy' ? (
                  <TrendingUp className="w-8 h-8 text-success" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-destructive" />
                )}
              </motion.div>
              <p className="text-lg font-semibold">
                {tradeType === 'buy' ? 'Purchase' : 'Sale'} Complete!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {tradeType === 'buy' ? 'Bought' : 'Sold'} {quantity.toFixed(6)} {coin.symbol.toUpperCase()}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-4"
            >
              <Tabs
                value={tradeType}
                onValueChange={(v) => {
                  setTradeType(v as 'buy' | 'sell');
                  setAmount('');
                  setError('');
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="buy" className="flex-1" data-testid="tab-buy">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="flex-1" data-testid="tab-sell">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Sell
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium font-mono">
                    {tradeType === 'buy'
                      ? formatCurrency(portfolio.cashBalance)
                      : `${(holding?.quantity || 0).toFixed(6)} ${coin.symbol.toUpperCase()}`}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg font-mono"
                    data-testid="input-trade-amount"
                  />
                  <div className="flex gap-2">
                    {[0.25, 0.5, 0.75, 1].map((percent) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleQuickAmount(percent)}
                        data-testid={`btn-${percent * 100}percent`}
                      >
                        {percent * 100}%
                      </Button>
                    ))}
                  </div>
                </div>

                {parsedAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-muted/50 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You'll {tradeType}</span>
                      <span className="font-mono">
                        {quantity.toFixed(6)} {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee (0.1%)</span>
                      <span className="font-mono">{formatCurrency(fee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="font-mono">{formatCurrency(total)}</span>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  data-testid="button-confirm-trade"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {tradeType === 'buy' ? (
                        <TrendingUp className="w-4 h-4 mr-2" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-2" />
                      )}
                      {tradeType === 'buy' ? 'Buy' : 'Sell'} {coin.symbol.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
