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
  USD: { terms: ['fed', 'federal reserve', 'powell', 'dollar', 'treasury', 'us yields', 'nfp', 'jobs report', 'cpi'], pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD'] },
  EUR: { terms: ['ecb', 'lagarde', 'eurozone', 'euro'], pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
  GBP: { terms: ['boe', 'bank of england', 'sterling', 'pound', 'uk inflation'], pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
  JPY: { terms: ['boj', 'bank of japan', 'yen', 'ueda', 'japan wages'], pairs: ['USDJPY', 'EURJPY', 'GBPJPY'] },
  CAD: { terms: ['bank of canada', 'boc', 'canadian dollar', 'canada inflation'], pairs: ['USDCAD', 'CADJPY'] },
  AUD: { terms: ['rba', 'australian dollar', 'australia jobs', 'china demand'], pairs: ['AUDUSD', 'AUDJPY'] },
  NZD: { terms: ['rbnz', 'new zealand dollar', 'kiwi'], pairs: ['NZDUSD', 'NZDJPY'] },
  CHF: { terms: ['snb', 'swiss franc', 'switzerland inflation'], pairs: ['USDCHF', 'EURCHF'] },
  XAU: { terms: ['gold', 'bullion', 'xau', 'precious metals'], pairs: ['XAUUSD'] },
};

const BULLISH_TERMS = ['rise', 'rises', 'rally', 'jumps', 'gains', 'hawkish', 'higher yields', 'strong jobs', 'inflation hot', 'safe haven', 'beats', 'strengthens'];
const BEARISH_TERMS = ['falls', 'drops', 'slides', 'cuts', 'dovish', 'weak', 'misses', 'slowdown', 'recession', 'lower yields', 'easing', 'risk-off'];
const HIGH_IMPACT_TERMS = ['fed', 'ecb', 'boe', 'boj', 'cpi', 'inflation', 'jobs', 'payrolls', 'rates', 'treasury', 'gold'];

function cleanText(value: unknown): string {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function inferCurrency(text: string): { currency: string; pairs: string[] } {
  const lower = text.toLowerCase();
  const match = Object.entries(CURRENCY_RULES).find(([, rule]) => rule.terms.some(term => lower.includes(term)));
  if (!match) return { currency: 'USD', pairs: ['EURUSD', 'GBPUSD', 'USDJPY'] };
  return { currency: match[0], pairs: match[1].pairs };
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('gold') || lower.includes('bullion')) return 'Commodities';
  if (lower.includes('jobs') || lower.includes('payroll') || lower.includes('employment')) return 'Employment';
  if (lower.includes('inflation') || lower.includes('cpi') || lower.includes('pce')) return 'Inflation';
  if (lower.includes('rate') || lower.includes('yield') || lower.includes('treasury')) return 'Interest Rates';
  if (lower.includes('fed') || lower.includes('ecb') || lower.includes('boe') || lower.includes('boj') || lower.includes('central bank')) return 'Central Bank';
  if (lower.includes('tariff') || lower.includes('war') || lower.includes('risk')) return 'Geopolitical';
  return 'Currencies';
}

function inferSentiment(text: string): { sentiment: Sentiment; score: number } {
  const lower = text.toLowerCase();
  const bullish = BULLISH_TERMS.filter(term => lower.includes(term)).length;
  const bearish = BEARISH_TERMS.filter(term => lower.includes(term)).length;
  if (bullish > bearish) return { sentiment: 'bullish', score: Math.min(0.9, 0.58 + bullish * 0.08) };
  if (bearish > bullish) return { sentiment: 'bearish', score: Math.min(0.9, 0.58 + bearish * 0.08) };
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

async function fetchGdelt(limit: number): Promise<Article[]> {
  const query = encodeURIComponent('(forex OR currency OR dollar OR euro OR yen OR sterling OR gold OR Federal Reserve OR ECB OR BOE OR BOJ OR treasury yields)');
  const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&format=json&maxrecords=${limit}&sort=HybridRel&timespan=48h`;
  const response = await fetch(gdeltUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`GDELT failed: ${response.status}`);
  const data = await response.json();
  const seen = new Set<string>();
  return (data.articles || [])
    .map((raw: any, index: number): Article | null => {
      const title = cleanText(raw.title);
      const url = String(raw.url || '');
      if (!title || !url || seen.has(url)) return null;
      seen.add(url);
      const description = cleanText(raw.seendate ? `${title}` : raw.socialimage || title);
      const combined = `${title} ${description} ${raw.domain || ''}`;
      const { currency, pairs } = inferCurrency(combined);
      const { sentiment, score } = inferSentiment(combined);
      const impact = inferImpact(combined);
      const category = inferCategory(combined);
      return {
        id: `${raw.domain || 'gdelt'}-${index}-${Date.parse(raw.seendate || '') || Date.now()}`,
        title,
        description,
        url,
        publishedAt: raw.seendate ? new Date(raw.seendate.replace(/(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
        source: cleanText(raw.sourceCountry || raw.domain || 'GDELT'),
        domain: cleanText(raw.domain || 'gdeltproject.org'),
        sentiment,
        score,
        currency,
        pairs,
        impact,
        category,
        confidence: Math.round(score * 100),
        analysis: `${currency} impact: ${sentiment} read from live market headlines. Confirm with price action, yields, and COT positioning before entering.`,
      };
    })
    .filter(Boolean)
    .slice(0, limit) as Article[];
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
    let articles = await fetchGdelt(limit);
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

    return new Response(JSON.stringify({
      articles,
      source,
      fetchedAt: new Date().toISOString(),
      nextRefreshArizona: ['2:00 PM Arizona', '3:00 PM Arizona'],
      overall,
      score,
      majorPairs,
      summary: `${articles.length} live market headlines scanned from GDELT. ${highImpact} high-impact items detected across USD pairs, central banks, yields, and gold.`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900' } });
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
