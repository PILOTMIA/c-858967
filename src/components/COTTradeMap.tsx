import { useMemo, useState } from "react";
import { ArrowRight, Crosshair, ShieldCheck, TrendingDown, TrendingUp, Target, Gauge, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const POSITIONS: Record<string, { net: number; weekly: number; label: string }> = {
  EUR: { net: 11594, weekly: -8723, label: "EUR longs reduced" },
  GBP: { net: 28882, weekly: -255, label: "GBP longs steady" },
  JPY: { net: -75802, weekly: -7305, label: "JPY shorts expanded" },
  CAD: { net: -53828, weekly: 10387, label: "CAD shorts covered" },
  AUD: { net: 47855, weekly: -470, label: "AUD longs steady" },
  NZD: { net: -16833, weekly: 1229, label: "NZD shorts reduced" },
  CHF: { net: -5174, weekly: -1408, label: "CHF flipped short" },
  USD: { net: 0, weekly: 0, label: "USD read comes from pair differential" },
};

const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCAD", "AUDUSD", "NZDUSD", "USDCHF"];

const format = (value: number) => `${value > 0 ? "+" : ""}${(value / 1000).toFixed(1)}K`;

const splitPair = (pair: string) => [pair.slice(0, 3), pair.slice(3, 6)] as const;

/** Visual conviction bar */
const ConvictionMeter = ({ score, max = 150 }: { score: number; max?: number }) => {
  const pct = Math.min(Math.abs(score) / max * 100, 100);
  const positive = score >= 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Conviction Strength</span>
        <span className={positive ? "text-success font-semibold" : "text-destructive font-semibold"}>
          {score >= 0 ? "+" : ""}{score.toFixed(0)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${positive ? "bg-gradient-to-r from-success/60 to-success" : "bg-gradient-to-r from-destructive/60 to-destructive"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const COTTradeMap = () => {
  const [pair, setPair] = useState("EURUSD");
  const [base, quote] = splitPair(pair);

  const map = useMemo(() => {
    const baseData = POSITIONS[base];
    const quoteData = POSITIONS[quote];
    const score = (baseData.net - quoteData.net) / 1000;
    const flow = (baseData.weekly - quoteData.weekly) / 1000;
    const bullishPair = score > 0;
    const usdIsQuote = quote === "USD";
    const usdWeak = usdIsQuote ? bullishPair : !bullishPair;
    const goldBias = usdWeak ? "Bullish XAUUSD" : "Cautious XAUUSD";
    const flowAligned = bullishPair ? flow > 0 : flow < 0;
    const conviction = Math.abs(score) > 60 && flowAligned ? "High" : Math.abs(score) > 20 ? "Medium" : "Low";
    const action = bullishPair
      ? `Look for BUY setups on ${pair} — institutions favor ${base} over ${quote}.`
      : `Look for SELL setups on ${pair} — institutions favor ${quote} over ${base}.`;

    return {
      score,
      flow,
      pairBias: bullishPair ? `Bullish ${pair}` : `Bearish ${pair}`,
      goldBias,
      goldText: usdWeak
        ? `${pair} points to USD weakness. That usually supports XAUUSD if yields are flat or falling.`
        : `${pair} points to USD strength. That can cap XAUUSD rallies unless risk-off demand is strong.`,
      changeBase: `${base}: ${format(baseData.weekly)} weekly (${baseData.label})`,
      changeQuote: `${quote}: ${format(quoteData.weekly)} weekly (${quoteData.label})`,
      flowAligned,
      conviction,
      action,
      baseData,
      quoteData,
    };
  }, [base, pair, quote]);

  const convBadgeClass =
    map.conviction === "High" ? "bg-success/15 text-success border-success/30" :
    map.conviction === "Medium" ? "bg-warning/15 text-warning border-warning/30" :
    "bg-muted text-muted-foreground border-border";

  return (
    <Card className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Crosshair className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">COT Trade Map</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Institutional positioning decoded into actionable trade signals
            </p>
          </div>
        </div>
        <Select value={pair} onValueChange={setPair}>
          <SelectTrigger className="w-full border-border bg-background text-foreground sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAIRS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Hero signal strip */}
        <div className={`rounded-xl p-5 border ${map.score >= 0 ? "border-success/20 bg-success/[0.04]" : "border-destructive/20 bg-destructive/[0.04]"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${map.score >= 0 ? "bg-success/15" : "bg-destructive/15"}`}>
                {map.score >= 0 ? <TrendingUp className="h-6 w-6 text-success" /> : <TrendingDown className="h-6 w-6 text-destructive" />}
              </div>
              <div>
                <div className={`text-2xl font-bold ${map.score >= 0 ? "text-success" : "text-destructive"}`}>
                  {map.pairBias}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{map.action}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs font-bold ${convBadgeClass}`}>
                <Gauge className="h-3 w-3 mr-1" />
                {map.conviction} Conviction
              </Badge>
              {map.flowAligned && (
                <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                  Flow Aligned
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4">
            <ConvictionMeter score={map.score} />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <BarChart3 className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Net Diff</p>
            <p className={`text-xl font-bold mt-1 ${map.score >= 0 ? "text-success" : "text-destructive"}`}>
              {map.score >= 0 ? "+" : ""}{map.score.toFixed(1)}K
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Weekly Flow</p>
            <p className={`text-xl font-bold mt-1 ${map.flow >= 0 ? "text-success" : "text-destructive"}`}>
              {map.flow >= 0 ? "+" : ""}{map.flow.toFixed(1)}K
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Target className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{base} Net</p>
            <p className={`text-xl font-bold mt-1 ${map.baseData.net >= 0 ? "text-success" : "text-destructive"}`}>
              {(map.baseData.net / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Target className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{quote} Net</p>
            <p className={`text-xl font-bold mt-1 ${map.quoteData.net >= 0 ? "text-success" : "text-destructive"}`}>
              {(map.quoteData.net / 1000).toFixed(1)}K
            </p>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{base} Flow</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{map.changeBase}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{quote} Flow</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{map.changeQuote}</p>
          </div>
          <div className={`rounded-xl border p-4 ${map.goldBias.includes("Bullish") ? "border-warning/20 bg-warning/[0.03]" : "border-border bg-background"}`}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">🥇</span>
              <span className="text-xs font-semibold text-foreground">Gold Read</span>
            </div>
            <p className={`text-sm font-bold mb-1 ${map.goldBias.includes("Bullish") ? "text-warning" : "text-foreground"}`}>{map.goldBias}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{map.goldText}</p>
          </div>
        </div>
      </CardContent>

      <div className="px-6 py-3 border-t border-border bg-muted/20">
        <p className="text-[10px] text-muted-foreground text-center">
          Source: CFTC Disaggregated Report (April 28, 2026) • Leveraged fund positioning • Not financial advice
        </p>
      </div>
    </Card>
  );
};

export default COTTradeMap;
