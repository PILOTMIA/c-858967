import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wheat } from "lucide-react";
import { latestHistoryRows, useCOTHistory } from "@/hooks/useCOTHistory";
import COTFreshnessBadge from "@/components/COTFreshnessBadge";

const AGRICULTURE = [
  ["CORN", "Corn", "CBOT"], ["WHEAT", "Wheat SRW", "CBOT"], ["SOYBEAN", "Soybeans", "CBOT"],
  ["SUGAR", "Sugar No. 11", "ICE"], ["COTTON", "Cotton No. 2", "ICE"], ["COFFEE", "Coffee C", "ICE"],
  ["COCOA", "Cocoa", "ICE"], ["CATTLE", "Live Cattle", "CME"], ["HOGS", "Lean Hogs", "CME"],
] as const;

const AgricultureCOT = () => {
  const { data, isLoading } = useCOTHistory();
  const rows = useMemo(() => {
    const latest = latestHistoryRows(data);
    return AGRICULTURE.map(([code, commodity, exchange]) => {
      const row = latest.get(code);
      return row ? { ...row, code, commodity, exchange, weekly: Number(row.change_long ?? 0) - Number(row.change_short ?? 0) } : null;
    }).filter((row): row is NonNullable<typeof row> => Boolean(row));
  }, [data]);

  return (
    <Card className="hq-panel p-5 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="rounded-sm border border-primary/30 bg-primary/10 p-2"><Wheat className="h-5 w-5 text-primary" /></div>
          <div><h2 className="text-xl font-black uppercase text-foreground">Agriculture positioning</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Managed-money flows that can precede food inflation, yield repricing and USD moves.</p></div>
        </div>
        <COTFreshnessBadge />
      </div>
      {isLoading ? <div className="h-40 animate-pulse rounded-sm bg-muted" /> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const bullish = row.net_position >= 0;
            const flowUp = row.weekly >= 0;
            const total = row.long_positions + row.short_positions;
            const longPct = total ? row.long_positions / total * 100 : 50;
            return <article key={row.code} className="rounded-sm border border-border/60 bg-background/50 p-4">
              <div className="flex items-start justify-between gap-2"><div><div className="font-bold text-foreground">{row.commodity}</div><div className="font-mono text-[10px] text-muted-foreground">{row.exchange} · {row.code}</div></div><Badge variant="outline" className={bullish ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}>{bullish ? "NET LONG" : "NET SHORT"}</Badge></div>
              <div className={`mt-4 font-mono text-2xl font-bold ${bullish ? "text-success" : "text-destructive"}`}>{bullish ? "+" : ""}{row.net_position.toLocaleString()}</div>
              <div className={`mt-1 flex items-center gap-1 font-mono text-xs ${flowUp ? "text-success" : "text-destructive"}`}>{flowUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{flowUp ? "+" : ""}{row.weekly.toLocaleString()} WoW</div>
              <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-muted"><span className="bg-success" style={{ width: `${longPct}%` }} /><span className="bg-destructive" style={{ width: `${100 - longPct}%` }} /></div>
              <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground"><span>L {row.long_positions.toLocaleString()}</span><span>S {row.short_positions.toLocaleString()}</span></div>
            </article>;
          })}
        </div>
      )}
      <p className="mt-5 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground">Rising grain and livestock positioning can flag stickier food inflation. Confirm every COT read with current price action before trading.</p>
    </Card>
  );
};

export default AgricultureCOT;