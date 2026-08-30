import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Pause, Play, Globe2, RotateCw, Loader2, SkipForward, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  BANK_BY_CODE,
  CENTRAL_BANKS,
  CotRow,
  FlowArc,
  WeekFrame,
  buildFrames,
  fmtNum,
} from "./currencyFlowData";

const GlobeCurrencyFlow = lazy(() => import("./GlobeCurrencyFlow"));

type Filter = "majors" | "all";

const MAX_WEEKS = 60;

const GlobeSkeleton = () => (
  <div className="flex h-full w-full items-center justify-center gap-3 text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span className="font-mono text-xs uppercase tracking-[0.2em]">Loading globe engine…</span>
  </div>
);

const fmtWeek = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

const CurrencyFlowGlobeWidget = ({ height = 620 }: { height?: number }) => {
  const [frames, setFrames] = useState<WeekFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [colorMode, setColorMode] = useState<"currency" | "direction">("direction");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedArc, setSelectedArc] = useState<FlowArc | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // Newest first so the default view is always the latest CFTC release.
      const { data } = await supabase
        .from("cot_history")
        .select("currency, report_date, net_position, long_positions, short_positions")
        .order("report_date", { ascending: false })
        .limit(1000);
      if (!active) return;
      const rows = [...((data ?? []) as CotRow[])].sort((a, b) =>
        a.report_date.localeCompare(b.report_date),
      );
      const built = buildFrames(rows).slice(-MAX_WEEKS);
      setFrames(built);
      setIndex(Math.max(0, built.length - 1));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= frames.length) {
          setPlaying(false); // rest on the latest release instead of snapping back
          return frames.length - 1;
        }
        return i + 1;
      });
    }, 2200);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const handleSelectBank = useCallback((code: string) => {
    setSelectedBank(code);
    setSelectedArc(null);
  }, []);

  const handleSelectArc = useCallback((arc: FlowArc) => {
    setSelectedArc(arc);
    setSelectedBank(null);
  }, []);

  const frame = frames[index];
  const latestWeek = frames[frames.length - 1]?.week;
  const isLatest = index === frames.length - 1;

  const visibleCodes = useMemo(
    () => CENTRAL_BANKS.filter((b) => (filter === "majors" ? b.major : true)).map((b) => b.code),
    [filter],
  );

  const flows = useMemo(
    () =>
      [...(frame?.arcs ?? [])]
        .filter((a) => visibleCodes.includes(a.from) && visibleCodes.includes(a.to))
        .sort((a, b) => b.magnitude - a.magnitude),
    [frame, visibleCodes],
  );

  const maxMag = Math.max(1, ...flows.map((f) => f.magnitude));
  const topInflow = flows.filter((f) => f.change > 0)[0];
  const topOutflow = flows.filter((f) => f.change < 0)[0];

  const bankPoint = selectedBank ? frame?.points.find((p) => p.code === selectedBank) : undefined;

  return (
    <Card className="modern-surface overflow-hidden border-border/60 bg-[#050912] p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Global Currency Flow
          </span>
          {frame && (
            <Badge variant="outline" className="border-primary/40 font-mono text-[10px] text-foreground">
              Week ending {fmtWeek(frame.week)}
            </Badge>
          )}
          {isLatest && (
            <Badge className="bg-emerald-500/15 font-mono text-[10px] text-emerald-400 hover:bg-emerald-500/15">
              Latest CFTC release
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border/60">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 rounded-none px-3 text-xs ${filter === "majors" ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
              onClick={() => setFilter("majors")}
            >
              Majors
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 rounded-none px-3 text-xs ${filter === "all" ? "bg-primary/20 text-foreground" : "text-muted-foreground"}`}
              onClick={() => setFilter("all")}
            >
              All + Metals
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setColorMode((m) => (m === "direction" ? "currency" : "direction"))}
          >
            Color: {colorMode === "direction" ? "Direction" : "Currency"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setAutoRotate((r) => !r)}
            aria-label="Toggle auto rotate"
            title="Toggle auto rotate"
          >
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div
          className="relative min-w-0 overflow-hidden h-[420px] sm:h-[520px] lg:h-[--globe-h]"
          style={{ ["--globe-h" as string]: `${height}px` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(60,110,255,0.18),transparent_65%)]" />
          {loading ? (
            <GlobeSkeleton />
          ) : (
            <Suspense fallback={<GlobeSkeleton />}>
              <GlobeCurrencyFlow
                frame={frame}
                visibleCodes={visibleCodes}
                colorMode={colorMode}
                autoRotate={autoRotate}
                onSelectBank={handleSelectBank}
                onSelectArc={handleSelectArc}
              />
            </Suspense>
          )}

          <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1 rounded-lg border border-border/50 bg-background/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-md">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="h-1.5 w-6 rounded-full bg-emerald-400" /> Capital rotating in
            </span>
            <span className="flex items-center gap-2 text-rose-400">
              <span className="h-1.5 w-6 rounded-full bg-rose-400" /> Capital rotating out
            </span>
          </div>

          {(bankPoint || selectedArc) && (
            <div className="pointer-events-auto absolute left-4 top-4 w-64 rounded-xl border border-primary/30 bg-background/85 p-4 backdrop-blur-md">
              {bankPoint && selectedBank && (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {BANK_BY_CODE[selectedBank]?.bank}
                  </p>
                  <p className="text-lg font-semibold text-foreground">{selectedBank}</p>
                  <p className="text-xs text-muted-foreground">
                    Net position <span className="font-mono text-foreground">{fmtNum(bankPoint.net)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    WoW change{" "}
                    <span className={`font-mono ${bankPoint.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fmtNum(bankPoint.change)} ({bankPoint.pctChange.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              )}
              {selectedArc && (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Flow</p>
                  <p className="text-lg font-semibold text-foreground">{selectedArc.pair}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedArc.from} → {selectedArc.to}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Net change{" "}
                    <span className={`font-mono ${selectedArc.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fmtNum(selectedArc.change)}
                    </span>
                  </p>
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 h-7 px-2 text-xs"
                onClick={() => {
                  setSelectedArc(null);
                  setSelectedBank(null);
                }}
              >
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Flow leaderboard */}
        <aside className="border-t border-border/50 bg-background/40 p-4 lg:border-l lg:border-t-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Weekly rotation ranking
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
              <p className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> Biggest inflow
              </p>
              <p className="font-mono text-sm text-foreground">{topInflow?.pair ?? "—"}</p>
              <p className="font-mono text-[11px] text-emerald-400">
                {topInflow ? fmtNum(topInflow.change) : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2">
              <p className="flex items-center gap-1 font-mono text-[10px] text-rose-400">
                <ArrowDownRight className="h-3 w-3" /> Biggest outflow
              </p>
              <p className="font-mono text-sm text-foreground">{topOutflow?.pair ?? "—"}</p>
              <p className="font-mono text-[11px] text-rose-400">
                {topOutflow ? fmtNum(topOutflow.change) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {flows.slice(0, 10).map((a) => {
              const pos = a.change >= 0;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedArc(a);
                    setSelectedBank(null);
                  }}
                  className="w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-left transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground">{a.pair}</span>
                    <span className={`font-mono text-xs ${pos ? "text-emerald-400" : "text-rose-400"}`}>
                      {fmtNum(a.change)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className={`h-full rounded-full ${pos ? "bg-emerald-400" : "bg-rose-400"}`}
                      style={{ width: `${Math.max(4, (a.magnitude / maxMag) * 100)}%` }}
                    />
                  </div>
                </button>
              );
            })}
            {flows.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground">No positioning change this week.</p>
            )}
          </div>
        </aside>
      </div>

      <div className="space-y-3 border-t border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={() =>
              setPlaying((p) => {
                if (!p && index >= frames.length - 1) setIndex(0); // replay from the start
                return !p;
              })
            }
            aria-label={playing ? "Pause timeline" : "Play timeline"}
            title={playing ? "Pause timeline" : "Play timeline"}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={() => {
              setPlaying(false);
              setIndex(Math.max(0, frames.length - 1));
            }}
            aria-label="Jump to latest week"
            title="Jump to latest week"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
          <Slider
            value={[index]}
            min={0}
            max={Math.max(0, frames.length - 1)}
            step={1}
            onValueChange={([v]) => {
              setPlaying(false);
              setIndex(v);
            }}
            className="flex-1"
          />
          <span className="w-32 text-right font-mono text-[11px] text-muted-foreground">
            {frame ? fmtWeek(frame.week) : "—"}
          </span>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Source: CFTC Commitments of Traders · non-commercial net positions · latest release{" "}
          {latestWeek ? fmtWeek(latestWeek) : "—"}
        </p>
      </div>
    </Card>
  );
};

export default CurrencyFlowGlobeWidget;
