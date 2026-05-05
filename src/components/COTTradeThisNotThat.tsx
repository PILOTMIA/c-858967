import { useMemo } from "react";
import { CheckCircle2, XCircle, ArrowRight, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const POSITIONS: Record<string, { net: number; weekly: number }> = {
  EUR: { net: 11594, weekly: -8723 },
  GBP: { net: 28882, weekly: -255 },
  JPY: { net: -75802, weekly: -7305 },
  CAD: { net: -53828, weekly: 10387 },
  AUD: { net: 47855, weekly: -470 },
  NZD: { net: -16833, weekly: 1229 },
  CHF: { net: -5174, weekly: -1408 },
};

interface TradeIdea {
  pair: string;
  direction: "BUY" | "SELL";
  reason: string;
  conviction: "High" | "Medium" | "Low";
  netDiff: number;
  flowAlign: boolean;
}

const PAIR_MAP: [string, string, string][] = [
  ["EURUSD", "EUR", "USD"],
  ["GBPUSD", "GBP", "USD"],
  ["USDJPY", "USD", "JPY"],
  ["USDCAD", "USD", "CAD"],
  ["AUDUSD", "AUD", "USD"],
  ["NZDUSD", "NZD", "USD"],
  ["USDCHF", "USD", "CHF"],
  ["EURJPY", "EUR", "JPY"],
  ["GBPJPY", "GBP", "JPY"],
  ["AUDJPY", "AUD", "JPY"],
  ["EURGBP", "EUR", "GBP"],
  ["AUDNZD", "AUD", "NZD"],
  ["GBPCHF", "GBP", "CHF"],
  ["CADJPY", "CAD", "JPY"],
];

function buildIdeas(): TradeIdea[] {
  return PAIR_MAP.map(([pair, base, quote]) => {
    const b = POSITIONS[base] ?? { net: 0, weekly: 0 };
    const q = POSITIONS[quote] ?? { net: 0, weekly: 0 };
    const netDiff = b.net - q.net;
    const flowDiff = b.weekly - q.weekly;
    const bullish = netDiff > 0;
    const flowAlign = bullish ? flowDiff > 0 : flowDiff < 0;
    const absNet = Math.abs(netDiff);
    const conviction: "High" | "Medium" | "Low" =
      absNet > 60000 && flowAlign ? "High" : absNet > 20000 ? "Medium" : "Low";

    const direction: "BUY" | "SELL" = bullish ? "BUY" : "SELL";
    const reason = bullish
      ? `${base} net longs dominate over ${quote} by ${(absNet / 1000).toFixed(0)}K contracts`
      : `${quote} net longs dominate over ${base} by ${(absNet / 1000).toFixed(0)}K contracts`;

    return { pair, direction, reason, conviction, netDiff, flowAlign };
  });
}

const COTTradeThisNotThat = () => {
  const { tradeThis, notThat } = useMemo(() => {
    const ideas = buildIdeas();
    const sorted = [...ideas].sort((a, b) => {
      const convScore = { High: 3, Medium: 2, Low: 1 };
      return convScore[b.conviction] - convScore[a.conviction] || Math.abs(b.netDiff) - Math.abs(a.netDiff);
    });

    const tradeThis = sorted.filter((i) => i.conviction !== "Low").slice(0, 4);
    const notThat = sorted.filter((i) => i.conviction === "Low" || !i.flowAlign).slice(-4).reverse();

    return { tradeThis, notThat };
  }, []);

  const convictionColor = (c: string) =>
    c === "High" ? "bg-success/15 text-success border-success/30" :
    c === "Medium" ? "bg-warning/15 text-warning border-warning/30" :
    "bg-muted text-muted-foreground border-border";

  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Trade This, Not That</h2>
            <p className="text-sm text-muted-foreground">COT-backed pair selection — favor strong positioning, avoid weak setups</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Trade This */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-bold text-success text-base">Trade This</span>
            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Favored</Badge>
          </div>
          <div className="space-y-3">
            {tradeThis.map((idea) => (
              <div
                key={idea.pair}
                className="group rounded-xl border border-success/15 bg-success/[0.03] p-4 transition-all hover:border-success/30 hover:bg-success/[0.06]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground text-lg">{idea.pair}</span>
                    <Badge className={`text-[10px] font-bold ${idea.direction === "BUY" ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}`}>
                      {idea.direction}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${convictionColor(idea.conviction)}`}>
                    {idea.conviction}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{idea.reason}</p>
                <div className="mt-2 flex items-center gap-2">
                  {idea.flowAlign && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                      <ArrowRight className="h-3 w-3" /> Flow aligned
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    Net diff: {idea.netDiff > 0 ? "+" : ""}{(idea.netDiff / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Not That */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="font-bold text-destructive text-base">Not That</span>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Avoid</Badge>
          </div>
          <div className="space-y-3">
            {notThat.map((idea) => (
              <div
                key={idea.pair}
                className="group rounded-xl border border-destructive/10 bg-destructive/[0.02] p-4 transition-all hover:border-destructive/20 hover:bg-destructive/[0.04]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground/70 text-lg line-through decoration-destructive/40">{idea.pair}</span>
                    <Badge className="bg-muted text-muted-foreground border-border text-[10px]">
                      {idea.direction}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${convictionColor(idea.conviction)}`}>
                    {idea.conviction}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{idea.reason}</p>
                <div className="mt-2 flex items-center gap-2">
                  {!idea.flowAlign && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-destructive/80 font-medium">
                      <Shield className="h-3 w-3" /> Flow diverging
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    Net diff: {idea.netDiff > 0 ? "+" : ""}{(idea.netDiff / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center">
          Based on CFTC Disaggregated Report (April 28, 2026) • Leveraged fund net positioning & weekly flow alignment • Not financial advice
        </p>
      </div>
    </div>
  );
};

export default COTTradeThisNotThat;
