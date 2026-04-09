import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield, Building2, BarChart3, Landmark } from "lucide-react";

// COT positions from CFTC report April 7, 2026 (as of March 31, 2026)
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
  EUR: { netPosition: 3947, long: 106291, short: 102344, sentiment: 'NEUTRAL', weeklyChange: 17485, dealerLong: 48543, dealerShort: 357954, dealerWeeklyChange: 8548, assetManagerLong: 431246, assetManagerShort: 166829, assetManagerWeeklyChange: -6598 },
  GBP: { netPosition: 29932, long: 58402, short: 28470, sentiment: 'BULLISH', weeklyChange: 14216, dealerLong: 132294, dealerShort: 51454, dealerWeeklyChange: -7493, assetManagerLong: 23458, assetManagerShort: 124990, assetManagerWeeklyChange: 1495 },
  JPY: { netPosition: -46182, long: 77232, short: 123414, sentiment: 'BEARISH', weeklyChange: 8670, dealerLong: 65995, dealerShort: 52624, dealerWeeklyChange: -12818, assetManagerLong: 63211, assetManagerShort: 66856, assetManagerWeeklyChange: -5811 },
  CHF: { netPosition: 1490, long: 10695, short: 9205, sentiment: 'NEUTRAL', weeklyChange: 1255, dealerLong: 48430, dealerShort: 4780, dealerWeeklyChange: 2473, assetManagerLong: 5758, assetManagerShort: 45566, assetManagerWeeklyChange: -2349 },
  AUD: { netPosition: 52569, long: 76188, short: 23619, sentiment: 'BULLISH', weeklyChange: 3424, dealerLong: 30591, dealerShort: 158593, dealerWeeklyChange: 1326, assetManagerLong: 103136, assetManagerShort: 58503, assetManagerWeeklyChange: 1997 },
  CAD: { netPosition: -42910, long: 28325, short: 71235, sentiment: 'BEARISH', weeklyChange: -11210, dealerLong: 64103, dealerShort: 36157, dealerWeeklyChange: 2254, assetManagerLong: 64749, assetManagerShort: 60401, assetManagerWeeklyChange: -3939 },
  MXN: { netPosition: 52803, long: 76213, short: 23410, sentiment: 'BULLISH', weeklyChange: -1984, dealerLong: 24594, dealerShort: 41544, dealerWeeklyChange: -542, assetManagerLong: 73258, assetManagerShort: 39368, assetManagerWeeklyChange: -3524 },
  NZD: { netPosition: -17798, long: 5752, short: 23550, sentiment: 'BEARISH', weeklyChange: -1068, dealerLong: 50305, dealerShort: 6700, dealerWeeklyChange: 3672, assetManagerLong: 6601, assetManagerShort: 34236, assetManagerWeeklyChange: -2910 },
  USD: { netPosition: 0, long: 0, short: 0, sentiment: 'NEUTRAL', weeklyChange: 0, dealerLong: 0, dealerShort: 0, dealerWeeklyChange: 0, assetManagerLong: 0, assetManagerShort: 0, assetManagerWeeklyChange: 0 },
};

// US 10-Year Treasury Note data
const US10Y_DATA = {
  yield: 4.32,
  weeklyChange: -0.08,
  trend: 'falling' as const,
  interpretation: {
    falling: 'Falling yields signal risk-off sentiment and weaker USD demand. Traders move capital out of US bonds, reducing dollar buying pressure.',
    rising: 'Rising yields attract global capital into US bonds, increasing USD demand. Higher yields = stronger dollar as investors seek safe returns.',
    stable: 'Stable yields suggest consolidation. Watch for breakout direction for the next USD move.',
  },
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'MXN'];

const FLAG_EMOJIS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CHF: '🇨🇭', AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿', MXN: '🇲🇽',
};

const COTPairAnalyzer = () => {
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [quoteCurrency, setQuoteCurrency] = useState('JPY');

  const isUSDPair = baseCurrency === 'USD' || quoteCurrency === 'USD';

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

  // Generate concise Smart Money Insight (≤150 words)
  const smartMoneyInsight = useMemo(() => {
    if (!analysis) return null;

    const base = analysis.base;
    const quote = analysis.quote;
    const baseName = base.currency;
    const quoteName = quote.currency;

    const baseDir = base.netPosition > 0 ? 'long' : 'short';
    const quoteDir = quote.netPosition > 0 ? 'long' : 'short';

    // Alignment check
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

    // Weekly flow
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
        <CardDescription>
          Compare institutional positioning between any two currencies. CFTC report April 7, 2026 (as of March 31).
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

        {analysis && smartMoneyInsight && (
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

            {/* US 10-Year Treasury Note — only for USD pairs */}
            {isUSDPair && (
              <div className="rounded-xl bg-chart-1/5 p-5 border border-chart-1/20">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark className="w-5 h-5 text-chart-1" />
                  <span className="font-semibold text-foreground text-sm">US 10-Year Treasury Note (US10Y)</span>
                  <Badge variant="outline" className="text-[10px] border-chart-1/30 text-chart-1">Bond Market</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Current Yield</div>
                    <div className="text-xl font-mono font-bold text-foreground">{US10Y_DATA.yield}%</div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Weekly Change</div>
                    <div className={`text-xl font-mono font-bold ${US10Y_DATA.weeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
                      {US10Y_DATA.weeklyChange > 0 ? '+' : ''}{US10Y_DATA.weeklyChange}%
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 border border-border/10 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Trend</div>
                    <div className={`text-sm font-bold flex items-center justify-center gap-1 ${
                      US10Y_DATA.trend === 'rising' ? 'text-success' : US10Y_DATA.trend === 'falling' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {US10Y_DATA.trend === 'rising' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {US10Y_DATA.trend.charAt(0).toUpperCase() + US10Y_DATA.trend.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="bg-background/30 rounded-lg p-3 border border-border/10">
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong className="text-chart-1">Impact on USD:</strong>{' '}
                    {US10Y_DATA.interpretation[US10Y_DATA.trend]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 The 10Y yield is a key driver for {baseCurrency === 'USD' ? `${baseCurrency}/${quoteCurrency}` : `${baseCurrency}/${quoteCurrency}`}. 
                    {US10Y_DATA.trend === 'falling' 
                      ? baseCurrency === 'USD' 
                        ? ` Falling yields are bearish for USD — watch for ${quoteCurrency} strength.`
                        : ` Falling yields weaken USD — this supports ${baseCurrency} upside.`
                      : US10Y_DATA.trend === 'rising'
                        ? baseCurrency === 'USD'
                          ? ` Rising yields support USD — expect ${baseCurrency} strength against ${quoteCurrency}.`
                          : ` Rising yields strengthen USD — this creates headwinds for ${baseCurrency}.`
                        : ' Monitor for a directional break in yields.'}
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
                Data: CFTC Financial Traders Report • Released April 7, 2026 • Positions as of March 31, 2026
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default COTPairAnalyzer;
