import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield } from "lucide-react";

// COT net positions from March 29, 2026 CFTC report (leveraged funds, data as of March 24, 2026)
const COT_POSITIONS: Record<string, {
  netPosition: number;
  long: number;
  short: number;
  sentiment: string;
  weeklyChange: number;
}> = {
  EUR: { netPosition: -13538, long: 97985, short: 111523, sentiment: 'BEARISH', weeklyChange: -6586 },
  GBP: { netPosition: 15716, long: 47450, short: 31734, sentiment: 'BULLISH', weeklyChange: 3948 },
  JPY: { netPosition: -54852, long: 67921, short: 122773, sentiment: 'BEARISH', weeklyChange: 10577 },
  CHF: { netPosition: 235, long: 7950, short: 7715, sentiment: 'NEUTRAL', weeklyChange: -278 },
  AUD: { netPosition: 49145, long: 68577, short: 19432, sentiment: 'BULLISH', weeklyChange: 3786 },
  CAD: { netPosition: -31700, long: 26751, short: 58451, sentiment: 'BEARISH', weeklyChange: 6152 },
  MXN: { netPosition: 54787, long: 75059, short: 20272, sentiment: 'BULLISH', weeklyChange: 7841 },
  NZD: { netPosition: -16730, long: 7461, short: 24191, sentiment: 'BEARISH', weeklyChange: -813 },
  USD: { netPosition: 0, long: 0, short: 0, sentiment: 'NEUTRAL', weeklyChange: 0 },
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
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
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

  return (
    <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2 font-display-hero text-xl">
          <Zap className="w-5 h-5 text-primary" />
          COT Pair Analyzer
        </CardTitle>
        <CardDescription>
          Compare institutional positioning between any two currencies. Data from CFTC report Mar 29, 2026 (as of Mar 24).
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
                      <span className="font-medium">{c}</span>
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
            {/* Verdict */}
            <div className={`rounded-xl p-5 border ${getVerdictBg(analysis.verdict)} text-center`}>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Institutional Verdict</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-display-hero font-bold">
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

            {/* Smart Money Insight */}
            <div className="rounded-xl bg-primary/5 p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Smart Money Insight</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.isBullish ? (
                  <>Institutional money favors <strong className="text-success">{baseCurrency}</strong> over <strong className="text-destructive">{quoteCurrency}</strong>. 
                  Hedge funds are net long {baseCurrency} ({formatContracts(analysis.base.long)} contracts) while being {analysis.quote.netPosition < 0 ? 'net short' : 'less bullish on'} {quoteCurrency}. 
                  This creates a <strong className="text-success">{analysis.verdict.toLowerCase()}</strong> bias for {analysis.pair}.</>
                ) : (
                  <>Institutional money favors <strong className="text-success">{quoteCurrency}</strong> over <strong className="text-destructive">{baseCurrency}</strong>. 
                  Hedge funds are {analysis.base.netPosition < 0 ? 'net short' : 'less bullish on'} {baseCurrency} while being more bullish on {quoteCurrency}. 
                  This creates a <strong className="text-destructive">{analysis.verdict.toLowerCase()}</strong> bias for {analysis.pair}.</>
                )}
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Data: CFTC Financial Traders Report • Released Mar 29, 2026 • Positions as of Mar 24, 2026
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default COTPairAnalyzer;
