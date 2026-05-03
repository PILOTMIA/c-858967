export type MarketNewsSentiment = 'bullish' | 'bearish' | 'neutral';
export type MarketNewsImpact = 'High' | 'Medium' | 'Low';
export type MarketNewsCategory = 'Interest Rates' | 'Economic Data' | 'Central Bank' | 'Geopolitical' | 'Employment' | 'Inflation' | 'Commodities' | 'Currencies';

export interface MarketNewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  domain: string;
  sentiment: MarketNewsSentiment;
  score: number;
  currency: string;
  pairs: string[];
  impact: MarketNewsImpact;
  category: MarketNewsCategory;
  confidence: number;
  analysis: string;
}

export interface MarketNewsResponse {
  articles: MarketNewsArticle[];
  summary: string;
  source: 'gdelt_live' | 'fallback';
  fetchedAt: string;
  nextRefreshArizona: string[];
  majorPairs: Record<string, { sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; score: number; mentions: number }>;
  overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
}

const fallbackNews: MarketNewsResponse = {
  articles: [],
  summary: 'Live market news is temporarily unavailable. The page will retry automatically and refresh again at the scheduled Arizona update windows.',
  source: 'fallback',
  fetchedAt: new Date().toISOString(),
  nextRefreshArizona: ['2:00 PM Arizona', '3:00 PM Arizona'],
  majorPairs: {},
  overall: 'NEUTRAL',
  score: 0.5,
};

export const fetchMarketNews = async (): Promise<MarketNewsResponse> => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!projectId || !anonKey) return fallbackNews;

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/market-news?limit=30`, {
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(18000),
  });

  if (!response.ok) {
    throw new Error(`Market news failed with status ${response.status}`);
  }

  const data = await response.json();
  return {
    ...fallbackNews,
    ...data,
    articles: Array.isArray(data.articles) ? data.articles : [],
    fetchedAt: data.fetchedAt || new Date().toISOString(),
  };
};
