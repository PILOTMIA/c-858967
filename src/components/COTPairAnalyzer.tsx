import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield, Building2, BarChart3, Landmark } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

// COT positions from CFTC report May 5, 2026 (as of April 28, 2026)
interface CurrencyPositioning {
  netPosition: number;
  long: number;
  short: number;
  sentiment: string;
  weeklyChange: number;
  dealerLong: number;
  dealerShort: number;
  dealerWeeklyChange: number;
  assetManagerLong: number;
  assetManagerShort: number;
  assetManagerWeeklyChange: number;
}

const COT_POSITIONS: Record<string, CurrencyPositioning> = {
  EUR: { netPosition: 11594, long: 111857, short: 100263, sentiment: 'BULLISH', weeklyChange: -8723, dealerLong: 48682, dealerShort: 396571, dealerWeeklyChange: 6802, assetManagerLong: 439565, assetManagerShort: 148667, assetManagerWeeklyChange: 4507 },
  GBP: { netPosition: 28882, long: 58489, short: 29607, sentiment: 'BULLISH', weeklyChange: -255, dealerLong: 131315, dealerShort: 63446, dealerWeeklyChange: 10058, assetManagerLong: 39695, assetManagerShort: 133448, assetManagerWeeklyChange: -10567 },
  JPY: { netPosition: -75802, long: 81800, short: 157602, sentiment: 'BEARISH', weeklyChange: -7305, dealerLong: 84091, dealerShort: 25315, dealerWeeklyChange: 14383, assetManagerLong: 66512, assetManagerShort: 93062, assetManagerWeeklyChange: -12152 },
  CHF: { netPosition: -5174, long: 7107, short: 12281, sentiment: 'BEARISH', weeklyChange: -1408, dealerLong: 62055, dealerShort: 12371, dealerWeeklyChange: -353, assetManagerLong: 6003, assetManagerShort: 43537, assetManagerWeeklyChange: -67 },
  AUD: { netPosition: 47855, long: 73808, short: 25953, sentiment: 'BULLISH', weeklyChange: -470, dealerLong: 41534, dealerShort: 166752, dealerWeeklyChange: -6524, assetManagerLong: 102988, assetManagerShort: 57891, assetManagerWeeklyChange: 8589 },
  CAD: { netPosition: -53828, long: 25239, short: 79067, sentiment: 'BEARISH', weeklyChange: 10387, dealerLong: 83444, dealerShort: 60192, dealerWeeklyChange: -32065, assetManagerLong: 88349, assetManagerShort: 72317, assetManagerWeeklyChange: 17819 },
  MXN: { netPosition: 49189, long: 76797, short: 27608, sentiment: 'BULLISH', weeklyChange: 3969, dealerLong: 21503, dealerShort: 60570, dealerWeeklyChange: -5741, assetManagerLong: 91215, assetManagerShort: 35502, assetManagerWeeklyChange: 1194 },
  NZD: { netPosition: -16833, long: 7160, short: 23993, sentiment: 'BEARISH', weeklyChange: 1229, dealerLong: 61264, dealerShort: 3960, dealerWeeklyChange: -1421, assetManagerLong: 7660, assetManagerShort: 49488, assetManagerWeeklyChange: 684 },
  USD: { netPosition: 0, long: 0, short: 0, sentiment: 'NEUTRAL', weeklyChange: 0, dealerLong: 0, dealerShort: 0, dealerWeeklyChange: 0, assetManagerLong: 0, assetManagerShort: 0, assetManagerWeeklyChange: 0 },
};

