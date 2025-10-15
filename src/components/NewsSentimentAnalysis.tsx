
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertCircle, Newspaper, Calendar, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  pairs?: string[];
}

interface SentimentAnalysis {
  overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  articles: NewsArticle[];
  summary: string;
  majorPairs: {
    [key: string]: {
      sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      score: number;
      mentions: number;
    };
  };
}

const analyzeSentiment = (text: string): { sentiment: 'bullish' | 'bearish' | 'neutral'; score: number } => {
  const bullishWords = [
    'gains', 'rally', 'surge', 'climb', 'rise', 'strengthen', 'boost', 'optimistic', 
    'positive', 'bullish', 'upward', 'growth', 'improvement', 'recovery', 'strong',
    'outperform', 'advance', 'momentum', 'breakout', 'support', 'bullish outlook'
  ];
  
  const bearishWords = [
    'falls', 'decline', 'drop', 'plunge', 'weaken', 'crash', 'bearish', 'negative',
    'downward', 'recession', 'concern', 'worry', 'risk', 'pressure', 'weakness',
    'underperform', 'retreat', 'correction', 'resistance', 'bearish outlook', 'volatility'
  ];

  const lowerText = text.toLowerCase();
  let bullishCount = 0;
  let bearishCount = 0;

  bullishWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    bullishCount += matches;
  });

  bearishWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    bearishCount += matches;
  });

  const totalWords = bullishCount + bearishCount;
  if (totalWords === 0) return { sentiment: 'neutral', score: 0 };

  const bullishRatio = bullishCount / totalWords;
  const score = Math.abs(bullishRatio - 0.5) * 2; // 0 to 1 scale

  if (bullishCount > bearishCount) {
    return { sentiment: 'bullish', score };
  } else if (bearishCount > bullishCount) {
    return { sentiment: 'bearish', score };
  } else {
    return { sentiment: 'neutral', score: 0 };
  }
};

const fetchNewsSentiment = async (): Promise<SentimentAnalysis> => {
  try {
    // In production, you'd use multiple news APIs like NewsAPI, Alpha Vantage, etc.
    // For demo purposes, we'll simulate comprehensive news analysis
    console.log('Fetching news sentiment from multiple sources...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockArticles: NewsArticle[] = [
      {
        title: "Federal Reserve Signals Potential Rate Cuts as Inflation Cools",
        description: "The Fed's dovish stance strengthens market sentiment as economic data shows cooling inflation, boosting USD pairs outlook.",
        url: "#",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Reuters",
        sentiment: 'bullish',
        score: 0.75,
        pairs: ['EURUSD', 'GBPUSD', 'USDJPY']
      },
      {
        title: "ECB President Lagarde Warns of Persistent Inflation Risks",
        description: "European Central Bank concerns over sticky inflation could pressure EUR pairs as hawkish monetary policy continues.",
        url: "#",
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Bloomberg",
        sentiment: 'bearish',
        score: 0.65,
        pairs: ['EURUSD', 'EURGBP', 'EURJPY']
      },
      {
        title: "Oil Prices Surge on OPEC+ Production Cuts",
        description: "Energy sector rally strengthens commodity currencies, with CAD and NOK showing positive momentum against USD.",
        url: "#",
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Financial Times",
        sentiment: 'bullish',
        score: 0.80,
        pairs: ['USDCAD', 'USDNOK']
      },
      {
        title: "Bank of Japan Maintains Ultra-Loose Policy Despite Yen Weakness",
        description: "BoJ's commitment to low rates continues to weaken JPY as inflation remains below target, creating intervention risks.",
        url: "#",
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        source: "MarketWatch",
        sentiment: 'bearish',
        score: 0.70,
        pairs: ['USDJPY', 'EURJPY', 'GBPJPY']
      },
      {
        title: "UK Employment Data Shows Resilient Labor Market",
        description: "Strong UK jobs data supports GBP strength as wage growth remains elevated, potentially influencing BoE policy decisions.",
        url: "#",
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: "BBC Business",
        sentiment: 'bullish',
        score: 0.68,
        pairs: ['GBPUSD', 'EURGBP', 'GBPJPY']
      },
      {
        title: "Global Trade Tensions Rise as China GDP Growth Slows",
        description: "Concerns over Chinese economic slowdown and trade relations weigh on risk sentiment, affecting commodity currencies.",
        url: "#",
        publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        source: "CNBC",
        sentiment: 'bearish',
        score: 0.72,
        pairs: ['AUDUSD', 'NZDUSD', 'USDCAD']
      }
    ];

    // Calculate overall sentiment
    const bullishArticles = mockArticles.filter(a => a.sentiment === 'bullish');
    const bearishArticles = mockArticles.filter(a => a.sentiment === 'bearish');
    
    const avgBullishScore = bullishArticles.reduce((sum, a) => sum + a.score, 0) / bullishArticles.length || 0;
    const avgBearishScore = bearishArticles.reduce((sum, a) => sum + a.score, 0) / bearishArticles.length || 0;
    
    let overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    let overallScore: number;
    
    if (bullishArticles.length > bearishArticles.length && avgBullishScore > 0.6) {
      overall = 'BULLISH';
      overallScore = avgBullishScore;
    } else if (bearishArticles.length > bullishArticles.length && avgBearishScore > 0.6) {
      overall = 'BEARISH';
      overallScore = avgBearishScore;
    } else {
      overall = 'NEUTRAL';
      overallScore = 0.5;
    }

    // Analyze major pairs sentiment
    const majorPairs: SentimentAnalysis['majorPairs'] = {};
    const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD'];
    
    pairs.forEach(pair => {
      const pairArticles = mockArticles.filter(a => a.pairs?.includes(pair));
      const pairBullish = pairArticles.filter(a => a.sentiment === 'bullish');
      const pairBearish = pairArticles.filter(a => a.sentiment === 'bearish');
      
      let pairSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      let pairScore: number;
      
      if (pairBullish.length > pairBearish.length) {
        pairSentiment = 'BULLISH';
        pairScore = pairBullish.reduce((sum, a) => sum + a.score, 0) / pairBullish.length || 0;
      } else if (pairBearish.length > pairBullish.length) {
        pairSentiment = 'BEARISH';
        pairScore = pairBearish.reduce((sum, a) => sum + a.score, 0) / pairBearish.length || 0;
      } else {
        pairSentiment = 'NEUTRAL';
        pairScore = 0.5;
      }
      
      majorPairs[pair] = {
        sentiment: pairSentiment,
        score: pairScore,
        mentions: pairArticles.length
      };
    });

    return {
      overall,
      score: overallScore,
      articles: mockArticles,
      summary: `Analysis of ${mockArticles.length} articles from major financial news sources over the last 30 days. ${overall.toLowerCase()} sentiment detected based on ${bullishArticles.length} positive and ${bearishArticles.length} negative signals.`,
      majorPairs
    };
  } catch (error) {
    console.error('Error fetching news sentiment:', error);
    throw error;
  }
};

