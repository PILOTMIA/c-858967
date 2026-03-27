import { useState } from 'react';
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

const fetchNewsSentiment = async (): Promise<SentimentAnalysis> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const articles: NewsArticle[] = [
    // January 2026
    {
      title: "Fed Holds Rates at 4.50% in First 2026 Meeting, Cites Persistent Inflation",
      description: "Federal Reserve maintains rates as core PCE remains above 2.5%. Powell signals patience with 'higher for longer' stance into 2026.",
      url: "https://www.reuters.com/markets/us/federal-reserve-monetary-policy",
      publishedAt: "2026-01-29T19:00:00Z",
      source: "Reuters",
      sentiment: 'bullish',
      score: 0.82,
      pairs: ['EURUSD', 'GBPUSD', 'USDJPY']
    },
    {
      title: "ECB Cuts Rates to 2.90%, Lagarde Warns Eurozone Growth Stalling",
      description: "Fifth consecutive ECB cut as manufacturing PMI stays below 46. EUR weakens broadly on widening rate differential with Fed.",
      url: "https://www.ecb.europa.eu/press/govcouncil/mopo/html/index.en.html",
      publishedAt: "2026-01-30T13:00:00Z",
      source: "ECB",
      sentiment: 'bearish',
      score: 0.85,
      pairs: ['EURUSD', 'EURGBP', 'EURJPY']
    },
    // February 2026
    {
      title: "RBA Delivers First Rate Cut in 4 Years, AUD Drops on Dovish Outlook",
      description: "Reserve Bank of Australia cuts cash rate 25bp to 4.10%. Governor Bullock cautions this is not the start of an aggressive cutting cycle.",
      url: "https://www.rba.gov.au/monetary-policy/",
      publishedAt: "2026-02-18T04:30:00Z",
      source: "RBA",
      sentiment: 'bearish',
      score: 0.78,
      pairs: ['AUDUSD', 'AUDNZD', 'EURAUD']
    },
    {
      title: "BoE Cuts to 4.50% But Bailey Stresses Gradual Approach",
      description: "Bank of England reduces rate by 25bp with 7-2 vote split. Services inflation at 4.8% limits speed of easing cycle.",
      url: "https://www.bankofengland.co.uk/monetary-policy/",
      publishedAt: "2026-02-06T12:00:00Z",
      source: "Bank of England",
      sentiment: 'bearish',
      score: 0.72,
      pairs: ['GBPUSD', 'EURGBP', 'GBPJPY']
    },
    {
      title: "RBNZ Delivers Third 50bp Cut to 3.75%, NZD Tumbles",
      description: "Reserve Bank of New Zealand continues aggressive easing as economy exits recession. Terminal rate seen at 3.00% by mid-2026.",
      url: "https://www.rbnz.govt.nz/monetary-policy/",
      publishedAt: "2026-02-19T01:00:00Z",
      source: "RBNZ",
      sentiment: 'bearish',
      score: 0.88,
      pairs: ['NZDUSD', 'AUDNZD', 'EURNZD']
    },
    // March 2026
    {
      title: "ECB Cuts Sixth Time to 2.65%, Defense Spending Plans Boost EUR Briefly",
      description: "Sixth consecutive cut but EUR finds support from massive EU defense spending plans. Growth forecast cut to 0.9% for 2026.",
      url: "https://www.ecb.europa.eu/press/govcouncil/mopo/html/index.en.html",
      publishedAt: "2026-03-06T13:00:00Z",
      source: "ECB",
      sentiment: 'neutral',
      score: 0.55,
      pairs: ['EURUSD', 'EURGBP', 'EURJPY']
    },
    {
      title: "BoC Cuts to 2.75%, Macklem Warns US Tariffs Could Slash GDP",
      description: "Bank of Canada delivers seventh consecutive cut. Tariff uncertainty dominates outlook with GDP forecast cut to 1.0%.",
      url: "https://www.bankofcanada.ca/core-functions/monetary-policy/",
      publishedAt: "2026-03-12T15:00:00Z",
      source: "Bank of Canada",
      sentiment: 'bearish',
      score: 0.80,
      pairs: ['USDCAD', 'EURCAD', 'CADJPY']
    },
    {
      title: "Fed Holds at 4.50%, Tariff Uncertainty Clouds Outlook",
      description: "FOMC holds rates steady. Powell acknowledges tariffs raising inflation while slowing growth. Two cuts still projected for late 2026.",
      url: "https://www.federalreserve.gov/monetarypolicy/fomcpresconf20260318.htm",
      publishedAt: "2026-03-18T18:00:00Z",
      source: "Federal Reserve",
      sentiment: 'neutral',
      score: 0.60,
      pairs: ['EURUSD', 'GBPUSD', 'USDJPY']
    },
    {
      title: "BoJ Holds at 0.50% But Ueda Keeps April Hike on the Table",
      description: "Bank of Japan maintains hawkish tone as wage growth hits 5.4%. Only major bank actively hiking — JPY strengthens on divergence.",
      url: "https://www.boj.or.jp/en/mopo/outline/index.htm",
      publishedAt: "2026-03-19T06:00:00Z",
      source: "Bank of Japan",
      sentiment: 'bullish',
      score: 0.84,
      pairs: ['USDJPY', 'EURJPY', 'GBPJPY']
    },
    {
      title: "SNB Holds at 0.00%, CHF Safe-Haven Bid Intensifies on Trade War",
      description: "Swiss National Bank at lower bound. Inflation at just 0.3% but franc appreciation continues on global risk-off flows.",
      url: "https://www.snb.ch/en/the-snb/mandates-goals/monetary-policy/",
      publishedAt: "2026-03-19T08:30:00Z",
      source: "SNB",
      sentiment: 'bullish',
      score: 0.70,
      pairs: ['USDCHF', 'EURCHF', 'CHFJPY']
    },
    {
      title: "BoE Holds at 3.75% Unanimously, CPI Jumps to 3.0%",
      description: "First unanimous MPC hold since 2021. UK inflation surprise kills near-term rate cut bets. GBP rallies on hawkish repricing.",
      url: "https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/march-2026",
      publishedAt: "2026-03-20T12:00:00Z",
      source: "Bank of England",
      sentiment: 'bullish',
      score: 0.86,
      pairs: ['GBPUSD', 'EURGBP', 'GBPJPY']
    },
    {
      title: "US Tariff Escalation Hits Emerging Markets, Risk-Off Drives USD and CHF Demand",
      description: "Broad tariff policy rattles global trade. Commodity currencies AUD, NZD, CAD under pressure while safe havens outperform.",
      url: "https://www.reuters.com/markets/currencies/",
      publishedAt: "2026-03-25T14:00:00Z",
      source: "Reuters",
      sentiment: 'bearish',
      score: 0.76,
      pairs: ['AUDUSD', 'NZDUSD', 'USDCAD']
    }
  ];

  const bullishArticles = articles.filter(a => a.sentiment === 'bullish');
  const bearishArticles = articles.filter(a => a.sentiment === 'bearish');
  
  const avgBullishScore = bullishArticles.reduce((sum, a) => sum + a.score, 0) / (bullishArticles.length || 1);
  const avgBearishScore = bearishArticles.reduce((sum, a) => sum + a.score, 0) / (bearishArticles.length || 1);
  
  let overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let overallScore = 0.5;
  
  if (bullishArticles.length > bearishArticles.length) {
    overall = 'BULLISH';
    overallScore = avgBullishScore;
  } else if (bearishArticles.length > bullishArticles.length) {
    overall = 'BEARISH';
    overallScore = avgBearishScore;
  }

  const majorPairs: SentimentAnalysis['majorPairs'] = {};
  ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD'].forEach(pair => {
    const pairArticles = articles.filter(a => a.pairs?.includes(pair));
    const pB = pairArticles.filter(a => a.sentiment === 'bullish');
    const pBr = pairArticles.filter(a => a.sentiment === 'bearish');
    let pS: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let sc = 0.5;
    if (pB.length > pBr.length) { pS = 'BULLISH'; sc = pB.reduce((s, a) => s + a.score, 0) / pB.length; }
    else if (pBr.length > pB.length) { pS = 'BEARISH'; sc = pBr.reduce((s, a) => s + a.score, 0) / pBr.length; }
    majorPairs[pair] = { sentiment: pS, score: sc, mentions: pairArticles.length };
  });

  return {
    overall,
    score: overallScore,
    articles,
    summary: `Analysis of ${articles.length} central bank decisions and market events from Jan–Mar 2026. Theme: Divergent monetary policy — Fed holding, ECB/RBNZ/BoC cutting, BoJ ready to hike.`,
    majorPairs
  };
};

