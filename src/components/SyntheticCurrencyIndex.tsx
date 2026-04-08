import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, ChevronDown } from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────
interface CurrencyData {
  netPosition: number;
  long: number;
  short: number;
  weeklyChange: number;
  dealerLong: number;
  dealerShort: number;
  assetManagerLong: number;
  assetManagerShort: number;
  reportDate: string;
  source?: string;
}

interface RankedCurrency {
  code: string;
  name: string;
  flag: string;
  score: number;
  pctChange: number;
  pairs: number;
  rank: number;
  data: CurrencyData;
}

// ── Constants ───────────────────────────────────────────────────────────────
const CURRENCY_META: Record<string, { name: string; flag: string }> = {
  USD: { name: "US Dollar", flag: "US" },
  EUR: { name: "Euro", flag: "EU" },
  JPY: { name: "Japanese Yen", flag: "JP" },
  GBP: { name: "British Pound", flag: "GB" },
  AUD: { name: "Australian Dollar", flag: "AU" },
  CHF: { name: "Swiss Franc", flag: "CH" },
  CAD: { name: "Canadian Dollar", flag: "CA" },
  NZD: { name: "New Zealand Dollar", flag: "NZ" },
  MXN: { name: "Mexican Peso", flag: "MX" },
};

const G10_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CHF', 'CAD', 'NZD', 'MXN'];

// Fallback COT positions (CFTC Mar 29 2026)
const FALLBACK_COT: Record<string, CurrencyData> = {
  EUR: { netPosition: -13538, long: 97985, short: 111523, weeklyChange: -6586, dealerLong: 39995, dealerShort: 357133, assetManagerLong: 446373, assetManagerShort: 158433, reportDate: "2026-03-24" },
  GBP: { netPosition: 15716, long: 47450, short: 31734, weeklyChange: 3948, dealerLong: 128153, dealerShort: 46144, assetManagerLong: 28499, assetManagerShort: 122962, reportDate: "2026-03-24" },
  JPY: { netPosition: -54852, long: 67921, short: 122773, weeklyChange: 10577, dealerLong: 60117, dealerShort: 42836, assetManagerLong: 58266, assetManagerShort: 64516, reportDate: "2026-03-24" },
  CHF: { netPosition: 235, long: 7950, short: 7715, weeklyChange: -278, dealerLong: 47188, dealerShort: 6284, assetManagerLong: 5541, assetManagerShort: 42537, reportDate: "2026-03-24" },
  AUD: { netPosition: 49145, long: 68577, short: 19432, weeklyChange: 3786, dealerLong: 32930, dealerShort: 152299, assetManagerLong: 103155, assetManagerShort: 59229, reportDate: "2026-03-24" },
  CAD: { netPosition: -31700, long: 26751, short: 58451, weeklyChange: 6152, dealerLong: 30119, dealerShort: 37684, assetManagerLong: 67647, assetManagerShort: 41518, reportDate: "2026-03-24" },
  NZD: { netPosition: -16730, long: 7461, short: 24191, weeklyChange: -813, dealerLong: 43769, dealerShort: 4053, assetManagerLong: 6572, assetManagerShort: 31584, reportDate: "2026-03-24" },
  MXN: { netPosition: 54787, long: 75059, short: 20272, weeklyChange: 7841, dealerLong: 8722, dealerShort: 44498, assetManagerLong: 72526, assetManagerShort: 23942, reportDate: "2026-03-24" },
  USD: { netPosition: 0, long: 0, short: 0, weeklyChange: 0, dealerLong: 0, dealerShort: 0, assetManagerLong: 0, assetManagerShort: 0, reportDate: "2026-03-24" },
};

