import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Activity, Globe, Landmark, Users, DollarSign, RefreshCw } from "lucide-react";
import { fetchForexPrice } from "@/services/ForexPriceService";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

// ── COT Positions (CFTC Mar 29, 2026) ──────────────────────────────────────
interface CurrencyPositioning {
  netPosition: number;
  long: number;
  short: number;
  sentiment: string;
  weeklyChange: number;
  dealerLong: number;
  dealerShort: number;
  assetManagerLong: number;
  assetManagerShort: number;
}

const FALLBACK_COT_POSITIONS: Record<string, CurrencyPositioning> = {
  EUR: { netPosition: 3947, long: 106291, short: 102344, sentiment: 'NEUTRAL', weeklyChange: 17485, dealerLong: 48543, dealerShort: 357954, assetManagerLong: 431246, assetManagerShort: 166829 },
  GBP: { netPosition: 29932, long: 58402, short: 28470, sentiment: 'BULLISH', weeklyChange: 14216, dealerLong: 132294, dealerShort: 51454, assetManagerLong: 23458, assetManagerShort: 124990 },
  JPY: { netPosition: -46182, long: 77232, short: 123414, sentiment: 'BEARISH', weeklyChange: 8670, dealerLong: 65995, dealerShort: 52624, assetManagerLong: 63211, assetManagerShort: 66856 },
  CHF: { netPosition: 1490, long: 10695, short: 9205, sentiment: 'NEUTRAL', weeklyChange: 1255, dealerLong: 48430, dealerShort: 4780, assetManagerLong: 5758, assetManagerShort: 45566 },
  AUD: { netPosition: 52569, long: 76188, short: 23619, sentiment: 'BULLISH', weeklyChange: 3424, dealerLong: 30591, dealerShort: 158593, assetManagerLong: 103136, assetManagerShort: 58503 },
  CAD: { netPosition: -42910, long: 28325, short: 71235, sentiment: 'BEARISH', weeklyChange: -11210, dealerLong: 64103, dealerShort: 36157, assetManagerLong: 64749, assetManagerShort: 60401 },
  MXN: { netPosition: 52803, long: 76213, short: 23410, sentiment: 'BULLISH', weeklyChange: -1984, dealerLong: 24594, dealerShort: 41544, assetManagerLong: 73258, assetManagerShort: 39368 },
  NZD: { netPosition: -17798, long: 5752, short: 23550, sentiment: 'BEARISH', weeklyChange: -1068, dealerLong: 50305, dealerShort: 6700, assetManagerLong: 6601, assetManagerShort: 34236 },
  USD: { netPosition: 0, long: 0, short: 0, sentiment: 'NEUTRAL', weeklyChange: 0, dealerLong: 0, dealerShort: 0, assetManagerLong: 0, assetManagerShort: 0 },
};

// ── Fallback Macro Fundamentals ──────────────────────────────────────────────
const FALLBACK_FUNDAMENTALS: Record<string, { gdp: number; cpi: number; unemployment: number; interestRate: number }> = {
  USD: { gdp: 2.4, cpi: 2.8, unemployment: 4.1, interestRate: 4.50 },
  EUR: { gdp: 0.9, cpi: 2.4, unemployment: 6.4, interestRate: 3.65 },
  GBP: { gdp: 1.1, cpi: 2.8, unemployment: 4.4, interestRate: 4.50 },
  JPY: { gdp: 1.2, cpi: 3.2, unemployment: 2.5, interestRate: 0.50 },
  CHF: { gdp: 1.5, cpi: 1.1, unemployment: 2.3, interestRate: 1.50 },
  AUD: { gdp: 2.6, cpi: 3.7, unemployment: 4.1, interestRate: 4.10 },
  CAD: { gdp: 1.8, cpi: 2.7, unemployment: 6.7, interestRate: 2.75 },
  NZD: { gdp: 1.5, cpi: 3.1, unemployment: 5.4, interestRate: 2.25 },
  MXN: { gdp: 3.1, cpi: 4.2, unemployment: 2.8, interestRate: 9.50 },
};

