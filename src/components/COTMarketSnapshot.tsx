import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Radio, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import COTFreshnessBadge from "@/components/COTFreshnessBadge";
import { latestHistoryRows, useCOTHistory } from "@/hooks/useCOTHistory";

const GROUPS = {
  FX: ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "MXN", "USD"],
  Metals: ["XAU", "XAG", "HG", "XPT"],
  Energy: ["WTI", "NG"],
  Agriculture: ["CORN", "WHEAT", "SOYBEAN", "SUGAR", "COFFEE", "COTTON", "COCOA", "CATTLE", "HOGS"],
  Risk: ["SP500", "NASDAQ", "VIX", "BTC"],
} as const;

type Group = keyof typeof GROUPS;

const fmt = (value: number) => Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();

const COTMarketSnapshot = () => {
  const { data, isLoading } = useCOTHistory();
  const [group, setGroup] = useState<Group>("FX");
  const rows = useMemo(() => {
    const latest = latestHistoryRows(data);
    return GROUPS[group]
      .map((currency) => latest.get(currency))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((row) => ({ ...row, weekly: Number(row.change_long ?? 0) - Number(row.change_short ?? 0) }))
      .sort((a, b) => Math.abs(b.weekly) - Math.abs(a.weekly));
  }, [data, group]);

  return (
    <section className="hq-panel p-4 sm:p-5" aria-label="Latest COT positioning changes">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="hq-kicker"><Radio className="h-3 w-3" /> Latest positioning tape</div>
          <h2 className="mt-1 text-xl font-extrabold uppercase text-foreground">What changed this week</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <COTFreshnessBadge />
          <div className="hq-segment" aria-label="Market group">
            {(Object.keys(GROUPS) as Group[]).map((item) => (
              <Button key={item} size="sm" variant="ghost" className={group === item ? "hq-segment-active" : ""} onClick={() => setGroup(item)}>
                {item}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? <div className="mt-4 h-40 animate-pulse rounded-md bg-muted/40" /> : (
        <div className="mt-4 grid gap-px overflow-hidden rounded-md border border-border/60 bg-border/60 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const netLong = row.net_position >= 0;
            const building = row.weekly >= 0;
            const total = row.long_positions + row.short_positions;
            const longPct = total ? row.long_positions / total * 100 : 50;
            return (
              <article key={row.currency} className="bg-card p-4 transition-colors hover:bg-secondary/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-lg font-bold text-foreground">{row.currency}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">{netLong ? "Net long" : "Net short"}</div>
                  </div>
                  <div className={`flex items-center gap-1 font-mono text-sm font-bold ${building ? "text-success" : "text-destructive"}`}>
                    {building ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {building ? "+" : ""}{fmt(row.weekly)}
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className={`font-mono text-2xl font-bold ${netLong ? "text-success" : "text-destructive"}`}>
                    {netLong ? "+" : ""}{fmt(row.net_position)}
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground">L {row.long_positions.toLocaleString()}<br />S {row.short_positions.toLocaleString()}</div>
                </div>
                <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="bg-success" style={{ width: `${longPct}%` }} />
                  <span className="bg-destructive" style={{ width: `${100 - longPct}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase text-muted-foreground"><SlidersHorizontal className="h-3 w-3" /> Sorted by largest weekly positioning change</div>
    </section>
  );
};

export default COTMarketSnapshot;