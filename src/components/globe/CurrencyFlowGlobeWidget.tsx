import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Pause, Globe2, RotateCw, Loader2 } from "lucide-react";
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

const GlobeSkeleton = () => (
  <div className="flex h-full w-full items-center justify-center gap-3 text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span className="font-mono text-xs uppercase tracking-[0.2em]">Loading globe engine…</span>
  </div>
);

const CurrencyFlowGlobeWidget = ({ height = 620 }: { height?: number }) => {
  const [frames, setFrames] = useState<WeekFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [colorMode, setColorMode] = useState<"currency" | "direction">("direction");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedArc, setSelectedArc] = useState<FlowArc | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("cot_history")
        .select("currency, report_date, net_position, long_positions, short_positions")
        .order("report_date", { ascending: true });
      if (!active) return;
      const built = buildFrames((data ?? []) as CotRow[]);
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
      setIndex((i) => (i + 1 >= frames.length ? 0 : i + 1));
    }, 1400);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const frame = frames[index];
  const visibleCodes = useMemo(
    () => CENTRAL_BANKS.filter((b) => (filter === "majors" ? b.major : true)).map((b) => b.code),
    [filter],
  );

  const topFlows = useMemo(
    () => [...(frame?.arcs ?? [])].sort((a, b) => b.magnitude - a.magnitude).slice(0, 6),
    [frame],
  );

  const bankPoint = selectedBank ? frame?.points.find((p) => p.code === selectedBank) : undefined;

  return (
    <Card className="modern-surface overflow-hidden border-border/60 bg-[#050912] p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Global Currency Flow
          </span>
          {frame && (
            <Badge variant="outline" className="font-mono text-[10px]">
              Week ending {frame.week}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={filter === "majors" ? "default" : "outline"} onClick={() => setFilter("majors")}>
            Majors
          </Button>
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setColorMode((m) => (m === "direction" ? "currency" : "direction"))}
          >
            Color: {colorMode === "direction" ? "Direction" : "Currency"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAutoRotate((r) => !r)}>
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? "text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(60,110,255,0.18),transparent_65%)]" />
        {loading ? (
          <GlobeSkeleton />
        ) : (
          <Suspense fallback={<GlobeSkeleton />}>
            <GlobeCurrencyFlow
              frame={frame}
              visibleCodes={visibleCodes}
              colorMode={colorMode}
              autoRotate={autoRotate}
              onSelectBank={(code) => {
                setSelectedBank(code);
                setSelectedArc(null);
              }}
              onSelectArc={(arc) => {
                setSelectedArc(arc);
                setSelectedBank(null);
              }}
            />
          </Suspense>
        )}

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

      <div className="space-y-3 border-t border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant={playing ? "outline" : "default"}
            className="h-8 w-8"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause timeline" : "Resume timeline"}
            title={playing ? "Pause timeline" : "Resume timeline"}
          >
            <Pause className="h-3.5 w-3.5" />
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
          <span className="w-28 text-right font-mono text-[11px] text-muted-foreground">
            {frame?.week ?? "—"}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {topFlows.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedArc(a);
                setSelectedBank(null);
              }}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-left transition-colors hover:border-primary/50"
            >
              <span className="font-mono text-xs text-foreground">{a.pair}</span>
              <span
                className={`font-mono text-xs ${a.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {fmtNum(a.change)}
              </span>
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Source: CFTC Commitments of Traders · weekly upload · no redeploy required
        </p>
      </div>
    </Card>
  );
};

export default CurrencyFlowGlobeWidget;
