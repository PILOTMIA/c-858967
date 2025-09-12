import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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

// Mock data simulating real fundamental analysis
const fetchFundamentalNews = async (): Promise<NewsArticle[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const articles: NewsArticle[] = [
    {
      id: '1',
      headline: 'Fed Chair Powell Signals Potential Rate Cuts in Q2 2025',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      currency: 'USD',
      affectedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
      impact: 'High',
      direction: 'Bearish',
      fundamentalAnalysis: 'Lower interest rates typically weaken the USD as yield differentials narrow. This dovish stance from the Fed reduces USD attractiveness for carry trades.',
      category: 'Central Bank',
      confidence: 85,
      url: '#'
    },
    {
      id: '2',
      headline: 'ECB Maintains Hawkish Stance Despite Economic Slowdown',
      source: 'Financial Times',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      currency: 'EUR',
      affectedPairs: ['EURUSD', 'EURGBP', 'EURJPY', 'EURCHF'],
      impact: 'High',
      direction: 'Bullish',
      fundamentalAnalysis: 'ECB\'s commitment to fighting inflation supports EUR strength. Higher rates increase yield appeal and attract foreign investment into Eurozone.',
      category: 'Central Bank',
      confidence: 78,
      url: '#'
    },
    {
      id: '3',
      headline: 'UK GDP Growth Exceeds Expectations at 0.8% QoQ',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      currency: 'GBP',
      affectedPairs: ['GBPUSD', 'EURGBP', 'GBPJPY', 'GBPAUD'],
      impact: 'Medium',
      direction: 'Bullish',
      fundamentalAnalysis: 'Strong GDP growth indicates economic resilience, supporting BoE\'s case for maintaining higher rates. Growth outperformance attracts investment flows.',
      category: 'Economic Data',
      confidence: 72,
      url: '#'
    },
    {
      id: '4',
      headline: 'Bank of Japan Hints at Further Yen Intervention Measures',
      source: 'Nikkei',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      currency: 'JPY',
      affectedPairs: ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY'],
      impact: 'Medium',
      direction: 'Bullish',
      fundamentalAnalysis: 'BoJ intervention threats create upside risks for JPY. Market positioning suggests vulnerability to squeeze higher if intervention occurs.',
      category: 'Central Bank',
      confidence: 68,
      url: '#'
    },
    {
      id: '5',
      headline: 'Australian Employment Surges, Unemployment Falls to 3.8%',
      source: 'Australian Financial Review',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      currency: 'AUD',
      affectedPairs: ['AUDUSD', 'EURAUD', 'GBPAUD', 'AUDJPY'],
      impact: 'Medium',
      direction: 'Bullish',
      fundamentalAnalysis: 'Strong employment data reduces RBA dovish pressure. Tight labor market supports wage growth and consumption, bullish for AUD.',
      category: 'Employment',
      confidence: 75,
      url: '#'
    },
    {
      id: '6',
      headline: 'Canadian Inflation Accelerates to 3.2% YoY in July',
      source: 'Globe and Mail',
      publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      currency: 'CAD',
      affectedPairs: ['USDCAD', 'EURCAD', 'GBPCAD', 'AUDCAD'],
      impact: 'High',
      direction: 'Bullish',
      fundamentalAnalysis: 'Rising inflation above BoC target increases rate hike probability. Energy sector strength and housing demand support CAD fundamentals.',
      category: 'Inflation',
      confidence: 82,
      url: '#'
    },
    {
      id: '7',
      headline: 'China Manufacturing PMI Falls Below 50, Trade War Concerns Rise',
      source: 'South China Morning Post',
      publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      currency: 'CNY',
      affectedPairs: ['USDCNY', 'EURCNY', 'GBPCNY', 'AUDCNY'],
      impact: 'Medium',
      direction: 'Bearish',
      fundamentalAnalysis: 'Weakening manufacturing indicates economic slowdown. Risk-off sentiment typically benefits safe-haven currencies over commodity currencies like AUD.',
      category: 'Economic Data',
      confidence: 70,
      url: '#'
    },
    {
      id: '8',
      headline: 'Swiss National Bank Considers FX Intervention as CHF Strengthens',
      source: 'Neue Zürcher Zeitung',
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      currency: 'CHF',
      affectedPairs: ['USDCHF', 'EURCHF', 'GBPCHF', 'CHFJPY'],
      impact: 'Medium',
      direction: 'Bearish',
      fundamentalAnalysis: 'SNB intervention threats limit CHF upside. Swiss franc strength hurts export competitiveness, justifying central bank action.',
      category: 'Central Bank',
      confidence: 65,
      url: '#'
    },
    {
      id: '9',
      headline: 'FOMC Minutes Reveal Split on Monetary Policy Direction',
      source: 'Wall Street Journal',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'USD',
      affectedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'],
      impact: 'High',
      direction: 'Neutral',
      fundamentalAnalysis: 'Mixed signals from Fed officials create uncertainty about future rate path. Markets await clearer guidance on monetary policy stance.',
      category: 'Central Bank',
      confidence: 60,
      url: '#'
    },
    {
      id: '10',
      headline: 'European Energy Crisis Deepens as Gas Prices Surge 15%',
      source: 'Energy Intelligence',
      publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'EUR',
      affectedPairs: ['EURUSD', 'EURGBP', 'EURJPY', 'EURCHF'],
      impact: 'High',
      direction: 'Bearish',
      fundamentalAnalysis: 'Rising energy costs increase inflationary pressure and economic headwinds for Eurozone. Potential for ECB policy complications.',
      category: 'Economic Data',
      confidence: 78,
      url: '#'
    },
    {
      id: '11',
      headline: 'New Zealand RBNZ Surprises Markets with Hawkish Tone',
      source: 'Reserve Bank of New Zealand',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'NZD',
      affectedPairs: ['NZDUSD', 'AUDNZD', 'EURNZD', 'GBPNZD'],
      impact: 'Medium',
      direction: 'Bullish',
      fundamentalAnalysis: 'RBNZ signals potential rate increases to combat persistent inflation. NZD strength supported by central bank policy divergence.',
      category: 'Central Bank',
      confidence: 74,
      url: '#'
    },
    {
      id: '12',
      headline: 'Global Risk-Off as Geopolitical Tensions Escalate',
      source: 'Associated Press',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      currency: 'Multiple',
      affectedPairs: ['USDJPY', 'USDCHF', 'XAUUSD', 'AUDUSD'],
      impact: 'High',
      direction: 'Neutral',
      fundamentalAnalysis: 'Safe-haven demand increases for JPY, CHF, and USD while risk currencies like AUD face pressure. Gold sees increased interest.',
      category: 'Geopolitical',
      confidence: 82,
      url: '#'
    }
  ];

  return articles;
};