// ── Scoring logic ───────────────────────────────────────────────────────────
function computeStrength(
  currency: string,
  allData: Record<string, CurrencyData>,
  mode: 'weekly' | '30day'
): { score: number; pctChange: number; pairs: number } {
  const others = G10_CURRENCIES.filter(c => c !== currency);
  let totalScore = 0;
  let pairCount = 0;

  const currData = allData[currency];
  if (!currData) return { score: 0, pctChange: 0, pairs: 0 };

  for (const other of others) {
    const otherData = allData[other];
    if (!otherData) continue;
    pairCount++;

    // COT net position differential
    const netDiff = currData.netPosition - otherData.netPosition;

    // Asset manager differential
    const amDiff = (currData.assetManagerLong - currData.assetManagerShort) - (otherData.assetManagerLong - otherData.assetManagerShort);

    // Weekly change differential
    const weeklyDiff = currData.weeklyChange - otherData.weeklyChange;

    // Composite pair score (normalized)
    const pairScore = (netDiff / 100000) * 50 + (amDiff / 300000) * 30 + (weeklyDiff / 20000) * 20;
    totalScore += pairScore;
  }

  const avgScore = pairCount > 0 ? totalScore / pairCount : 0;

  // Calculate % change based on weekly positioning change relative to total open interest
  const totalOI = currData.long + currData.short || 1;
  const pctChange = mode === 'weekly'
    ? (currData.weeklyChange / totalOI) * 100
    : (currData.weeklyChange / totalOI) * 100 * 4.3; // rough 30-day estimate

  return { score: avgScore, pctChange, pairs: pairCount };
}