// ── Seasonality (10-year historical monthly tendency) ──
const SEASONALITY: Record<string, number[]> = {
  EUR: [0.3, -0.5, -1.2, 0.8, 1.1, -0.3, -0.7, 0.2, 0.6, -0.4, 0.9, -0.5],
  GBP: [0.5, -0.3, -0.8, 0.6, 0.9, -0.1, -0.5, 0.3, 0.4, -0.6, 0.7, -0.2],
  JPY: [-0.8, 0.6, 1.2, -0.5, -0.9, 0.7, 1.0, -0.3, -0.6, 0.8, -0.4, 0.5],
  CHF: [0.2, -0.4, -0.6, 0.3, 0.5, -0.2, -0.3, 0.1, 0.4, -0.3, 0.6, -0.1],
  AUD: [0.7, -0.2, -0.9, 1.0, 1.3, -0.4, -0.8, 0.5, 0.8, -0.3, 0.6, -0.4],
  CAD: [0.4, -0.6, -0.7, 0.5, 0.8, -0.3, -0.4, 0.2, 0.5, -0.5, 0.3, -0.2],
  NZD: [0.6, -0.3, -1.0, 0.9, 1.1, -0.5, -0.6, 0.4, 0.7, -0.2, 0.5, -0.3],
  MXN: [0.3, -0.7, -0.5, 0.4, 0.6, -0.1, -0.9, 0.3, 0.2, -0.4, 0.8, -0.6],
  USD: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'MXN'];

// ── Scoring Engine ──────────────────────────────────────────────────────────
function computeScores(base: string, quote: string, fundamentals: Record<string, typeof FALLBACK_FUNDAMENTALS['USD']>, cotPositions: Record<string, CurrencyPositioning>) {
  const bp = cotPositions[base] || FALLBACK_COT_POSITIONS[base];
  const qp = cotPositions[quote] || FALLBACK_COT_POSITIONS[quote];
  const bf = fundamentals[base] || FALLBACK_FUNDAMENTALS[base];
  const qf = fundamentals[quote] || FALLBACK_FUNDAMENTALS[quote];
  const bSeas = SEASONALITY[base];
  const qSeas = SEASONALITY[quote];
  const month = new Date().getMonth();

  const maxNet = 100000;
  const cotRaw = ((bp.netPosition - qp.netPosition) / maxNet) * 3;
  const cotScore = Math.max(-3, Math.min(3, parseFloat(cotRaw.toFixed(2))));

  const seasRaw = (bSeas[month] - qSeas[month]);
  const seasScore = Math.max(-2, Math.min(2, parseFloat(seasRaw.toFixed(2))));

  const trendRaw = ((bp.weeklyChange - qp.weeklyChange) / 15000) * 2;
  const trendScore = Math.max(-2, Math.min(2, parseFloat(trendRaw.toFixed(2))));

  const baseAMNet = bp.assetManagerLong - bp.assetManagerShort;
  const quoteAMNet = qp.assetManagerLong - qp.assetManagerShort;
  const momRaw = ((baseAMNet - quoteAMNet) / 300000) * 2;
  const momentumScore = Math.max(-2, Math.min(2, parseFloat(momRaw.toFixed(2))));

  const gdpDiff = bf.gdp - qf.gdp;
  const rateDiff = bf.interestRate - qf.interestRate;
  const econRaw = (gdpDiff * 0.3 + rateDiff * 0.15);
  const economicScore = Math.max(-2, Math.min(2, parseFloat(econRaw.toFixed(2))));

  const totalScore = parseFloat((cotScore + seasScore + trendScore + momentumScore + economicScore).toFixed(2));

  return { cotScore, seasScore, trendScore, momentumScore, economicScore, totalScore };
}

