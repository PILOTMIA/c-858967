import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, Minus, Clock, Globe, DollarSign } from 'lucide-react';

interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  currency: string;
  affectedPairs: string[];
  impact: 'High' | 'Medium' | 'Low';
  direction: 'Bullish' | 'Bearish' | 'Neutral';
  fundamentalAnalysis: string;
  category: 'Interest Rates' | 'Economic Data' | 'Central Bank' | 'Geopolitical' | 'Employment' | 'Inflation';
  confidence: number;
  url: string;
}

const fetchFundamentalNews = async (): Promise<NewsArticle[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return [
    {
      id: '1',
      headline: 'Fed Holds at 4.50%, Powell: Tariffs Adding Inflation Uncertainty',
      source: 'Reuters',
      publishedAt: '2026-03-18T18:00:00Z',
      currency: 'USD',
      affectedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
      impact: 'High',
      direction: 'Neutral',
      fundamentalAnalysis: 'Fed holds amid conflicting signals — tariffs push inflation higher but growth is softening. Two cuts still projected for H2 2026 but timing uncertain.',
      category: 'Central Bank',
      confidence: 88,
      url: 'https://www.reuters.com/markets/us/'
    },
    {
      id: '2',
      headline: 'ECB Delivers Sixth Consecutive Cut to 2.65%, Growth Forecast Slashed',
      source: 'Financial Times',
      publishedAt: '2026-03-06T13:00:00Z',
      currency: 'EUR',
      affectedPairs: ['EURUSD', 'EURGBP', 'EURJPY', 'EURCHF'],
      impact: 'High',
      direction: 'Bearish',
      fundamentalAnalysis: 'ECB in aggressive easing mode. 185bp rate gap vs Fed pressures EUR. Defense spending plans provide small upside risk.',
      category: 'Central Bank',
      confidence: 90,
      url: 'https://www.ft.com/markets'
    },
    {
      id: '3',
      headline: 'BoE Unanimous 9-0 Hold at 3.75%, UK CPI Surprises at 3.0%',
      source: 'Bloomberg',
      publishedAt: '2026-03-20T12:00:00Z',
      currency: 'GBP',
      affectedPairs: ['GBPUSD', 'EURGBP', 'GBPJPY'],
      impact: 'High',
      direction: 'Bullish',
      fundamentalAnalysis: 'Hawkish hold on inflation surprise. First unanimous vote since 2021 signals MPC consensus on patience. GBP supported.',
      category: 'Inflation',
      confidence: 87,
      url: 'https://www.bloomberg.com/markets'
    },
    {
      id: '4',
      headline: 'BoJ Hawkish Hold at 0.50%, April Hike Remains on the Table',
      source: 'Nikkei Asia',
      publishedAt: '2026-03-19T06:00:00Z',
      currency: 'JPY',
      affectedPairs: ['USDJPY', 'EURJPY', 'GBPJPY'],
      impact: 'High',
      direction: 'Bullish',
      fundamentalAnalysis: 'Only major CB hiking. 5.4% wage growth supports normalization. JPY benefiting from policy divergence with dovish peers.',
      category: 'Central Bank',
      confidence: 92,
      url: 'https://asia.nikkei.com/Economy'
    },
    {
      id: '5',
      headline: 'BoC Cuts to 2.75%, Tariff Risks Dominate Canadian Outlook',
      source: 'Globe and Mail',
      publishedAt: '2026-03-12T15:00:00Z',
      currency: 'CAD',
      affectedPairs: ['USDCAD', 'EURCAD', 'CADJPY'],
      impact: 'High',
      direction: 'Bearish',
      fundamentalAnalysis: 'Seventh consecutive BoC cut. US tariff threats could slash Canadian GDP. Rate differential widening against USD.',
      category: 'Central Bank',
      confidence: 85,
      url: 'https://www.theglobeandmail.com/business/markets/'
    },
    {
      id: '6',
      headline: 'RBA Cuts to 4.10% — First Cut in 4 Years, AUD Weakens',
      source: 'AFR',
      publishedAt: '2026-02-18T04:30:00Z',
      currency: 'AUD',
      affectedPairs: ['AUDUSD', 'AUDNZD', 'EURAUD'],
      impact: 'High',
      direction: 'Bearish',
      fundamentalAnalysis: 'RBA begins easing cycle but Bullock warns against expecting rapid cuts. China slowdown and trade war risks weigh on AUD outlook.',
      category: 'Central Bank',
      confidence: 83,
      url: 'https://www.afr.com/markets'
    },
    {
      id: '7',
      headline: 'SNB Holds at 0.00%, CHF Appreciation Pressures Exporters',
      source: 'NZZ',
      publishedAt: '2026-03-19T08:30:00Z',
      currency: 'CHF',
      affectedPairs: ['USDCHF', 'EURCHF', 'CHFJPY'],
      impact: 'Medium',
      direction: 'Neutral',
      fundamentalAnalysis: 'At lower bound with 0.3% inflation. Safe-haven flows keep CHF strong despite SNB intervention threats.',
      category: 'Central Bank',
      confidence: 75,
      url: 'https://www.nzz.ch/english/'
    },
    {
      id: '8',
      headline: 'US NFP Beats at 151K, Unemployment Ticks Up to 4.1%',
      source: 'Wall Street Journal',
      publishedAt: '2026-03-07T13:30:00Z',
      currency: 'USD',
      affectedPairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
      impact: 'High',
      direction: 'Neutral',
      fundamentalAnalysis: 'Mixed jobs report — headline beat but unemployment rising. Supports Fed caution rather than urgency to cut or hold.',
      category: 'Employment',
      confidence: 80,
      url: 'https://www.wsj.com/economy'
    },
    {
      id: '9',
      headline: 'US Tariff Escalation Triggers Global Risk-Off, Commodity Currencies Sink',
      source: 'Reuters',
      publishedAt: '2026-03-25T14:00:00Z',
      currency: 'USD',
      affectedPairs: ['AUDUSD', 'NZDUSD', 'USDCAD'],
      impact: 'High',
      direction: 'Bullish',
      fundamentalAnalysis: 'Broad tariff policy drives USD safe-haven bid. AUD, NZD, CAD weakest. Trade uncertainty could persist through Q2.',
      category: 'Geopolitical',
      confidence: 82,
      url: 'https://www.reuters.com/markets/currencies/'
    }
  ];
};

