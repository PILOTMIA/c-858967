import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// COT net positions from March 19, 2026 CFTC report (leveraged funds)
const COT_POSITIONS: Record<string, {
  netPosition: number;
  long: number;
  short: number;
  sentiment: string;
  weeklyChange: number;
}> = {
  EUR: { netPosition: 5231, long: 105592, short: 100361, sentiment: 'NEUTRAL', weeklyChange: -24401 },
  GBP: { netPosition: 20102, long: 48818, short: 28716, sentiment: 'BULLISH', weeklyChange: -14404 },
  JPY: { netPosition: -49219, long: 77546, short: 126765, sentiment: 'BEARISH', weeklyChange: -14994 },
  CHF: { netPosition: 4280, long: 10750, short: 6470, sentiment: 'BULLISH', weeklyChange: -176 },
  AUD: { netPosition: 46568, long: 69980, short: 23412, sentiment: 'BULLISH', weeklyChange: -8067 },
  CAD: { netPosition: -37159, long: 28252, short: 65411, sentiment: 'BEARISH', weeklyChange: 4212 },
  MXN: { netPosition: 52885, long: 89244, short: 36359, sentiment: 'BULLISH', weeklyChange: -1921 },
  NZD: { netPosition: -4166, long: 11699, short: 15865, sentiment: 'BEARISH', weeklyChange: 6129 },
  USD: { netPosition: 0, long: 0, short: 0, sentiment: 'NEUTRAL', weeklyChange: 0 }, // baseline
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'MXN'];

const FLAG_EMOJIS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CHF: '🇨🇭', AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿', MXN: '🇲🇽',
};