function getVerdict(score: number): { label: string; color: string; bgClass: string } {
  if (score >= 5) return { label: 'Strong Bullish', color: 'text-success', bgClass: 'bg-success/15 border-success/30' };
  if (score >= 2) return { label: 'Bullish', color: 'text-success', bgClass: 'bg-success/10 border-success/20' };
  if (score >= 0.5) return { label: 'Slightly Bullish', color: 'text-chart-1', bgClass: 'bg-chart-1/10 border-chart-1/20' };
  if (score > -0.5) return { label: 'Neutral', color: 'text-muted-foreground', bgClass: 'bg-muted/10 border-muted/30' };
  if (score > -2) return { label: 'Slightly Bearish', color: 'text-warning', bgClass: 'bg-warning/10 border-warning/20' };
  if (score > -5) return { label: 'Bearish', color: 'text-destructive', bgClass: 'bg-destructive/10 border-destructive/20' };
  return { label: 'Strong Bearish', color: 'text-destructive', bgClass: 'bg-destructive/15 border-destructive/30' };
}

// ── TradingView Symbol Mapper ───────────────────────────────────────────────
function getTradingViewSymbol(base: string, quote: string): string {
  if (base === 'USD') return `FX:USD${quote}`;
  if (quote === 'USD') return `FX:${base}USD`;
  return `FX:${base}${quote}`;
}

// ── Correct forex pair code for price fetching ──────────────────────────────
function getPricePairKey(base: string, quote: string): string {
  const pair = `${base}${quote}`;
  // Known cross pairs supported by ForexPriceService
  const crossPairs = ['EURJPY', 'GBPJPY', 'EURGBP', 'GBPCAD', 'AUDJPY', 'EURAUD', 'GBPAUD', 'EURCAD', 'NZDJPY', 'CADJPY'];
  if (crossPairs.includes(pair)) return pair;
  // USD pairs — ForexPriceService expects the non-USD currency
  if (base === 'USD') return quote;
  if (quote === 'USD') return base;
  // For cross pairs not in the list, use the pair directly and hope fallback works
  return pair;
}