// ── Component ───────────────────────────────────────────────────────────────
const SyntheticCurrencyIndex = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | '30day'>('30day');
  const [cotData, setCotData] = useState<Record<string, CurrencyData>>(FALLBACK_COT);
  const [dataSource, setDataSource] = useState<string>('fallback');
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [expandedCurrency, setExpandedCurrency] = useState<string | null>(null);

  // Fetch live COT data from CFTC edge function
  const fetchCOTData = async () => {
    setLoading(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xkgsugennbdatwmetnxx';
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/cftc-cot?currencies=${G10_CURRENCIES.filter(c => c !== 'USD').join(',')}`,
        {
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(20000),
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCotData(prev => ({ ...prev, ...json.data }));
          const firstKey = Object.keys(json.data)[0];
          setDataSource(json.data[firstKey]?.source || 'fallback');
          setLastFetched(json.fetchedAt || new Date().toISOString());
        }
      }
    } catch (e) {
      console.error('Failed to fetch CFTC COT data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCOTData();
  }, []);

  // Rank currencies
  const ranked: RankedCurrency[] = useMemo(() => {
    const items = G10_CURRENCIES.map(code => {
      const { score, pctChange, pairs } = computeStrength(code, cotData, timeframe);
      return {
        code,
        name: CURRENCY_META[code].name,
        flag: CURRENCY_META[code].flag,
        score,
        pctChange,
        pairs,
        rank: 0,
        data: cotData[code] || FALLBACK_COT[code],
      };
    });
    items.sort((a, b) => b.score - a.score);
    items.forEach((item, i) => { item.rank = i + 1; });
    return items;
  }, [cotData, timeframe]);

  const maxAbsScore = Math.max(...ranked.map(r => Math.abs(r.score)), 1);

  const reportDate = cotData.EUR?.reportDate || '—';

  return (
    <div className="rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-display-hero text-xl sm:text-2xl font-bold text-foreground">Synthetic Currency Indexes</h2>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            G10 currencies ranked strongest to weakest based on COT cross-pair performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border/30 overflow-hidden">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${timeframe === 'weekly' ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-muted-foreground hover:text-foreground'}`}
            >
              1 Week
            </button>
            <button
              onClick={() => setTimeframe('30day')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${timeframe === '30day' ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-muted-foreground hover:text-foreground'}`}
            >
              30 Day
            </button>
          </div>
          <button
            onClick={fetchCOTData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Source + Date */}
      <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
        <span>Data as of {reportDate}</span>
        <Badge variant="outline" className="text-[10px] border-border/30">
          {dataSource === 'cftc_live' ? '🟢 CFTC Live' : '⚪ Cached'}
        </Badge>
      </div>

      {/* Currency Ranking List */}
      <div className="space-y-2">
        {ranked.map((item) => {
          const barWidth = (Math.abs(item.score) / maxAbsScore) * 100;
          const isPositive = item.score >= 0;
          const isExpanded = expandedCurrency === item.code;

          return (
            <div key={item.code}>
              <button
                onClick={() => setExpandedCurrency(isExpanded ? null : item.code)}
                className="w-full rounded-xl border border-border/20 bg-card/30 hover:bg-card/50 transition-all p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <span className="text-sm font-mono text-muted-foreground w-6 text-right">#{item.rank}</span>

                  {/* Flag + Name */}
                  <div className="flex items-center gap-3 w-28 sm:w-40">
                    <span className="text-lg font-bold text-foreground">{item.code}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline truncate">{item.name}</span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 h-6 relative">
                    <div className="absolute inset-0 bg-muted/10 rounded" />
                    <div
                      className={`absolute top-0 h-full rounded transition-all duration-500 ${isPositive ? 'bg-success/60 left-0' : 'bg-destructive/60 right-0'}`}
                      style={{ width: `${Math.max(barWidth, 2)}%` }}
                    />
                  </div>

                  {/* % Change */}
                  <div className={`flex items-center gap-1 w-24 justify-end ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span className="text-sm font-mono font-bold">
                      {isPositive ? '+' : ''}{item.pctChange.toFixed(3)}%
                    </span>
                  </div>

                  {/* Pairs count */}
                  <span className="text-xs text-muted-foreground w-14 text-right hidden sm:block">{item.pairs} pairs</span>

                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expanded Pair Breakdown */}
              {isExpanded && (
                <div className="ml-10 mt-1 mb-2 rounded-xl border border-border/15 bg-card/20 p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pair Breakdown — {item.code}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {G10_CURRENCIES.filter(c => c !== item.code).map(other => {
                      const currD = item.data;
                      const otherD = cotData[other] || FALLBACK_COT[other];
                      const netDiff = currD.netPosition - otherD.netPosition;
                      const isPos = netDiff >= 0;
                      const pairLabel = `${item.code}/${other}`;

                      return (
                        <div key={other} className="flex items-center justify-between rounded-lg bg-muted/5 px-3 py-2 border border-border/10">
                          <span className="text-sm font-medium text-foreground">{pairLabel}</span>
                          <span className={`text-xs font-mono font-bold ${isPos ? 'text-success' : 'text-destructive'}`}>
                            {isPos ? '+' : ''}{(netDiff / 1000).toFixed(1)}K
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-muted/5 rounded-lg p-2 border border-border/10">
                      <div className="text-muted-foreground">Net Position</div>
                      <div className={`font-mono font-bold ${item.data.netPosition >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.data.netPosition.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-muted/5 rounded-lg p-2 border border-border/10">
                      <div className="text-muted-foreground">Weekly Δ</div>
                      <div className={`font-mono font-bold ${item.data.weeklyChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.data.weeklyChange >= 0 ? '+' : ''}{item.data.weeklyChange.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-muted/5 rounded-lg p-2 border border-border/10">
                      <div className="text-muted-foreground">AM Net</div>
                      <div className={`font-mono font-bold ${(item.data.assetManagerLong - item.data.assetManagerShort) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(item.data.assetManagerLong - item.data.assetManagerShort).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-muted/5 rounded-lg p-2 border border-border/10">
                      <div className="text-muted-foreground">Dealer Net</div>
                      <div className={`font-mono font-bold ${(item.data.dealerLong - item.data.dealerShort) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {(item.data.dealerLong - item.data.dealerShort).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SyntheticCurrencyIndex;