const COTPairAnalyzer = () => {
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [quoteCurrency, setQuoteCurrency] = useState('JPY');

  const analysis = useMemo(() => {
    const base = COT_POSITIONS[baseCurrency];
    const quote = COT_POSITIONS[quoteCurrency];
    if (!base || !quote) return null;

    // For a pair like GBPJPY:
    // If institutions are LONG GBP (bullish GBP) → bullish for GBPJPY
    // If institutions are SHORT JPY (bearish JPY) → also bullish for GBPJPY
    // Combined score = base net position - quote net position
    // Positive = bullish for the pair, Negative = bearish

    // Normalize positions to a -100 to +100 scale for comparison
    const maxPos = 100000; // normalization factor
    const baseScore = (base.netPosition / maxPos) * 100;
    const quoteScore = (quote.netPosition / maxPos) * 100;

    // The pair bias: bullish base + bearish quote = bullish pair
    const pairScore = baseScore - quoteScore;
    const clampedScore = Math.max(-100, Math.min(100, pairScore));

    // Calculate bull/bear percentages
    const bullPercent = Math.round(50 + clampedScore / 2);
    const bearPercent = 100 - bullPercent;

    // Total contracts on each side
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
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('STRONG BULLISH')) return 'text-success';
    if (verdict.includes('BULLISH')) return 'text-success';
    if (verdict.includes('STRONG BEARISH')) return 'text-destructive';
    if (verdict.includes('BEARISH')) return 'text-destructive';
    return 'text-warning';
  };

  const getVerdictBg = (verdict: string) => {
    if (verdict.includes('STRONG BULLISH')) return 'bg-success/20 border-success/40';
    if (verdict.includes('BULLISH')) return 'bg-success/15 border-success/30';
    if (verdict.includes('STRONG BEARISH')) return 'bg-destructive/20 border-destructive/40';
    if (verdict.includes('BEARISH')) return 'bg-destructive/15 border-destructive/30';
    return 'bg-warning/15 border-warning/30';
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg sm:text-xl">COT Pair Analyzer</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Select any two currencies to see institutional positioning — are the big players bullish or bearish on this pair?
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-5">
        {/* Currency Selectors */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Base Currency</label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== quoteCurrency).map(c => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span>{FLAG_EMOJIS[c]}</span>
                      <span className="font-medium">{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground mt-5 flex-shrink-0" />

          <div className="flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quote Currency</label>
            <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span>{FLAG_EMOJIS[c]}</span>
                      <span className="font-medium">{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {analysis && (
          <>
            {/* Verdict Banner */}
            <div className={`rounded-xl border-2 p-4 text-center ${getVerdictBg(analysis.verdict)}`}>
              <div className="text-sm text-muted-foreground mb-1">
                {FLAG_EMOJIS[baseCurrency]} {baseCurrency}/{FLAG_EMOJIS[quoteCurrency]} {quoteCurrency} Institutional Bias
              </div>
              <div className={`text-2xl sm:text-3xl font-black ${getVerdictColor(analysis.verdict)}`}>
                {analysis.verdict}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Based on CFTC COT Report — March 19, 2026
              </div>
            </div>

            {/* Bull vs Bear Visual */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center gap-1.5 text-success">
                  <TrendingUp className="h-4 w-4" />
                  Bulls {analysis.bullPercent}%
                </span>
                <span className="flex items-center gap-1.5 text-destructive">
                  Bears {analysis.bearPercent}%
                  <TrendingDown className="h-4 w-4" />
                </span>
              </div>

              {/* Tug-of-war bar */}
              <div className="relative h-10 rounded-full overflow-hidden bg-muted/30 border border-border">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/70 transition-all duration-700 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${analysis.bullPercent}%` }}
                >
                  {analysis.bullPercent > 25 && (
                    <span className="text-xs font-bold text-success-foreground drop-shadow-sm">
                      {formatContracts(analysis.bullContracts)}
                    </span>
                  )}
                </div>
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-destructive to-destructive/70 transition-all duration-700 ease-out flex items-center justify-start pl-2"
                  style={{ width: `${analysis.bearPercent}%` }}
                >
                  {analysis.bearPercent > 25 && (
                    <span className="text-xs font-bold text-destructive-foreground drop-shadow-sm">
                      {formatContracts(analysis.bearContracts)}
                    </span>
                  )}
                </div>
                {/* Center marker */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-foreground/30 z-10" />
              </div>
            </div>

            {/* Individual Currency Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Base Currency */}
              <div className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{FLAG_EMOJIS[baseCurrency]} {baseCurrency}</span>
                  <Badge className={
                    analysis.base.netPosition > 5000 ? 'bg-success/20 text-success border-success/30' :
                    analysis.base.netPosition < -5000 ? 'bg-destructive/20 text-destructive border-destructive/30' :
                    'bg-warning/20 text-warning border-warning/30'
                  }>
                    {analysis.base.sentiment}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Net Position</span>
                  <span className={`font-bold ${analysis.base.netPosition > 0 ? 'text-success' : 'text-destructive'}`}>
                    {analysis.base.netPosition > 0 ? '+' : ''}{formatContracts(analysis.base.netPosition)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-success/10 rounded px-2 py-1 text-center">
                    <div className="text-success/70">Longs</div>
                    <div className="font-bold text-success">{formatContracts(analysis.base.long)}</div>
                  </div>
                  <div className="bg-destructive/10 rounded px-2 py-1 text-center">
                    <div className="text-destructive/70">Shorts</div>
                    <div className="font-bold text-destructive">{formatContracts(analysis.base.short)}</div>
                  </div>
                </div>
              </div>

              {/* Quote Currency */}
              <div className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{FLAG_EMOJIS[quoteCurrency]} {quoteCurrency}</span>
                  <Badge className={
                    analysis.quote.netPosition > 5000 ? 'bg-success/20 text-success border-success/30' :
                    analysis.quote.netPosition < -5000 ? 'bg-destructive/20 text-destructive border-destructive/30' :
                    'bg-warning/20 text-warning border-warning/30'
                  }>
                    {analysis.quote.sentiment}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Net Position</span>
                  <span className={`font-bold ${analysis.quote.netPosition > 0 ? 'text-success' : 'text-destructive'}`}>
                    {analysis.quote.netPosition > 0 ? '+' : ''}{formatContracts(analysis.quote.netPosition)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-success/10 rounded px-2 py-1 text-center">
                    <div className="text-success/70">Longs</div>
                    <div className="font-bold text-success">{formatContracts(analysis.quote.long)}</div>
                  </div>
                  <div className="bg-destructive/10 rounded px-2 py-1 text-center">
                    <div className="text-destructive/70">Shorts</div>
                    <div className="font-bold text-destructive">{formatContracts(analysis.quote.short)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-lg bg-muted/30 border border-border p-3 text-xs sm:text-sm text-muted-foreground space-y-1.5">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">How to read this:</strong> Institutions are{' '}
                  <strong className={analysis.base.netPosition > 0 ? 'text-success' : 'text-destructive'}>
                    {analysis.base.netPosition > 0 ? 'buying' : 'selling'} {baseCurrency}
                  </strong>{' '}
                  ({formatContracts(Math.abs(analysis.base.netPosition))} net contracts) and{' '}
                  <strong className={analysis.quote.netPosition > 0 ? 'text-success' : 'text-destructive'}>
                    {analysis.quote.netPosition > 0 ? 'buying' : 'selling'} {quoteCurrency}
                  </strong>{' '}
                  ({formatContracts(Math.abs(analysis.quote.netPosition))} net contracts).
                  {analysis.isBullish
                    ? ` This combination favors ${analysis.pair} to the UPSIDE.`
                    : analysis.pairScore < -5
                    ? ` This combination favors ${analysis.pair} to the DOWNSIDE.`
                    : ` Institutional positioning is mixed — no strong directional bias.`
                  }
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default COTPairAnalyzer;