const FundamentalNewsAnalysis = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['fundamentalNews'],
    queryFn: fetchFundamentalNews,
    staleTime: 1000 * 60 * 60,
  });

  const getDirectionIcon = (d: string) => {
    if (d === 'Bullish') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (d === 'Bearish') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  const getDirectionColor = (d: string) => {
    if (d === 'Bullish') return 'text-green-400 border-green-400/20 bg-green-400/10';
    if (d === 'Bearish') return 'text-red-400 border-red-400/20 bg-red-400/10';
    return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
  };

  const getImpactColor = (i: string) => {
    if (i === 'High') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (i === 'Medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const filtered = articles?.filter(a => selectedCurrency === 'All' || a.currency === selectedCurrency) || [];
  const currencies = Array.from(new Set(articles?.map(a => a.currency) || []));

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground">Fundamental News Analysis</CardTitle></CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="text-destructive text-center">Failed to load news analysis</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Fundamental News — Q1 2026
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Key economic events and their currency impact from January through March 2026
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={selectedCurrency === 'All' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCurrency('All')} className="text-xs">All</Button>
          {currencies.map(c => (
            <Button key={c} variant={selectedCurrency === c ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCurrency(c)} className="text-xs">{c}</Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(article => (
            <div key={article.id} className="bg-muted/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={getImpactColor(article.impact)}>{article.impact}</Badge>
                <Badge variant="outline" className="text-xs">{article.category}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground text-sm hover:text-primary transition-colors block mb-1">
                {article.headline}
              </a>
              <p className="text-muted-foreground text-xs mb-3">{article.fundamentalAnalysis}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs font-mono">{article.currency}</Badge>
                </div>
                <Badge className={`${getDirectionColor(article.direction)} text-xs`}>
                  {getDirectionIcon(article.direction)}
                  <span className="ml-1">{article.direction}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">Confidence: {article.confidence}%</span>
                <span className="text-xs text-muted-foreground ml-auto">{article.source}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-border flex gap-1 flex-wrap">
                {article.affectedPairs.map(p => <Badge key={p} variant="outline" className="text-xs font-mono">{p}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FundamentalNewsAnalysis;
