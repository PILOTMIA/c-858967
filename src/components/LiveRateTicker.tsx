import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, Radio } from "lucide-react";
import { useLiveBoard, BOARD_PAIRS } from "@/components/LivePriceBoard";

/**
 * Scrolling live rate ticker with an explicit freshness indicator so traders
 * always know whether a quote is live, delayed, or coming from cache.
 */

const decimals = (pair: string) => (pair.includes("JPY") ? 3 : 5);

const LiveRateTicker = () => {
  const { data, isLoading, error } = useLiveBoard();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ageSec = data ? Math.max(0, Math.round((now - data.fetchedAt) / 1000)) : null;
  const anyCached = data ? Object.values(data.rates).some((r) => r.source.includes("fallback")) : false;

  const status = (() => {
    if (error || !data) return { label: "Feed unavailable", tone: "bad" as const };
    if (anyCached) return { label: "Some quotes cached", tone: "warn" as const };
    if (ageSec !== null && ageSec > 180) return { label: `Delayed · ${Math.floor(ageSec / 60)}m old`, tone: "warn" as const };
    if (ageSec !== null && ageSec > 90) return { label: `Delayed · ${ageSec}s old`, tone: "warn" as const };
    return { label: `Live · updated ${ageSec ?? 0}s ago`, tone: "good" as const };
  })();

  const toneClass =
    status.tone === "good"
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : status.tone === "warn"
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-rose-400 border-rose-500/40 bg-rose-500/10";

  const rows = data ? BOARD_PAIRS.map((p) => data.rates[p]).filter(Boolean) : [];
  const items = rows.length ? [...rows, ...rows] : [];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm">
      <div className="flex items-stretch">
        <div
          className={`flex shrink-0 items-center gap-2 border-r border-border/40 px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap ${toneClass}`}
        >
          <Radio className={`h-3 w-3 ${status.tone === "good" ? "animate-pulse" : ""}`} />
          <span>{status.label}</span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {isLoading || !items.length ? (
            <div className="px-4 py-2 text-[11px] text-muted-foreground">
              {error ? "Quotes are temporarily unavailable — nothing shown rather than stale prices." : "Loading live quotes…"}
            </div>
          ) : (
            <div className="flex w-max animate-ticker gap-6 py-2 pl-4 hover:[animation-play-state:paused]">
              {items.map((r, i) => {
                const change =
                  r.prevClose && r.prevClose > 0 ? ((r.rate - r.prevClose) / r.prevClose) * 100 : undefined;
                const up = (change ?? 0) > 0;
                const flat = change === undefined || Math.abs(change) < 0.01;
                const cached = r.source.includes("fallback");
                return (
                  <span key={`${r.pair}-${i}`} className="flex items-center gap-1.5 whitespace-nowrap text-[11px] sm:text-xs">
                    <span className="font-semibold tracking-wide text-muted-foreground">{r.pair}</span>
                    <span className="font-semibold tabular-nums text-foreground">{r.rate.toFixed(decimals(r.pair))}</span>
                    {flat ? (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    ) : up ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-rose-400" />
                    )}
                    <span
                      className={`tabular-nums ${
                        flat ? "text-muted-foreground" : up ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {change === undefined ? "—" : `${up ? "+" : ""}${change.toFixed(2)}%`}
                    </span>
                    {cached && <span className="text-[9px] text-amber-400 uppercase">cached</span>}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveRateTicker;