// Historical net positions for chart (Leveraged Funds)
const HISTORICAL_NET: Record<string, { date: string; value: number }[]> = {
  EUR: [
    { date: 'Mar 24', value: -13538 },
    { date: 'Mar 31', value: 3947 },
    { date: 'Apr 7', value: 3947 }, // published report same data
    { date: 'Apr 28', value: 11594 },
  ],
  GBP: [
    { date: 'Mar 24', value: 15716 },
    { date: 'Mar 31', value: 29932 },
    { date: 'Apr 7', value: 29932 },
    { date: 'Apr 28', value: 28882 },
  ],
  JPY: [
    { date: 'Mar 24', value: -54852 },
    { date: 'Mar 31', value: -46182 },
    { date: 'Apr 7', value: -46182 },
    { date: 'Apr 28', value: -75802 },
  ],
  CHF: [
    { date: 'Mar 24', value: 235 },
    { date: 'Mar 31', value: 1490 },
    { date: 'Apr 7', value: 1490 },
    { date: 'Apr 28', value: -5174 },
  ],
  AUD: [
    { date: 'Mar 24', value: 49145 },
    { date: 'Mar 31', value: 52569 },
    { date: 'Apr 7', value: 52569 },
    { date: 'Apr 28', value: 47855 },
  ],
  CAD: [
    { date: 'Mar 24', value: -31700 },
    { date: 'Mar 31', value: -42910 },
    { date: 'Apr 7', value: -42910 },
    { date: 'Apr 28', value: -53828 },
  ],
  NZD: [
    { date: 'Mar 24', value: -16730 },
    { date: 'Mar 31', value: -17798 },
    { date: 'Apr 7', value: -17798 },
    { date: 'Apr 28', value: -16833 },
  ],
  MXN: [
    { date: 'Mar 24', value: 54787 },
    { date: 'Mar 31', value: 52803 },
    { date: 'Apr 7', value: 52803 },
    { date: 'Apr 28', value: 49189 },
  ],
};

// US 10-Year Treasury Note fallback
const US10Y_FALLBACK = {
  yield: 4.32,
  weeklyChange: -0.08,
  trend: 'falling' as 'falling' | 'rising' | 'stable',
};

const US10Y_INTERPRETATIONS = {
  falling: 'Falling yields signal risk-off sentiment and weaker USD demand. Traders move capital out of US bonds, reducing dollar buying pressure.',
  rising: 'Rising yields attract global capital into US bonds, increasing USD demand. Higher yields = stronger dollar as investors seek safe returns.',
  stable: 'Stable yields suggest consolidation. Watch for breakout direction for the next USD move.',
};

// Gold correlation with USD
const GOLD_USD_INSIGHT = {
  correlation: -0.82,
  goldTrend: 'rising' as const,
  note: 'Gold (XAUUSD) has a strong inverse correlation with the US Dollar. When USD weakens (falling yields, dovish Fed), gold rises as a hedge. Currently, with the US 10Y yield trending lower and tariff uncertainty rising, gold is in a bullish trend. For USD pairs: a rising gold price confirms USD weakness — look to sell USD pairs when gold breaks new highs.',
  tradingTip: 'Use gold as a confirmation filter: if XAUUSD is making higher highs while a USD pair (e.g., EUR/USD) is also rising, the trade has higher conviction. If gold and EUR/USD diverge, reduce size or wait.',
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'MXN'];

const FLAG_EMOJIS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CHF: '🇨🇭', AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿', MXN: '🇲🇽',
};