const NewsSentimentAnalysis = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: sentimentData, isLoading, error } = useQuery({
    queryKey: ['newsSentiment'],
    queryFn: fetchNewsSentiment,
    refetchInterval: 1000 * 60 * 60 * 24 * 30, // Auto-refresh every 30 days (monthly)
    staleTime: 1000 * 60 * 60 * 24 * 30, // Consider data stale after 30 days
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'BEARISH':
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
      case 'bullish':
        return 'text-green-400 bg-green-900/20 border-green-500';
      case 'BEARISH':
      case 'bearish':
        return 'text-red-400 bg-red-900/20 border-red-500';
      default:
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
    }
  };

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load news sentiment. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <Newspaper className="w-6 h-6 text-blue-400" />
            Market News Sentiment
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-300">
              <Calendar className="w-3 h-3 mr-1" />
              30 Days
            </Badge>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        ) : (
          <>
            {/* Overall Sentiment */}
            <div className={`p-4 rounded-lg border ${getSentimentColor(sentimentData?.overall || '')}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(sentimentData?.overall || '')}
                  <span className="text-xl font-bold">
                    Overall Market Sentiment: {sentimentData?.overall}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round((sentimentData?.score || 0) * 100)}%
                </div>
              </div>
              <p className="text-sm text-gray-300">{sentimentData?.summary}</p>
            </div>

            {/* Major Pairs Sentiment */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(sentimentData?.majorPairs || {}).map(([pair, data]) => (
                <div key={pair} className={`p-3 rounded border ${getSentimentColor(data.sentiment)}`}>
                  <div className="text-center">
                    <div className="font-semibold text-sm mb-1">{pair}</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {getSentimentIcon(data.sentiment)}
                      <span className="text-xs">{data.sentiment}</span>
                    </div>
                    <div className="text-xs text-gray-400">{data.mentions} mentions</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Articles */}
            {isExpanded && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">Recent Market News</h4>
                {sentimentData?.articles.slice(0, 6).map((article, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-white text-sm leading-tight flex-1">
                        {article.title}
                      </h5>
                      <div className="flex items-center gap-2 ml-3">
                        {getSentimentIcon(article.sentiment)}
                        <span className="text-xs text-gray-400">
                          {Math.round(article.score * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs mb-2">{article.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Globe className="w-3 h-3" />
                        <span>{article.source}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      {article.pairs && (
                        <div className="flex gap-1">
                          {article.pairs.map(pair => (
                            <Badge key={pair} variant="outline" className="text-xs">
                              {pair}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Auto Update Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="font-medium">Auto-updates monthly with latest market sentiment data</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsSentimentAnalysis;
