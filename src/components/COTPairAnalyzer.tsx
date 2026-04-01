import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield, Building2, BarChart3 } from "lucide-react";

// COT positions from March 29, 2026 CFTC report (data as of March 24, 2026)
// All categories: Leveraged Funds, Dealer/Intermediary, Asset Manager/Institutional
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
  EUR: { netPosition: -13538, long: 97985, short: 111523, sentiment: 'BEARISH', weeklyChange: -6586, dealerLong: 39995, dealerShort: 357133, dealerWeeklyChange: 13278, assetManagerLong: 446373, assetManagerShort: 158433, assetManagerWeeklyChange: -6598 },
  GBP: { netPosition: 15716, long: 47450, short: 31734, sentiment: 'BULLISH', weeklyChange: 3948, dealerLong: 128153, dealerShort: 46144, dealerWeeklyChange: -7493, assetManagerLong: 28499, assetManagerShort: 122962, assetManagerWeeklyChange: 1495 },
  JPY: { netPosition: -54852, long: 67921, short: 122773, sentiment: 'BEARISH', weeklyChange: 10577, dealerLong: 60117, dealerShort: 42836, dealerWeeklyChange: -12818, assetManagerLong: 58266, assetManagerShort: 64516, assetManagerWeeklyChange: -5811 },
  CHF: { netPosition: 235, long: 7950, short: 7715, sentiment: 'NEUTRAL', weeklyChange: -278, dealerLong: 47188, dealerShort: 6284, dealerWeeklyChange: 2473, assetManagerLong: 5541, assetManagerShort: 42537, assetManagerWeeklyChange: -2349 },
  AUD: { netPosition: 49145, long: 68577, short: 19432, sentiment: 'BULLISH', weeklyChange: 3786, dealerLong: 32930, dealerShort: 152299, dealerWeeklyChange: 1326, assetManagerLong: 103155, assetManagerShort: 59229, assetManagerWeeklyChange: 1997 },
  CAD: { netPosition: -31700, long: 26751, short: 58451, sentiment: 'BEARISH', weeklyChange: 6152, dealerLong: 30119, dealerShort: 37684, dealerWeeklyChange: 2254, assetManagerLong: 67647, assetManagerShort: 41518, assetManagerWeeklyChange: -3939 },
  MXN: { netPosition: 54787, long: 75059, short: 20272, sentiment: 'BULLISH', weeklyChange: 7841, dealerLong: 8722, dealerShort: 44498, dealerWeeklyChange: -542, assetManagerLong: 72526, assetManagerShort: 23942, assetManagerWeeklyChange: -3524 },
  NZD: { netPosition: -16730, long: 7461, short: 24191, sentiment: 'BEARISH', weeklyChange: -813, dealerLong: 43769, dealerShort: 4053, dealerWeeklyChange: 3672, assetManagerLong: 6572, assetManagerShort: 31584, assetManagerWeeklyChange: -2910 },
  USD: { netPosition: 0, long: 0, short: 0, sentiment: 'NEUTRAL', weeklyChange: 0, dealerLong: 0, dealerShort: 0, dealerWeeklyChange: 0, assetManagerLong: 0, assetManagerShort: 0, assetManagerWeeklyChange: 0 },
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

            {/* Smart Money Insight */}
            <div className="rounded-xl bg-primary/5 p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Smart Money Insight</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {(() => {
                  const baseNet = analysis.base.netPosition;
                  const quoteNet = analysis.quote.netPosition;
                  const baseDesc = baseNet > 0 
                    ? `net long ${baseCurrency} (${formatContracts(baseNet)} contracts)` 
                    : `net short ${baseCurrency} (${formatContracts(Math.abs(baseNet))} contracts)`;
                  const quoteDesc = quoteNet > 0 
                    ? `net long ${quoteCurrency} (${formatContracts(quoteNet)} contracts)` 
                    : `net short ${quoteCurrency} (${formatContracts(Math.abs(quoteNet))} contracts)`;
                  
                  const baseChg = analysis.base.weeklyChange;
                  const quoteChg = analysis.quote.weeklyChange;
                  const baseChgDesc = baseChg > 0 
                    ? `adding ${formatContracts(Math.abs(baseChg))} net long contracts` 
                    : `adding ${formatContracts(Math.abs(baseChg))} net short contracts`;
                  const quoteChgDesc = quoteChg > 0 
                    ? `adding ${formatContracts(Math.abs(quoteChg))} net long contracts` 
                    : `adding ${formatContracts(Math.abs(quoteChg))} net short contracts`;

                  // Dealer & AM alignment check
                  const baseDealerNet = analysis.base.dealerLong - analysis.base.dealerShort;
                  const quoteDealerNet = analysis.quote.dealerLong - analysis.quote.dealerShort;
                  const baseAMNet = analysis.base.assetManagerLong - analysis.base.assetManagerShort;
                  const quoteAMNet = analysis.quote.assetManagerLong - analysis.quote.assetManagerShort;
                  
                  const dealerFavorsBase = baseDealerNet - quoteDealerNet > 0;
                  const amFavorsBase = baseAMNet - quoteAMNet > 0;
                  const leveragedFavorsBase = analysis.isBullish;
                  
                  const allAligned = (dealerFavorsBase === amFavorsBase) && (amFavorsBase === leveragedFavorsBase);
                  const twoOfThree = (dealerFavorsBase === amFavorsBase) || (amFavorsBase === leveragedFavorsBase) || (dealerFavorsBase === leveragedFavorsBase);

                  const alignmentNote = allAligned 
                    ? <> <strong className="text-primary">All three institutional categories (Dealers, Asset Managers, Leveraged Funds) are aligned</strong> — high conviction signal.</>
                    : twoOfThree 
                    ? <> Two of three institutional categories agree on direction — moderate conviction.</>
                    : <> Institutional categories are divergent — exercise caution.</>;

                  if (analysis.isBullish) {
                    return (
                      <>Leveraged funds are {baseDesc} and {quoteDesc}. 
                      This week, {baseCurrency} positioning shifted with funds {baseChgDesc}, while {quoteCurrency} saw funds {quoteChgDesc}. 
                      The net differential favors <strong className="text-success">{baseCurrency}</strong> strength, creating a <strong className="text-success">{analysis.verdict.toLowerCase()}</strong> institutional bias for {baseCurrency}/{quoteCurrency}.{alignmentNote}</>
                    );
                  } else {
                    return (
                      <>Leveraged funds are {baseDesc} and {quoteDesc}. 
                      This week, {baseCurrency} positioning shifted with funds {baseChgDesc}, while {quoteCurrency} saw funds {quoteChgDesc}. 
                      The net differential favors <strong className="text-success">{quoteCurrency}</strong> strength, creating a <strong className="text-destructive">{analysis.verdict.toLowerCase()}</strong> institutional bias for {baseCurrency}/{quoteCurrency}.{alignmentNote}</>
                    );
                  }
                })()}
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
