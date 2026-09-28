import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { latestReportDate, useLatestCOT } from "@/hooks/useLatestCOT";

// ── Types ───────────────────────────────────────────────────────────────────
interface CurrencyData {
  netPosition: number;
  long: number;
  short: number;
  weeklyChange: number;
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

    // Weekly change differential
    const weeklyDiff = currData.weeklyChange - otherData.weeklyChange;

    // Composite pair score (normalized)
    const pairScore = (netDiff / 100000) * 70 + (weeklyDiff / 20000) * 30;
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
  const [cotData, setCotData] = useState<Record<string, CurrencyData>>({});
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [expandedCurrency, setExpandedCurrency] = useState<string | null>(null);
  const { data: latestCot, refetch } = useLatestCOT();

  // Fetch live COT data from CFTC edge function
  const fetchCOTData = async () => {
    setLoading(true);
    try {
      await refetch();
      setLastFetched(new Date().toISOString());
    } catch (e) {
      console.error('Failed to fetch CFTC COT data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCOTData();
  }, []);

  useEffect(() => {
    if (!latestCot) return;
    const mapped: Record<string, CurrencyData> = {};
    for (const [code, row] of Object.entries(latestCot)) {
      mapped[code] = { netPosition: row.net, long: row.long, short: row.short, weeklyChange: row.weekly, reportDate: row.reportDate, source: row.source };
    }
    setCotData(mapped);
  }, [latestCot]);

  // Rank currencies
  const ranked: RankedCurrency[] = useMemo(() => {
    const items = G10_CURRENCIES.filter(code => cotData[code]).map(code => {
      const { score, pctChange, pairs } = computeStrength(code, cotData, timeframe);
      return {
        code,
        name: CURRENCY_META[code].name,
        flag: CURRENCY_META[code].flag,
        score,
        pctChange,
        pairs,
        rank: 0,
        data: cotData[code],
      };
    });
    items.sort((a, b) => b.score - a.score);
    items.forEach((item, i) => { item.rank = i + 1; });
    return items;
  }, [cotData, timeframe]);

  const maxAbsScore = Math.max(...ranked.map(r => Math.abs(r.score)), 1);

  const reportDate = latestReportDate(latestCot) || '—';

  return (
    <div className="hq-panel p-5 sm:p-6">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe('weekly')}
              className={`rounded-sm px-3 text-xs ${timeframe === 'weekly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              1 Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe('30day')}
              className={`rounded-sm px-3 text-xs ${timeframe === '30day' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              30 Day
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCOTData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Source + Date */}
      <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
        <span>Data as of {reportDate}</span>
        <Badge variant="outline" className="text-[10px] border-border/30">
          Stored CFTC positioning
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
                    {G10_CURRENCIES.filter(c => c !== item.code && cotData[c]).map(other => {
                      const currD = item.data;
                      const otherD = cotData[other];
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
