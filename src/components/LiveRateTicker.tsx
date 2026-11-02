import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Radio, RefreshCw } from "lucide-react";
import { useLiveBoard, BOARD_PAIRS } from "./LivePriceBoard";
import { quoteStatus, quoteChange } from "@/lib/quoteQuality";
import { Button } from "@/components/ui/button";

export default function LiveRateTicker({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, error, refetch, isFetching } = useLiveBoard();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const rows = data && !error ? BOARD_PAIRS.map(p => data.rates[p]).filter(Boolean) : [];
  return <div className={`flex overflow-hidden bg-card text-foreground ${compact ? "h-[45px]" : "min-h-12 rounded-md border border-border"}`}>
    <div className="flex shrink-0 items-center gap-2 border-r border-border px-3 text-xs text-muted-foreground">
      <Radio className="h-3 w-3" /><span className="hidden sm:inline">{error ? "Feed unavailable" : "API quotes"}</span>
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Refresh market quotes" aria-label="Refresh market quotes" disabled={isFetching} onClick={() => refetch()}><RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} /></Button>
    </div>
    <div className="min-w-0 flex-1 overflow-hidden">
      {!rows.length ? <p className="px-4 py-3 text-xs text-muted-foreground">{isLoading ? "Loading market quotes…" : "Quotes unavailable — no substitute prices."}</p> :
      <div className="flex h-full w-max items-center gap-8 px-4 animate-ticker hover:[animation-play-state:paused]">
        {[...rows, ...rows].map((r,i) => {
          const change = quoteChange(r), status = quoteStatus(r,now);
          const sourceTime = r.asOf ? new Date(r.asOf).toLocaleString() : "Time unavailable";
          return <span key={`${r.pair}-${i}`} title={`${r.source} · ${sourceTime} · ${status}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs">
            <span className="font-semibold text-foreground">{r.pair}</span><span className="font-mono tabular-nums">{r.rate.toFixed(["XAUUSD", "BTCUSD", "SP500", "DXY"].includes(r.pair) ? 2 : r.pair.includes("JPY") || r.pair === "US10Y" ? 3 : 5)}{r.pair === "US10Y" ? "% yield" : ""}</span>
            {change !== undefined && <span className={`flex items-center gap-0.5 ${change >= 0 ? "text-success" : "text-destructive"}`}>{change >= 0 ? <ArrowUpRight className="h-3 w-3"/> : <ArrowDownRight className="h-3 w-3"/>}{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>}
            <span className={status === "Market quote" ? "text-muted-foreground" : "text-warning"}>{status} · {r.asOf ? new Date(r.asOf).toLocaleString([], {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}</span>
          </span>;
        })}
      </div>}
    </div>
  </div>;
}
