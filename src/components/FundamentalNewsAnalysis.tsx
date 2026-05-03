import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { fetchMarketNews } from '@/services/MarketNewsService';

const getDirectionIcon = (direction: string) => {
  if (direction === 'Bullish' || direction === 'bullish') return <TrendingUp className="h-4 w-4 text-success" />;
  if (direction === 'Bearish' || direction === 'bearish') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-warning" />;
};

const getDirectionLabel = (direction: string) => direction.charAt(0).toUpperCase() + direction.slice(1).toLowerCase();

const getDirectionColor = (direction: string) => {
  if (direction === 'Bullish' || direction === 'bullish') return 'border-success/40 bg-success/15 text-success';
  if (direction === 'Bearish' || direction === 'bearish') return 'border-destructive/40 bg-destructive/15 text-destructive';
  return 'border-warning/40 bg-warning/15 text-warning';
};

const getImpactColor = (impact: string) => {
  if (impact === 'High') return 'border-destructive/40 bg-destructive/15 text-destructive';
  if (impact === 'Medium') return 'border-warning/40 bg-warning/15 text-warning';
  return 'border-success/40 bg-success/15 text-success';
};

const FundamentalNewsAnalysis = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketNewsLive'],
    queryFn: fetchMarketNews,
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 15,
  });

  const articles = data?.articles || [];
  const filtered = articles.filter((article) => selectedCurrency === 'All' || article.currency === selectedCurrency);
  const currencies = Array.from(new Set(articles.map((article) => article.currency))).sort();

  if (isLoading) {
    return (
      <Card className="border-border bg-card text-card-foreground">
        <CardHeader><CardTitle className="text-foreground">Fundamental News Analysis</CardTitle></CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, index) => <div key={index} className="h-28 rounded-lg bg-muted" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border bg-card text-card-foreground">
        <CardContent className="p-6">
          <div className="text-center text-sm font-semibold text-destructive">Failed to load live fundamental news.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <Globe className="h-5 w-5 text-primary" />
          Fundamental News — Live
        </CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Current economic, central bank, yield, currency, and gold headlines with direct source citations.
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap gap-2">
          <Button variant={selectedCurrency === 'All' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCurrency('All')} className="text-sm">All</Button>
          {currencies.map((currency) => (
            <Button key={currency} variant={selectedCurrency === currency ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCurrency(currency)} className="text-sm">
              {currency}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((article) => (
            <article key={article.id} className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/60">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className={`${getImpactColor(article.impact)} text-sm`}>{article.impact}</Badge>
                <Badge variant="outline" className="border-border text-sm text-foreground">{article.category}</Badge>
                <span className="text-sm text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="mb-2 block text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary">
                {article.title}
              </a>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{article.analysis || article.description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-border text-sm font-mono text-foreground">{article.currency}</Badge>
                <Badge className={`${getDirectionColor(article.sentiment)} text-sm`}>
                  {getDirectionIcon(article.sentiment)}
                  <span className="ml-1">{getDirectionLabel(article.sentiment)}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">Confidence: {article.confidence}%</span>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:text-primary sm:ml-auto">{article.source}</a>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                {article.pairs.map((pair) => <Badge key={pair} variant="outline" className="border-border text-sm font-mono text-foreground">{pair}</Badge>)}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FundamentalNewsAnalysis;