const COTPairAnalyzer = () => {
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [quoteCurrency, setQuoteCurrency] = useState('JPY');
  const [us10yData, setUs10yData] = useState(US10Y_FALLBACK);
  const [us10ySource, setUs10ySource] = useState<'fallback' | 'fred'>('fallback');

  const isUSDPair = baseCurrency === 'USD' || quoteCurrency === 'USD';

  // Fetch live US10Y data when USD pair is selected
  useEffect(() => {
    if (!isUSDPair) return;
    const fetchUS10Y = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xkgsugennbdatwmetnxx';
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/macro-data?currencies=USD&us10y=true`,
          {
            headers: { 'Authorization': `Bearer ${anonKey}`, 'apikey': anonKey, 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(15000),
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.us10y) {
            const yld = json.us10y.yield;
            const prev = json.us10y.previousYield;
            const change = parseFloat((yld - prev).toFixed(2));
            const trend: 'rising' | 'falling' | 'stable' = change > 0.02 ? 'rising' : change < -0.02 ? 'falling' : 'stable';
            setUs10yData({ yield: yld, weeklyChange: change, trend });
            setUs10ySource(json.us10y.source || 'fallback');
          }
        }
      } catch (e) {
        console.error('Failed to fetch US10Y:', e);
      }
    };
    fetchUS10Y();
  }, [isUSDPair]);

  const analysis = useMemo(() => {
    const base = COT_POSITIONS[baseCurrency];
    const quote = COT_POSITIONS[quoteCurrency];
    if (!base || !quote) return null;

    const maxPos = 100000;
    const baseScore = (base.netPosition / maxPos) * 100;
    const quoteScore = (quote.netPosition / maxPos) * 100;

    const pairScore = baseScore - quoteScore;
    const clampedScore = Math.max(-100, Math.min(100, pairScore));

    const bullPercent = Math.round(50 + clampedScore / 2);
    const bearPercent = 100 - bullPercent;

    const bullContracts = base.long + quote.short;
    const bearContracts = base.short + quote.long;

    let verdict: 'STRONG BULLISH' | 'BULLISH' | 'SLIGHTLY BULLISH' | 'NEUTRAL' | 'SLIGHTLY BEARISH' | 'BEARISH' | 'STRONG BEARISH';
    if (clampedScore > 60) verdict = 'STRONG BULLISH';
    else if (clampedScore > 30) verdict = 'BULLISH';
    else if (clampedScore > 10) verdict = 'SLIGHTLY BULLISH';
    else if (clampedScore > -10) verdict = 'NEUTRAL';
    else if (clampedScore > -30) verdict = 'SLIGHTLY BEARISH';
    else if (clampedScore > -60) verdict = 'BEARISH';
    else verdict = 'STRONG BEARISH';

    const isBullish = clampedScore > 0;

    return {
      pair: `${baseCurrency}${quoteCurrency}`,
      pairScore: clampedScore,
      bullPercent,
      bearPercent,
      bullContracts,
      bearContracts,
      verdict,
      isBullish,
      base: { ...base, currency: baseCurrency },
      quote: { ...quote, currency: quoteCurrency },
    };
  }, [baseCurrency, quoteCurrency]);

  const formatContracts = (n: number) => {
    if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('STRONG BULLISH')) return 'text-success';
    if (verdict.includes('BULLISH')) return 'text-success';
    if (verdict.includes('STRONG BEARISH')) return 'text-destructive';
    if (verdict.includes('BEARISH')) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getVerdictBg = (verdict: string) => {
    if (verdict.includes('BULLISH')) return 'bg-success/10 border-success/20';
    if (verdict.includes('BEARISH')) return 'bg-destructive/10 border-destructive/20';
    return 'bg-muted/10 border-muted/20';
  };

  // Historical positioning chart data
  const historicalChartData = useMemo(() => {
    const baseHist = HISTORICAL_NET[baseCurrency];
    const quoteHist = HISTORICAL_NET[quoteCurrency];
    if (!baseHist || !quoteHist) return null;
    return baseHist.map((item, i) => ({
      date: item.date,
      [baseCurrency]: item.value,
      [quoteCurrency]: quoteHist[i]?.value ?? 0,
    }));
  }, [baseCurrency, quoteCurrency]);

  // Generate concise Smart Money Insight (≤150 words)
  const smartMoneyInsight = useMemo(() => {
    if (!analysis) return null;

    const base = analysis.base;
    const quote = analysis.quote;
    const baseName = base.currency;
    const quoteName = quote.currency;

    const baseDir = base.netPosition > 0 ? 'long' : 'short';
    const quoteDir = quote.netPosition > 0 ? 'long' : 'short';

    const baseDealerNet = base.dealerLong - base.dealerShort;
    const quoteDealerNet = quote.dealerLong - quote.dealerShort;
    const baseAMNet = base.assetManagerLong - base.assetManagerShort;
    const quoteAMNet = quote.assetManagerLong - quote.assetManagerShort;
    
    const dealerFavorsBase = baseDealerNet - quoteDealerNet > 0;
    const amFavorsBase = baseAMNet - quoteAMNet > 0;
    const leveragedFavorsBase = analysis.isBullish;
    
    const allAligned = (dealerFavorsBase === amFavorsBase) && (amFavorsBase === leveragedFavorsBase);
    const twoOfThree = (dealerFavorsBase === amFavorsBase) || (amFavorsBase === leveragedFavorsBase) || (dealerFavorsBase === leveragedFavorsBase);

    const conviction = allAligned ? 'High' : twoOfThree ? 'Moderate' : 'Low';
    const convictionColor = allAligned ? 'text-success' : twoOfThree ? 'text-chart-1' : 'text-destructive';

    const favoredCurrency = analysis.isBullish ? baseName : quoteName;
    const direction = analysis.isBullish ? 'bullish' : 'bearish';

    const baseFlow = base.weeklyChange > 0 ? `+${formatContracts(base.weeklyChange)}` : formatContracts(base.weeklyChange);
    const quoteFlow = quote.weeklyChange > 0 ? `+${formatContracts(quote.weeklyChange)}` : formatContracts(quote.weeklyChange);

    return { baseName, quoteName, baseDir, quoteDir, baseFlow, quoteFlow, conviction, convictionColor, favoredCurrency, direction, allAligned, twoOfThree, baseNet: formatContracts(Math.abs(base.netPosition)), quoteNet: formatContracts(Math.abs(quote.netPosition)) };
  }, [analysis]);

  return (
    <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2 font-display-hero text-xl">
          <Zap className="w-5 h-5 text-primary" />
          COT Pair Analyzer
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Compare institutional positioning between any two currencies. CFTC report May 5, 2026 (as of April 28).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">Base Currency</label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="bg-background/50 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== quoteCurrency).map(c => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span>{FLAG_EMOJIS[c]}</span>
                      <span className="font-medium text-foreground">{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ArrowRight className="w-5 h-5 text-muted-foreground mt-4 hidden sm:block" />
          
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">Quote Currency</label>
            <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
              <SelectTrigger className="bg-background/50 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span>{FLAG_EMOJIS[c]}</span>
                      <span className="font-medium text-foreground">{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {analysis && smartMoneyInsight && (
          <>
            {/* Verdict */}
            <div className={`rounded-xl p-5 border ${getVerdictBg(analysis.verdict)} text-center`}>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Institutional Verdict</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-display-hero font-bold text-foreground">
                  {baseCurrency}/{quoteCurrency}
                </span>
              </div>
              <div className={`text-2xl font-bold mt-2 ${getVerdictColor(analysis.verdict)}`}>
                {analysis.verdict}
              </div>
            </div>

            {/* Bull/Bear Meter */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-success font-medium">
                  <TrendingUp className="w-4 h-4" /> Bulls {analysis.bullPercent}%
                </span>
                <span className="flex items-center gap-1 text-destructive font-medium">
                  Bears {analysis.bearPercent}% <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="relative h-3 bg-destructive/20 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.bullPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatContracts(analysis.bullContracts)} contracts</span>
                <span>{formatContracts(analysis.bearContracts)} contracts</span>
              </div>
            </div>

            {/* Individual Currency Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[analysis.base, analysis.quote].map((curr) => (
                <div key={curr.currency} className="rounded-xl bg-muted/20 p-4 border border-border/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground flex items-center gap-2">
                      {FLAG_EMOJIS[curr.currency]} {curr.currency}
                    </span>
                    <Badge variant="secondary" className={`text-xs ${
                      curr.sentiment === 'BULLISH' ? 'bg-success/20 text-success' :
                      curr.sentiment === 'BEARISH' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted/30 text-muted-foreground'
                    }`}>
                      {curr.sentiment}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Position</span>
                      <span className={`font-mono font-bold ${curr.netPosition > 0 ? 'text-success' : 'text-destructive'}`}>
                        {curr.netPosition > 0 ? '+' : ''}{curr.netPosition.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weekly Δ</span>
                      <span className={`font-mono text-xs ${curr.weeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
                        {curr.weeklyChange > 0 ? '+' : ''}{curr.weeklyChange.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Long / Short</span>
                      <span className="font-mono text-foreground">
                        {formatContracts(curr.long)} / {formatContracts(curr.short)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Historical Positioning Chart */}
            {historicalChartData && baseCurrency !== 'USD' && quoteCurrency !== 'USD' && (
              <div className="rounded-xl bg-muted/10 p-5 border border-border/20">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Positioning Over Time (Net Contracts)
                </h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={historicalChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Line type="monotone" dataKey={baseCurrency} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }} />
                    <Line type="monotone" dataKey={quoteCurrency} stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-5))' }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">CFTC Leveraged Funds net position • March 24 – April 28, 2026</p>
              </div>
            )}

            {/* Dealer & Asset Manager Positioning */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Institutional Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[analysis.base, analysis.quote].map((curr) => {
                  const dealerNet = curr.dealerLong - curr.dealerShort;
                  const amNet = curr.assetManagerLong - curr.assetManagerShort;
                  return (
                    <div key={`inst-${curr.currency}`} className="rounded-xl bg-muted/10 p-4 border border-border/20 space-y-3">
                      <span className="font-bold text-foreground text-sm">{FLAG_EMOJIS[curr.currency]} {curr.currency}</span>
                      
                      {/* Dealer */}
                      <div className="p-2.5 rounded-lg bg-background/50 border border-border/10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Dealers/Intermediaries</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Net</span>
                          <span className={`font-mono font-bold text-sm ${dealerNet > 0 ? 'text-success' : dealerNet < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {dealerNet > 0 ? '+' : ''}{formatContracts(dealerNet)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-xs text-muted-foreground">L / S</span>
                          <span className="font-mono text-xs text-foreground">{formatContracts(curr.dealerLong)} / {formatContracts(curr.dealerShort)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-xs text-muted-foreground">Weekly Δ</span>
                          <span className={`font-mono text-xs ${curr.dealerWeeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
                            {curr.dealerWeeklyChange > 0 ? '+' : ''}{formatContracts(curr.dealerWeeklyChange)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Asset Manager */}
                      <div className="p-2.5 rounded-lg bg-background/50 border border-border/10">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BarChart3 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Asset Managers</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Net</span>
                          <span className={`font-mono font-bold text-sm ${amNet > 0 ? 'text-success' : amNet < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {amNet > 0 ? '+' : ''}{formatContracts(amNet)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-xs text-muted-foreground">L / S</span>
                          <span className="font-mono text-xs text-foreground">{formatContracts(curr.assetManagerLong)} / {formatContracts(curr.assetManagerShort)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-xs text-muted-foreground">Weekly Δ</span>
                          <span className={`font-mono text-xs ${curr.assetManagerWeeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
                            {curr.assetManagerWeeklyChange > 0 ? '+' : ''}{formatContracts(curr.assetManagerWeeklyChange)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* US 10-Year Treasury Note — only for USD pairs */}
            {isUSDPair && (
              <div className="rounded-xl bg-chart-1/5 p-5 border border-chart-1/20">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark className="w-5 h-5 text-chart-1" />
                  <span className="font-semibold text-foreground text-sm">US 10-Year Treasury Note (US10Y)</span>
                  <Badge variant="outline" className={`text-[10px] border-chart-1/30 ${us10ySource === 'fred' ? 'text-success' : 'text-chart-1'}`}>
                    {us10ySource === 'fred' ? '🟢 FRED Live' : '⚪ Fallback'}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Current Yield</div>
                    <div className="text-xl font-mono font-bold text-foreground">{us10yData.yield}%</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Weekly Change</div>
                    <div className={`text-xl font-mono font-bold ${us10yData.weeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
                      {us10yData.weeklyChange > 0 ? '+' : ''}{us10yData.weeklyChange}%
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Trend</div>
                    <div className={`text-sm font-bold flex items-center justify-center gap-1 ${
                      us10yData.trend === 'rising' ? 'text-success' : us10yData.trend === 'falling' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {us10yData.trend === 'rising' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {us10yData.trend.charAt(0).toUpperCase() + us10yData.trend.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="bg-background/30 rounded-lg p-3 border border-border/10">
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong className="text-chart-1">Impact on USD:</strong>{' '}
                    {US10Y_INTERPRETATIONS[us10yData.trend]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 The 10Y yield is a key driver for {baseCurrency}/{quoteCurrency}. 
                    {us10yData.trend === 'falling' 
                      ? baseCurrency === 'USD' 
                        ? ` Falling yields are bearish for USD — watch for ${quoteCurrency} strength.`
                        : ` Falling yields weaken USD — this supports ${baseCurrency} upside.`
                      : us10yData.trend === 'rising'
                        ? baseCurrency === 'USD'
                          ? ` Rising yields support USD — expect ${baseCurrency} strength against ${quoteCurrency}.`
                          : ` Rising yields strengthen USD — this creates headwinds for ${baseCurrency}.`
                        : ' Monitor for a directional break in yields.'}
                  </p>
                </div>
              </div>
            )}

            {/* Gold (XAUUSD) vs USD — only for USD pairs */}
            {isUSDPair && (
              <div className="rounded-xl bg-warning/5 p-5 border border-warning/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🪙</span>
                  <span className="font-semibold text-foreground text-sm">Gold (XAUUSD) — USD Correlation</span>
                  <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">
                    Correlation: {GOLD_USD_INSIGHT.correlation}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Gold Trend</div>
                    <div className="text-sm font-bold text-success flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Rising
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">USD Impact</div>
                    <div className="text-sm font-bold text-destructive flex items-center justify-center gap-1">
                      <TrendingDown className="w-4 h-4" /> Bearish
                    </div>
                  </div>
                </div>
                <div className="bg-background/30 rounded-lg p-3 border border-border/10 space-y-2">
                  <p className="text-sm text-foreground leading-relaxed">{GOLD_USD_INSIGHT.note}</p>
                  <p className="text-xs text-warning font-medium">
                    💡 Trading Tip: {GOLD_USD_INSIGHT.tradingTip}
                  </p>
                </div>
              </div>
            )}

            {/* Smart Money Insight — concise, ≤150 words */}
            <div className="rounded-xl bg-primary/5 p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">Smart Money Insight</span>
                </div>
                <Badge variant="outline" className={`text-[10px] ${smartMoneyInsight.convictionColor} border-current`}>
                  {smartMoneyInsight.conviction} Conviction
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Leveraged funds are <strong className={smartMoneyInsight.baseDir === 'long' ? 'text-success' : 'text-destructive'}>net {smartMoneyInsight.baseDir} {smartMoneyInsight.baseName}</strong> ({smartMoneyInsight.baseNet} contracts) and <strong className={smartMoneyInsight.quoteDir === 'long' ? 'text-success' : 'text-destructive'}>net {smartMoneyInsight.quoteDir} {smartMoneyInsight.quoteName}</strong> ({smartMoneyInsight.quoteNet} contracts).
                
                Weekly flow: {smartMoneyInsight.baseName} {smartMoneyInsight.baseFlow}, {smartMoneyInsight.quoteName} {smartMoneyInsight.quoteFlow}.
                
                The net differential is <strong className={analysis.isBullish ? 'text-success' : 'text-destructive'}>{smartMoneyInsight.direction}</strong> for {analysis.pair}, favoring <strong className="text-foreground">{smartMoneyInsight.favoredCurrency}</strong>.
                
                {smartMoneyInsight.allAligned 
                  ? ' All three groups (Dealers, Asset Managers, Leveraged Funds) agree — high conviction setup.'
                  : smartMoneyInsight.twoOfThree
                    ? ' Two of three institutional groups agree — moderate conviction. Manage risk accordingly.'
                    : ' Institutional groups are split — low conviction. Wait for alignment before entering.'}
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Data: CFTC Financial Traders Report • Released May 5, 2026 • Positions as of April 28, 2026
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default COTPairAnalyzer;
