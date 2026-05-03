import { useMemo, useState } from "react";
import { ArrowRight, Crosshair, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
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

    return {
      score,
      flow,
      pairBias: bullishPair ? `Bullish ${pair}` : `Bearish ${pair}`,
      goldBias,
      goldText: usdWeak
        ? `${pair} points to USD weakness. That usually supports XAUUSD if yields are flat or falling.`
        : `${pair} points to USD strength. That can cap XAUUSD rallies unless risk-off demand is strong.`,
      changeText: `${base}: ${format(baseData.weekly)} weekly change. ${quote}: ${format(quoteData.weekly)} weekly change.`,
    };
  }, [base, pair, quote]);

  return (
    <Card className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <Crosshair className="h-5 w-5 text-primary" />
            COT Trade Map
          </CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A fast read of what changed, what it favors, and how that can affect XAUUSD and USD pairs.
          </p>
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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Selected Pair</p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-foreground">
              {base}<ArrowRight className="h-5 w-5 text-muted-foreground" />{quote}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">COT Bias</p>
            <div className={`mt-2 flex items-center gap-2 text-xl font-bold ${map.score >= 0 ? "text-success" : "text-destructive"}`}>
              {map.score >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {map.pairBias}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Weekly Flow</p>
            <p className={`mt-2 text-2xl font-bold ${map.flow >= 0 ? "text-success" : "text-destructive"}`}>{map.flow >= 0 ? "+" : ""}{map.flow.toFixed(1)}K</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Gold Read</p>
            <p className={`mt-2 text-xl font-bold ${map.goldBias.includes("Bullish") ? "text-warning" : "text-foreground"}`}>{map.goldBias}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <Badge variant="outline" className="border-border text-sm text-foreground">What changed</Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{map.changeText}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <Badge variant="outline" className="border-border text-sm text-foreground">Trade implication</Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{map.goldText}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default COTTradeMap;
