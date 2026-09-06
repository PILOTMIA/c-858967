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
  USD: { netPosition: 7133, long: 16024, short: 8891, weeklyChange: -2056, dealerLong: 5796, dealerShort: 32811, assetManagerLong: 17667, assetManagerShort: 1426, reportDate: "2026-09-01" },
  EUR: { netPosition: -38173, long: 96137, short: 134310, weeklyChange: 186, dealerLong: 54643, dealerShort: 322221, assetManagerLong: 468254, assetManagerShort: 205001, reportDate: "2026-09-01" },
  JPY: { netPosition: -102188, long: 58529, short: 160717, weeklyChange: -25146, dealerLong: 116682, dealerShort: 37361, assetManagerLong: 70419, assetManagerShort: 94940, reportDate: "2026-09-01" },
  GBP: { netPosition: 43167, long: 77117, short: 33950, weeklyChange: -4742, dealerLong: 133142, dealerShort: 73939, assetManagerLong: 43569, assetManagerShort: 150902, reportDate: "2026-09-01" },
  AUD: { netPosition: 49662, long: 78498, short: 28836, weeklyChange: -4399, dealerLong: 104022, dealerShort: 147478, assetManagerLong: 108835, assetManagerShort: 139302, reportDate: "2026-09-01" },
  CHF: { netPosition: -10298, long: 12305, short: 22603, weeklyChange: -1473, dealerLong: 64678, dealerShort: 8935, assetManagerLong: 12689, assetManagerShort: 44806, reportDate: "2026-09-01" },
  CAD: { netPosition: -68750, long: 27845, short: 96595, weeklyChange: 3342, dealerLong: 180223, dealerShort: 62264, assetManagerLong: 59172, assetManagerShort: 108716, reportDate: "2026-09-01" },
  NZD: { netPosition: -22338, long: 5216, short: 27554, weeklyChange: 9656, dealerLong: 54532, dealerShort: 36175, assetManagerLong: 12931, assetManagerShort: 9972, reportDate: "2026-09-01" },
  MXN: { netPosition: 74362, long: 140084, short: 65722, weeklyChange: 5458, dealerLong: 22083, dealerShort: 146774, assetManagerLong: 117879, assetManagerShort: 49802, reportDate: "2026-09-01" },
};

const G10_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CHF', 'CAD', 'NZD', 'MXN'];

// Fallback COT positions (CFTC TFF report, September 1, 2026 — Leveraged Funds)
const FALLBACK_COT: Record<string, CurrencyData> = {
  EUR: { netPosition: -38359, long: 90921, short: 129280, weeklyChange: 19357, dealerLong: 52864, dealerShort: 321445, assetManagerLong: 461805, assetManagerShort: 200379, reportDate: "2026-08-25" },
  GBP: { netPosition: 47909, long: 81286, short: 33377, weeklyChange: 5032, dealerLong: 135405, dealerShort: 87000, assetManagerLong: 45799, assetManagerShort: 150290, reportDate: "2026-08-25" },
  JPY: { netPosition: -77042, long: 66528, short: 143570, weeklyChange: -9071, dealerLong: 99992, dealerShort: 57054, assetManagerLong: 71421, assetManagerShort: 91537, reportDate: "2026-08-25" },
  CHF: { netPosition: -8825, long: 12353, short: 21178, weeklyChange: 246, dealerLong: 57751, dealerShort: 9050, assetManagerLong: 12676, assetManagerShort: 41331, reportDate: "2026-08-25" },
  AUD: { netPosition: 54061, long: 81344, short: 27283, weeklyChange: 1953, dealerLong: 101536, dealerShort: 139579, assetManagerLong: 97445, assetManagerShort: 142872, reportDate: "2026-08-25" },
  CAD: { netPosition: -72092, long: 27384, short: 99476, weeklyChange: 16805, dealerLong: 183841, dealerShort: 58911, assetManagerLong: 55489, assetManagerShort: 114432, reportDate: "2026-08-25" },
  NZD: { netPosition: -31994, long: 3673, short: 35667, weeklyChange: -5188, dealerLong: 64953, dealerShort: 34214, assetManagerLong: 12235, assetManagerShort: 11805, reportDate: "2026-08-25" },
  MXN: { netPosition: 68904, long: 131529, short: 62625, weeklyChange: 3574, dealerLong: 19497, dealerShort: 139574, assetManagerLong: 115633, assetManagerShort: 47043, reportDate: "2026-08-25" },
  USD: { netPosition: 9189, long: 16343, short: 7154, weeklyChange: 1077, dealerLong: 6047, dealerShort: 33200, assetManagerLong: 15863, assetManagerShort: 1845, reportDate: "2026-08-25" },
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
