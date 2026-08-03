type Sentiment = 'bullish' | 'bearish' | 'neutral';
type Impact = 'High' | 'Medium' | 'Low';

type Article = {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  domain: string;
  sentiment: Sentiment;
  score: number;
  currency: string;
  pairs: string[];
  impact: Impact;
  category: string;
  confidence: number;
  analysis: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const CURRENCY_RULES: Record<string, { terms: string[]; pairs: string[] }> = {
  USD: { terms: ['fed', 'federal reserve', 'powell', 'dollar', 'treasury', 'us yields', 'nfp', 'jobs report', 'cpi', 'ppi', 'pce'], pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD'] },
  EUR: { terms: ['ecb', 'lagarde', 'eurozone', 'euro '], pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
  GBP: { terms: ['boe', 'bank of england', 'sterling', 'pound', 'uk inflation', 'gilt'], pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
  JPY: { terms: ['boj', 'bank of japan', 'yen', 'ueda', 'japan wages'], pairs: ['USDJPY', 'EURJPY', 'GBPJPY'] },
  CAD: { terms: ['bank of canada', 'boc', 'canadian dollar', 'loonie', 'canada inflation'], pairs: ['USDCAD', 'CADJPY'] },
  AUD: { terms: ['rba', 'australian dollar', 'aussie', 'australia jobs', 'china demand'], pairs: ['AUDUSD', 'AUDJPY'] },
  NZD: { terms: ['rbnz', 'new zealand dollar', 'kiwi'], pairs: ['NZDUSD', 'NZDJPY'] },
  CHF: { terms: ['snb', 'swiss franc', 'switzerland inflation'], pairs: ['USDCHF', 'EURCHF'] },
  XAU: { terms: ['gold', 'bullion', 'xau', 'precious metals'], pairs: ['XAUUSD'] },
};

const BULLISH_TERMS = ['rise', 'rises', 'rally', 'jumps', 'gains', 'hawkish', 'higher yields', 'strong jobs', 'inflation hot', 'safe haven', 'beats', 'strengthens', 'surge', 'climb', 'boost', 'soar', 'record high'];
const BEARISH_TERMS = ['falls', 'drops', 'slides', 'cuts', 'dovish', 'weak', 'misses', 'slowdown', 'recession', 'lower yields', 'easing', 'risk-off', 'plunge', 'tumble', 'slump', 'sinks', 'sell-off'];
const HIGH_IMPACT_TERMS = ['fed', 'ecb', 'boe', 'boj', 'cpi', 'inflation', 'jobs', 'payrolls', 'rates', 'treasury', 'gold', 'rate cut', 'rate hike'];

function cleanText(value: unknown): string {
  return String(value || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferCurrency(text: string): { currency: string; pairs: string[] } {
  const lower = text.toLowerCase();
  const match = Object.entries(CURRENCY_RULES).find(([, rule]) => rule.terms.some(term => lower.includes(term)));
  if (!match) return { currency: 'USD', pairs: ['EURUSD', 'GBPUSD', 'USDJPY'] };
  return { currency: match[0], pairs: match[1].pairs };
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('gold') || lower.includes('bullion') || lower.includes('oil') || lower.includes('commodit')) return 'Commodities';
  if (lower.includes('jobs') || lower.includes('payroll') || lower.includes('employment') || lower.includes('unemployment')) return 'Employment';
  if (lower.includes('inflation') || lower.includes('cpi') || lower.includes('pce') || lower.includes('ppi')) return 'Inflation';
  if (lower.includes('rate') || lower.includes('yield') || lower.includes('treasury') || lower.includes('bond')) return 'Interest Rates';
  if (lower.includes('fed') || lower.includes('ecb') || lower.includes('boe') || lower.includes('boj') || lower.includes('central bank')) return 'Central Bank';
  if (lower.includes('tariff') || lower.includes('war') || lower.includes('sanction') || lower.includes('geopolit')) return 'Geopolitical';
  return 'Currencies';
}

function inferSentiment(text: string): { sentiment: Sentiment; score: number } {
  const lower = text.toLowerCase();
  const bullish = BULLISH_TERMS.filter(term => lower.includes(term)).length;
  const bearish = BEARISH_TERMS.filter(term => lower.includes(term)).length;
  if (bullish > bearish) return { sentiment: 'bullish', score: Math.min(0.95, 0.6 + bullish * 0.08) };
  if (bearish > bullish) return { sentiment: 'bearish', score: Math.min(0.95, 0.6 + bearish * 0.08) };
  return { sentiment: 'neutral', score: 0.52 };
}

function inferImpact(text: string): Impact {
  const lower = text.toLowerCase();
  const hits = HIGH_IMPACT_TERMS.filter(term => lower.includes(term)).length;
  if (hits >= 2) return 'High';
  if (hits === 1) return 'Medium';
  return 'Low';
}

function pairSentiment(articles: Article[]) {
  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'GBPJPY', 'XAUUSD'];
  const result: Record<string, { sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; score: number; mentions: number }> = {};
  for (const pair of pairs) {
    const matches = articles.filter(article => article.pairs.includes(pair));
    const bull = matches.filter(article => article.sentiment === 'bullish');
    const bear = matches.filter(article => article.sentiment === 'bearish');
    const sentiment = bull.length > bear.length ? 'BULLISH' : bear.length > bull.length ? 'BEARISH' : 'NEUTRAL';
    const scored = sentiment === 'BULLISH' ? bull : sentiment === 'BEARISH' ? bear : matches;
    const score = scored.length ? scored.reduce((sum, article) => sum + article.score, 0) / scored.length : 0.5;
    result[pair] = { sentiment, score, mentions: matches.length };
  }
  return result;
}

function fallbackArticles(): Article[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'fallback-usd-yields',
      title: 'US yields and Federal Reserve expectations remain the main USD driver',
      description: 'Live provider fallback: monitor Treasury yields, inflation releases, and Fed communication for the next directional USD impulse.',
      url: 'https://www.federalreserve.gov/monetarypolicy.htm',
      publishedAt: now,
      source: 'Federal Reserve',
      domain: 'federalreserve.gov',
      sentiment: 'neutral',
      score: 0.55,
      currency: 'USD',
      pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'],
      impact: 'High',
      category: 'Interest Rates',
      confidence: 72,
      analysis: 'USD pairs and XAUUSD should be checked against US10Y direction. Falling yields usually weaken USD and support gold.',
    },
  ];
}

function buildArticle(title: string, description: string, url: string, publishedAt: string, source: string, domain: string, index: number): Article | null {
  const cleanTitle = cleanText(title);
  if (!cleanTitle || !url) return null;
  const combined = `${cleanTitle} ${description} ${domain}`;
  const { currency, pairs } = inferCurrency(combined);
  const { sentiment, score } = inferSentiment(combined);
  const impact = inferImpact(combined);
  const category = inferCategory(combined);
  const iso = (() => {
    const t = Date.parse(publishedAt);
    return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString();
  })();
  return {
    id: `${domain}-${index}-${Date.parse(publishedAt) || Date.now()}`,
    title: cleanTitle,
    description: cleanText(description) || cleanTitle,
    url,
    publishedAt: iso,
    source,
    domain,
    sentiment,
    score,
    currency,
    pairs,
    impact,
    category,
    confidence: Math.round(score * 100),
    analysis: `${currency} impact: ${sentiment} read from live market headlines. Confirm with price action, yields, and COT positioning before entering.`,
  };
}

async function fetchGdelt(limit: number, timespan = '24h'): Promise<Article[]> {
  const query = encodeURIComponent('(forex OR currency OR dollar OR euro OR yen OR sterling OR gold OR "Federal Reserve" OR ECB OR "treasury yields")');
  const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&format=json&maxrecords=${limit}&sort=DateDesc&timespan=${timespan}`;

  const response = await fetch(gdeltUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error(`GDELT ${response.status}`);
  const data = await response.json();
  const seen = new Set<string>();
  const out: Article[] = [];
  for (const raw of (data.articles || [])) {
    const url = String(raw.url || '');
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const pub = raw.seendate ? raw.seendate.replace(/(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z') : '';
    const article = buildArticle(raw.title, raw.title, url, pub, cleanText(raw.domain || 'GDELT'), cleanText(raw.domain || 'gdeltproject.org'), out.length);
    if (article) out.push(article);
  }
  return out;
}

async function fetchRss(feedUrl: string, sourceName: string): Promise<Article[]> {
  const response = await fetch(feedUrl, {
    headers: { 'User-Agent': 'MIAFXLabs/1.0 (+https://miafx-labs.lovable.app)', Accept: 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`${sourceName} ${response.status}`);
  const xml = await response.text();
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  const out: Article[] = [];
  const domain = new URL(feedUrl).hostname.replace(/^www\./, '');
  for (const item of items) {
    const title = (item.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const link = (item.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '';
    const desc = (item.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '';
    const pub = (item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
    const article = buildArticle(title, desc, cleanText(link), pub, sourceName, domain, out.length);
    if (article) out.push(article);
  }
  return out;
}

const RSS_FEEDS: Array<{ url: string; name: string }> = [
  { url: 'https://www.investing.com/rss/news_1.rss', name: 'Investing.com' },
  { url: 'https://www.investing.com/rss/news_285.rss', name: 'Investing.com Forex' },
  { url: 'https://www.investing.com/rss/news_11.rss', name: 'Investing.com Commodities' },
  { url: 'https://www.forexlive.com/feed/news', name: 'ForexLive' },
  { url: 'https://www.fxstreet.com/rss/news', name: 'FXStreet' },
  { url: 'https://feeds.marketwatch.com/marketwatch/marketpulse/', name: 'MarketWatch' },
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', name: 'WSJ Markets' },
];

async function fetchAllSources(limit: number): Promise<Article[]> {
  const jobs: Promise<Article[]>[] = [
    fetchGdelt(limit).catch(() => []),
    ...RSS_FEEDS.map(feed => fetchRss(feed.url, feed.name).catch(() => [])),
  ];
  const results = await Promise.all(jobs);
  const merged: Article[] = [];
  const seen = new Set<string>();
  for (const list of results) {
    for (const article of list) {
      if (seen.has(article.url)) continue;
      seen.add(article.url);
      merged.push(article);
    }
  }
  merged.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return merged.slice(0, limit);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const url = new URL(req.url);
    const rawLimit = Number(url.searchParams.get('limit') || '30');
    const limit = Number.isFinite(rawLimit) ? Math.max(5, Math.min(rawLimit, 50)) : 30;
    let source: 'gdelt_live' | 'fallback' = 'gdelt_live';
    let articles = await fetchAllSources(limit);
    if (articles.length < 3) {
      source = 'fallback';
      articles = fallbackArticles();
    }

    const bullish = articles.filter(article => article.sentiment === 'bullish').length;
    const bearish = articles.filter(article => article.sentiment === 'bearish').length;
    const overall = bullish > bearish ? 'BULLISH' : bearish > bullish ? 'BEARISH' : 'NEUTRAL';
    const score = articles.reduce((sum, article) => sum + article.score, 0) / Math.max(articles.length, 1);
    const majorPairs = pairSentiment(articles);
    const highImpact = articles.filter(article => article.impact === 'High').length;

    // Longer-horizon sentiment trend (30 & 90 day GDELT windows)
    const summarize = (list: Article[]) => {
      const b = list.filter(a => a.sentiment === 'bullish').length;
      const s = list.filter(a => a.sentiment === 'bearish').length;
      return {
        articles: list.length,
        bullish: b,
        bearish: s,
        neutral: list.length - b - s,
        sentiment: b > s ? 'BULLISH' : s > b ? 'BEARISH' : 'NEUTRAL',
        score: list.reduce((sum, a) => sum + a.score, 0) / Math.max(list.length, 1),
      };
    };
    const [d30, d90] = await Promise.all([
      fetchGdelt(50, '30d').catch(() => [] as Article[]),
      fetchGdelt(50, '90d').catch(() => [] as Article[]),
    ]);

    return new Response(JSON.stringify({
      articles,
      source,
      fetchedAt: new Date().toISOString(),
      nextRefreshArizona: ['2:00 PM Arizona', '3:00 PM Arizona'],
      overall,
      score,
      majorPairs,
      trend: { last30Days: summarize(d30), last90Days: summarize(d90) },
      summary: `${articles.length} live market headlines aggregated from GDELT, Investing.com, ForexLive, FXStreet, MarketWatch, and WSJ. ${highImpact} high-impact items across USD pairs, central banks, yields, and gold.`,

    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' } });
  } catch (error) {
    const articles = fallbackArticles();
    return new Response(JSON.stringify({
      articles,
      source: 'fallback',
      fetchedAt: new Date().toISOString(),
      nextRefreshArizona: ['2:00 PM Arizona', '3:00 PM Arizona'],
      overall: 'NEUTRAL',
      score: 0.55,
      majorPairs: pairSentiment(articles),
      summary: 'Live market news provider is temporarily unavailable. Showing verified fallback context until the next refresh.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
