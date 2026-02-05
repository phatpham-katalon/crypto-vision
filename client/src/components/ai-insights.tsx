import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus, Send, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn, timeAgo } from '@/lib/utils';
import type { MarketInsight } from '@shared/types';

interface AIInsightsProps {
  compact?: boolean;
}

export function AIInsights({ compact = false }: AIInsightsProps) {
  const [question, setQuestion] = useState('');

  const { data: insight, isLoading, refetch, isFetching } = useQuery<MarketInsight>({
    queryKey: ['/api/ai/market-insight'],
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const askMutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await apiRequest('POST', '/api/ai/ask', { question: q });
      return await res.json() as { answer: string };
    },
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || askMutation.isPending) return;
    askMutation.mutate(question);
    setQuestion('');
  };

  const sentimentConfig = {
    bullish: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    bearish: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
    neutral: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' },
  };

  if (compact) {
    return (
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">AI Market Insight</CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-insight"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : insight ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const config = sentimentConfig[insight.sentiment];
                  const Icon = config.icon;
                  return (
                    <Badge variant="outline" className={cn('gap-1', config.bg, config.border)}>
                      <Icon className={cn('w-3 h-3', config.color)} />
                      <span className={config.color}>{insight.sentiment}</span>
                    </Badge>
                  );
                })()}
                <span className="text-xs text-muted-foreground">
                  {timeAgo(insight.generatedAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.summary}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Unable to generate insight at this time.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Market Analyst</CardTitle>
            <CardDescription>Powered by Claude AI</CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-insight-full"
        >
          <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : insight ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              {(() => {
                const config = sentimentConfig[insight.sentiment];
                const Icon = config.icon;
                return (
                  <Badge variant="outline" className={cn('gap-1.5 px-3 py-1', config.bg, config.border)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                    <span className={cn('font-medium capitalize', config.color)}>
                      {insight.sentiment} Market
                    </span>
                  </Badge>
                );
              })()}
              <span className="text-xs text-muted-foreground">
                {timeAgo(insight.generatedAt)}
              </span>
            </div>

            <p className="text-sm leading-relaxed">{insight.summary}</p>

            {insight.highlights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Key Highlights
                </p>
                <ul className="space-y-1.5">
                  {insight.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Unable to generate market insight</p>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Ask about the market</p>
          <form onSubmit={handleAsk} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Why is Bitcoin up today?"
              className="flex-1"
              disabled={askMutation.isPending}
              data-testid="input-ai-question"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!question.trim() || askMutation.isPending}
              data-testid="button-ask-ai"
            >
              {askMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {askMutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <p className="text-sm">{askMutation.data.answer}</p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