// ── TradingView Embed Component ─────────────────────────────────────────────
const TradingViewEmbed = ({ base, quote }: { base: string; quote: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = `tv_chart_${base}${quote}`;

  useEffect(() => {
    if (!containerRef.current) return;
    // Clear old widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: getTradingViewSymbol(base, quote),
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      gridColor: 'rgba(255, 255, 255, 0.03)',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host: 'https://www.tradingview.com',
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';

    const innerDiv = document.createElement('div');
    innerDiv.className = 'tradingview-widget-container__widget';
    innerDiv.style.height = '100%';
    innerDiv.style.width = '100%';

    wrapper.appendChild(innerDiv);
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [base, quote]);

  return <div ref={containerRef} id={widgetId} className="h-full w-full" />;
};

// ── Component ───────────────────────────────────────────────────────────────
const COTPairScorecard = () => {
  const [baseCurrency, setBaseCurrency] = useState('AUD');
  const [quoteCurrency, setQuoteCurrency] = useState('NZD');
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [fundamentals, setFundamentals] = useState<Record<string, typeof FALLBACK_FUNDAMENTALS['USD']>>(FALLBACK_FUNDAMENTALS);
  const [fundSource, setFundSource] = useState<string>('fallback');
  const [fundLoading, setFundLoading] = useState(false);
  const [cotPositions, setCotPositions] = useState<Record<string, CurrencyPositioning>>(FALLBACK_COT_POSITIONS);
  const [cotSource, setCotSource] = useState<string>('fallback');

  // Fetch live COT data from CFTC edge function
  useEffect(() => {
    const fetchCOT = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xkgsugennbdatwmetnxx';
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/cftc-cot?currencies=${CURRENCIES.filter(c => c !== 'USD').join(',')}`,
          {
            headers: { 'Authorization': `Bearer ${anonKey}`, 'apikey': anonKey, 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(20000),
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const merged: Record<string, CurrencyPositioning> = { ...FALLBACK_COT_POSITIONS };
            for (const [key, val] of Object.entries(json.data as Record<string, any>)) {
              merged[key] = {
                netPosition: val.netPosition, long: val.long, short: val.short,
                sentiment: val.netPosition > 10000 ? 'BULLISH' : val.netPosition < -10000 ? 'BEARISH' : 'NEUTRAL',
                weeklyChange: val.weeklyChange, dealerLong: val.dealerLong, dealerShort: val.dealerShort,
                assetManagerLong: val.assetManagerLong, assetManagerShort: val.assetManagerShort,
              };
            }
            setCotPositions(merged);
            const firstKey = Object.keys(json.data)[0];
            setCotSource(json.data[firstKey]?.source || 'fallback');
          }
        }
      } catch (e) {
        console.error('Failed to fetch CFTC COT:', e);
      }
    };
    fetchCOT();
  }, []);

  const pair = `${baseCurrency}${quoteCurrency}`;

  // Fetch live fundamentals from FRED edge function
  useEffect(() => {
    const fetchMacroData = async () => {
      setFundLoading(true);
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xkgsugennbdatwmetnxx';
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
        const currencies = [baseCurrency, quoteCurrency].filter((v, i, a) => a.indexOf(v) === i).join(',');
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/macro-data?currencies=${currencies}`,
          {
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(15000),
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setFundamentals(prev => ({ ...prev, ...json.data }));
            // Check source of first entry
            const firstKey = Object.keys(json.data)[0];
            setFundSource(json.data[firstKey]?.source || 'fallback');
          }
        }
      } catch (e) {
        console.error('Failed to fetch macro data:', e);
      } finally {
        setFundLoading(false);
      }
    };
    fetchMacroData();
  }, [baseCurrency, quoteCurrency]);

  // Fetch live price — fixed pair code logic
  useEffect(() => {
    let cancelled = false;
    setPriceLoading(true);
    setLivePrice(null);

    const load = async () => {
      try {
        const pairKey = getPricePairKey(baseCurrency, quoteCurrency);
        const price = await fetchForexPrice(pairKey);
        if (!cancelled) setLivePrice(price);
      } catch {
        if (!cancelled) setLivePrice(null);
      } finally {
        if (!cancelled) setPriceLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [baseCurrency, quoteCurrency]);

  const scores = useMemo(() => computeScores(baseCurrency, quoteCurrency, fundamentals, cotPositions), [baseCurrency, quoteCurrency, fundamentals, cotPositions]);
  const verdict = useMemo(() => getVerdict(scores.totalScore), [scores.totalScore]);

  const bp = cotPositions[baseCurrency] || FALLBACK_COT_POSITIONS[baseCurrency];
  const qp = cotPositions[quoteCurrency] || FALLBACK_COT_POSITIONS[quoteCurrency];
  const bf = fundamentals[baseCurrency] || FALLBACK_FUNDAMENTALS[baseCurrency];
  const qf = fundamentals[quoteCurrency] || FALLBACK_FUNDAMENTALS[quoteCurrency];

  // Seasonality chart data
  const seasonalityData = useMemo(() => {
    const bSeas = SEASONALITY[baseCurrency];
    const qSeas = SEASONALITY[quoteCurrency];
    return MONTHS.map((m, i) => ({ month: m, value: parseFloat((bSeas[i] - qSeas[i]).toFixed(2)) }));
  }, [baseCurrency, quoteCurrency]);

  const baseLongPct = bp.long + bp.short > 0 ? ((bp.long / (bp.long + bp.short)) * 100).toFixed(1) : '0';
  const quoteLongPct = qp.long + qp.short > 0 ? ((qp.long / (qp.long + qp.short)) * 100).toFixed(1) : '0';

  const getFundBias = (bVal: number, qVal: number, metric: string) => {
    const diff = bVal - qVal;
    if (metric === 'unemployment') {
      if (diff < -0.5) return { label: 'Bullish', color: 'text-success' };
      if (diff > 0.5) return { label: 'Bearish', color: 'text-destructive' };
      return { label: 'Neutral', color: 'text-muted-foreground' };
    }
    if (metric === 'cpi') {
      if (diff < -0.3) return { label: 'Bullish', color: 'text-success' };
      if (diff > 0.3) return { label: 'Bearish', color: 'text-destructive' };
      return { label: 'Neutral', color: 'text-muted-foreground' };
    }
    if (diff > 0.3) return { label: 'Bullish', color: 'text-success' };
    if (diff < -0.3) return { label: 'Bearish', color: 'text-destructive' };
    return { label: 'Neutral', color: 'text-muted-foreground' };
  };

  const scoreBreakdown = [
    { label: 'COT', value: scores.cotScore, max: 3 },
    { label: 'Seasonality', value: scores.seasScore, max: 2 },
    { label: 'Trend', value: scores.trendScore, max: 2 },
    { label: 'Momentum', value: scores.momentumScore, max: 2 },
    { label: 'Economic', value: scores.economicScore, max: 2 },
  ];

  const fundRows = [
    { label: 'GDP Growth', bVal: `${bf.gdp}%`, qVal: `${qf.gdp}%`, bias: getFundBias(bf.gdp, qf.gdp, 'gdp') },
    { label: 'Inflation (CPI)', bVal: `${bf.cpi}%`, qVal: `${qf.cpi}%`, bias: getFundBias(bf.cpi, qf.cpi, 'cpi') },
    { label: 'Unemployment', bVal: `${bf.unemployment}%`, qVal: `${qf.unemployment}%`, bias: getFundBias(bf.unemployment, qf.unemployment, 'unemployment') },
    { label: 'Interest Rate', bVal: `${bf.interestRate}%`, qVal: `${qf.interestRate}%`, bias: getFundBias(bf.interestRate, qf.interestRate, 'rate') },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="w-24 bg-background/50 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== quoteCurrency).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
              <SelectTrigger className="w-24 bg-background/50 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-display-hero font-bold text-foreground">{pair}</span>
            <Badge className={`${verdict.bgClass} ${verdict.color} border font-semibold text-xs`}>
              {verdict.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Price</div>
              <div className="text-xl font-mono font-bold text-foreground">
                {priceLoading ? '...' : livePrice ? livePrice.toFixed(livePrice > 100 ? 3 : 5) : '—'}
              </div>
            </div>
            <div className={`rounded-xl px-4 py-2 border ${verdict.bgClass}`}>
              <div className="text-xs text-muted-foreground text-center">Score</div>
              <div className={`text-2xl font-bold font-mono ${verdict.color}`}>
                {scores.totalScore > 0 ? '+' : ''}{scores.totalScore.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
        <div className="h-[400px]">
          <TradingViewEmbed base={baseCurrency} quote={quoteCurrency} />
        </div>
      </div>

      {/* Main Grid — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Fundamentals + Score Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {/* Fundamentals Table */}
          <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Fundamentals</h3>
                </div>
                <div className="flex items-center gap-2">
                  {fundLoading && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
                  <Badge variant="outline" className="text-[10px] border-border/30">
                    {fundSource === 'fred' ? '🟢 FRED Live' : '⚪ Fallback'}
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left text-muted-foreground font-medium py-2 pr-4"></th>
                      <th className="text-right text-muted-foreground font-medium py-2 px-3">{baseCurrency}</th>
                      <th className="text-right text-muted-foreground font-medium py-2 px-3">{quoteCurrency}</th>
                      <th className="text-right text-muted-foreground font-medium py-2 pl-3">Bias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundRows.map(row => (
                      <tr key={row.label} className="border-b border-border/10">
                        <td className="py-2.5 pr-4 text-foreground font-medium">{row.label}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-foreground">{row.bVal}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-foreground">{row.qVal}</td>
                        <td className={`py-2.5 pl-3 text-right font-semibold ${row.bias.color}`}>
                          {row.bias.label === 'Bullish' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                          {row.bias.label === 'Bearish' && <TrendingDown className="w-3 h-3 inline mr-1" />}
                          {row.bias.label}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Source: {fundSource === 'fred' ? 'Federal Reserve Economic Data (FRED)' : 'Cached data'} • Comparing {baseCurrency} vs {quoteCurrency}
              </p>
            </CardContent>
          </Card>

          {/* Bottom panels: Seasonality + Institutional + Retail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Seasonality */}
            <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Seasonality</h3>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonalityData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(210 40% 75%)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(210 40% 75%)' }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(0 0% 8%)', border: '1px solid hsl(0 0% 15%)', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: 'hsl(210 40% 98%)' }}
                      />
                      <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {seasonalityData.map((entry, i) => (
                          <Cell key={i} fill={entry.value >= 0 ? 'hsl(142 76% 60%)' : 'hsl(0 84% 60%)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Institutional bias:</span>
                  <span className={`font-semibold ${scores.seasScore >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {scores.seasScore >= 0 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Institutional */}
            <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Institutional</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Net</span>
                      <span className={`font-bold ${bp.netPosition - qp.netPosition > 0 ? 'text-success' : 'text-destructive'}`}>
                        Long ({baseLongPct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${baseLongPct}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/10 rounded-lg p-2">
                      <div className="text-muted-foreground">Longs</div>
                      <div className="font-mono font-bold text-success">{bp.long.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted/10 rounded-lg p-2">
                      <div className="text-muted-foreground">Shorts</div>
                      <div className="font-mono font-bold text-destructive">{bp.short.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-2">
                    <span>Consensus</span>
                    <span className={`font-semibold ${bp.sentiment === 'BULLISH' ? 'text-success' : bp.sentiment === 'BEARISH' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {bp.sentiment}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Retail */}
            <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Retail</h3>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const retailLongPct = (100 - parseFloat(baseLongPct)).toFixed(1);
                    const retailShortPct = baseLongPct;
                    const retailBias = parseFloat(retailLongPct) > 55 ? 'Long' : parseFloat(retailLongPct) < 45 ? 'Short' : 'Mixed';
                    return (
                      <>
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Sentiment</span>
                            <span className={`font-bold ${retailBias === 'Long' ? 'text-success' : retailBias === 'Short' ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {retailBias} ({retailLongPct}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${retailLongPct}%` }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-muted/10 rounded-lg p-2">
                            <div className="text-muted-foreground">Longs</div>
                            <div className="font-mono font-bold text-success">{retailLongPct}%</div>
                          </div>
                          <div className="bg-muted/10 rounded-lg p-2">
                            <div className="text-muted-foreground">Shorts</div>
                            <div className="font-mono font-bold text-destructive">{retailShortPct}%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-2">
                          <span>Consensus</span>
                          <span className={`font-semibold ${retailBias === 'Long' ? 'text-success' : retailBias === 'Short' ? 'text-destructive' : 'text-warning'}`}>
                            {retailBias === 'Long' ? 'Bearish' : retailBias === 'Short' ? 'Bullish' : 'Neutral'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT: Score Breakdown */}
        <div className="space-y-4">
          <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Score Breakdown</h3>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center py-2 border-b border-border/20">
                  <span className="text-sm font-medium text-foreground">Score</span>
                  <span className={`text-lg font-bold font-mono ${verdict.color}`}>
                    {scores.totalScore > 0 ? '+' : ''}{scores.totalScore.toFixed(2)}
                  </span>
                </div>
                {scoreBreakdown.map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/10">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={`font-mono font-bold text-sm ${item.value > 0 ? 'text-success' : item.value < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {item.value > 0 ? '+' : ''}{item.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insight */}
          <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {scores.totalScore > 2 ? (
                  <>Institutional positioning and macro fundamentals align in favor of <strong className="text-success">{baseCurrency}</strong> over {quoteCurrency}. COT data shows leveraged funds are {bp.netPosition > 0 ? 'net long' : 'net short'} {baseCurrency} ({bp.netPosition.toLocaleString()} contracts) while {qp.netPosition > 0 ? 'net long' : 'net short'} {quoteCurrency}. Rate differential of {(bf.interestRate - qf.interestRate).toFixed(2)}% supports the {baseCurrency} carry.</>
                ) : scores.totalScore < -2 ? (
                  <>Institutional flow favors <strong className="text-destructive">{quoteCurrency}</strong> over {baseCurrency}. Leveraged funds are positioning bearishly on {baseCurrency} ({bp.netPosition.toLocaleString()} net contracts) while {quoteCurrency} carries a stronger fundamental profile. Consider short {pair} setups on rallies.</>
                ) : (
                  <>Mixed signals on {pair}. COT positioning is not strongly directional and fundamentals show a narrow spread. Wait for clearer institutional commitment before taking directional trades. Monitor weekly COT changes for shifts.</>
                )}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • CFTC data as of Mar 29, 2026
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default COTPairScorecard;