const FundamentalNewsAnalysis = () => {
  const [selectedImpact, setSelectedImpact] = useState<string>('All');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['fundamentalNews'],
    queryFn: fetchFundamentalNews,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'Bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'Bullish':
        return 'text-green-400 border-green-400/20 bg-green-400/10';
      case 'Bearish':
        return 'text-red-400 border-red-400/20 bg-red-400/10';
      default:
        return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Central Bank':
        return <DollarSign className="w-3 h-3" />;
      case 'Economic Data':
        return <TrendingUp className="w-3 h-3" />;
      case 'Geopolitical':
        return <Globe className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const filteredArticles = articles?.filter(article => {
    const matchesImpact = selectedImpact === 'All' || article.impact === selectedImpact;
    const matchesCurrency = selectedCurrency === 'All' || article.currency === selectedCurrency;
    return matchesImpact && matchesCurrency;
  }) || [];

  const uniqueCurrencies = Array.from(new Set(articles?.map(a => a.currency) || []));

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Fundamental News Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="text-red-400 text-center">Failed to load news analysis</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Fundamental News Analysis
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Real-time fundamental analysis of news events and their impact on currency pairs
          </p>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="space-x-2">
              <span className="text-sm text-gray-300">Impact:</span>
              {['All', 'High', 'Medium', 'Low'].map(impact => (
                <Button
                  key={impact}
                  variant={selectedImpact === impact ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedImpact(impact)}
                  className="text-xs"
                >
                  {impact}
                </Button>
              ))}
            </div>
            <div className="space-x-2">
              <span className="text-sm text-gray-300">Currency:</span>
              <Button
                variant={selectedCurrency === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCurrency('All')}
                className="text-xs"
              >
                All
              </Button>
              {uniqueCurrencies.map(currency => (
                <Button
                  key={currency}
                  variant={selectedCurrency === currency ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCurrency(currency)}
                  className="text-xs"
                >
                  {currency}
                </Button>
              ))}
            </div>
          </div>

          {/* News Feed */}
          <div className="space-y-4">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getImpactColor(article.impact)}>
                        {article.impact} Impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(article.category)}
                        <span className="ml-1">{article.category}</span>
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(article.publishedAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-white font-medium text-sm mb-2 leading-relaxed">
                      {article.headline}
                    </h3>
                    <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                      {article.fundamentalAnalysis}
                    </p>
                    <div className="text-xs text-gray-400 mb-2">
                      Source: {article.source}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Primary Currency:</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {article.currency}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Direction:</span>
                      <Badge className={`${getDirectionColor(article.direction)} text-xs`}>
                        {getDirectionIcon(article.direction)}
                        <span className="ml-1">{article.direction}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Confidence:</span>
                      <span className="text-xs font-medium text-white">{article.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Affected Pairs */}
                <div className="mt-3 pt-3 border-t border-gray-600/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">Affected Pairs:</span>
                    {article.affectedPairs.map(pair => (
                      <Badge
                        key={pair}
                        variant="outline"
                        className="text-xs font-mono bg-gray-700/30"
                      >
                        {pair}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No articles match the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FundamentalNewsAnalysis;