const NewsSentimentAnalysis = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: sentimentData, isLoading, error } = useQuery({
    queryKey: ['newsSentiment'],
    queryFn: fetchNewsSentiment,
    staleTime: 1000 * 60 * 60,
  });

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'BULLISH' || sentiment === 'bullish') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (sentiment === 'BEARISH' || sentiment === 'bearish') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <AlertCircle className="w-5 h-5 text-yellow-400" />;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'BULLISH' || sentiment === 'bullish') return 'text-green-400 bg-green-900/20 border-green-500';
    if (sentiment === 'BEARISH' || sentiment === 'bearish') return 'text-red-400 bg-red-900/20 border-red-500';
    return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
  };

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load news sentiment.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Newspaper className="w-5 h-5 text-primary" />
            Market News Sentiment — Q1 2026
          </CardTitle>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded text-sm transition-colors"
          >
            {isExpanded ? 'Collapse' : 'View All'}
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-lg border ${getSentimentColor(sentimentData?.overall || '')}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(sentimentData?.overall || '')}
                  <span className="text-lg font-bold">
                    Overall: {sentimentData?.overall}
                  </span>
                </div>
                <span className="text-xl font-bold">
                  {Math.round((sentimentData?.score || 0) * 100)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{sentimentData?.summary}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(sentimentData?.majorPairs || {}).map(([pair, data]) => (
                <div key={pair} className={`p-3 rounded border ${getSentimentColor(data.sentiment)}`}>
                  <div className="text-center">
                    <div className="font-semibold text-sm mb-1">{pair}</div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {getSentimentIcon(data.sentiment)}
                      <span className="text-xs">{data.sentiment}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{data.mentions} events</div>
                  </div>
                </div>
              ))}
            </div>

            {isExpanded && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-foreground">All Events — Jan to Mar 2026</h4>
                {sentimentData?.articles.map((article, index) => (
                  <div key={index} className="bg-muted/50 p-4 rounded border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-foreground text-sm leading-tight flex-1 hover:text-primary transition-colors"
                      >
                        {article.title}
                      </a>
                      <div className="flex items-center gap-2 ml-3">
                        {getSentimentIcon(article.sentiment)}
                        <span className="text-xs text-muted-foreground">
                          {Math.round(article.score * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs mb-2">{article.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        <span>{article.source}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </a>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsSentimentAnalysis;
