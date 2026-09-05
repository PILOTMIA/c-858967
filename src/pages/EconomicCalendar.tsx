import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Info, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import LiveRateTicker from "@/components/LiveRateTicker";
import { buildCalendar, type CalendarEvent, type Impact } from "@/lib/economicCalendar";

const PROJECT = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface Released {
  latest: number;
  previous: number | null;
  period: string;
  source: string;
}

const fetchReleased = async (): Promise<Record<string, Released>> => {
  const res = await fetch(
    `https://${PROJECT}.supabase.co/functions/v1/macro-data?currencies=USD&nfp=true&inflation=true`,
    { cache: "no-store", headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }
  );
  if (!res.ok) throw new Error(`Calendar data feed returned ${res.status}`);
  const json = await res.json();
  const out: Record<string, Released> = {};

  const nfp = json?.nfp;
  const hist = nfp?.history ?? [];
  const latestNfp = typeof nfp?.latest === "number" ? nfp.latest : hist[hist.length - 1]?.value;
  if (Number.isFinite(latestNfp)) {
    out.nfp = {
      latest: Number(latestNfp),
      previous: typeof nfp?.previous === "number" ? nfp.previous : null,
      period: nfp?.latestMonth ?? "",
      source: nfp?.source === "bls" ? "BLS" : String(nfp?.source ?? "unknown"),
    };
  }

  const inf = json?.inflation ?? {};
  for (const key of ["cpi", "coreCPI", "ppi"]) {
    const d = inf[key];
    if (d && Number.isFinite(Number(d.current))) {
      out[key] = {
        latest: Number(d.current),
        previous: Number.isFinite(Number(d.previous)) ? Number(d.previous) : null,
        period: d.latestPeriod ?? "",
        source: d.source === "bls" ? "BLS" : String(d.source ?? "unknown"),
      };
    }
  }
  return out;
};

const impactStyle: Record<Impact, string> = {
  high: "bg-rose-500/15 text-rose-400 border-rose-500/40",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  low: "bg-muted/40 text-muted-foreground border-border/50",
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

const EconomicCalendar = () => {
  const { data: released, isLoading } = useQuery({
    queryKey: ["calendarReleased"],
    queryFn: fetchReleased,
    refetchInterval: 30 * 60 * 1000,
  });

  const [view, setView] = useState<"upcoming" | "recent">("upcoming");
  const [impactFilter, setImpactFilter] = useState<"all" | Impact>("all");

  const events = useMemo(() => buildCalendar(), []);
  const now = Date.now();

  /** Attach live actual figures to the most recent released instance of each series. */
  const withActuals = useMemo(() => {
    const map = new Map<string, { actual: number; previous: number | null; source: string; period: string }>();
    if (released) {
      for (const [key, r] of Object.entries(released)) {
        const past = events.filter((e) => e.dataKey === key && e.when.getTime() <= now);
        const target = past[past.length - 1];
        if (target) map.set(target.id, { actual: r.latest, previous: r.previous, source: r.source, period: r.period });
      }
    }
    return map;
  }, [released, events, now]);

  const filtered = events.filter((e) => {
    const isPast = e.when.getTime() <= now;
    if (view === "upcoming" && isPast) return false;
    if (view === "recent" && !isPast) return false;
    if (impactFilter !== "all" && e.impact !== impactFilter) return false;
    if (view === "recent" && e.when.getTime() < now - 45 * 86400000) return false;
    if (view === "upcoming" && e.when.getTime() > now + 90 * 86400000) return false;
    return true;
  });

  const ordered = view === "recent" ? [...filtered].reverse() : filtered;

  const grouped = ordered.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const k = dayKey(e.when);
    (acc[k] ||= []).push(e);
    return acc;
  }, {});

  const fmtValue = (e: CalendarEvent, v: number) =>
    e.dataKey === "nfp" ? `${v >= 0 ? "+" : ""}${Math.round(v)}K` : `${v.toFixed(1)}%`;

  const countdown = (d: Date) => {
    const ms = d.getTime() - now;
    if (ms <= 0) return "released";
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    if (days > 0) return `in ${days}d ${hours}h`;
    const mins = Math.floor((ms % 3600000) / 60000);
    return `in ${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-16 space-y-6">
        <header className="text-center">
          <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Economic Calendar</h1>
          <p className="text-muted-foreground text-base font-light max-w-2xl mx-auto">
            Every scheduled report that moves currencies, with the official released figure once it lands and a plain-English
            note on which pairs react.
          </p>
        </header>

        <LiveRateTicker />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-border/50 p-1 bg-card/40">
            {(["upcoming", "recent"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all ${
                  view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "upcoming" ? "Upcoming" : "Recently released"}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-full border border-border/50 p-1 bg-card/40">
            {(["all", "high", "medium", "low"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setImpactFilter(f)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-full capitalize transition-all ${
                  impactFilter === f ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All impact" : f}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="h-24 rounded-2xl bg-muted/20 animate-pulse" />
        )}

        <div className="space-y-6">
          {Object.entries(grouped).map(([day, list]) => (
            <section key={day} className="space-y-3">
              <div className="flex items-center gap-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">
                  {new Date(day).toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
                  })}
                </h2>
              </div>

              {list.map((e) => {
                const actual = withActuals.get(e.id);
                const beat = actual && actual.previous !== null ? actual.actual - actual.previous : null;
                return (
                  <article
                    key={e.id}
                    className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 sm:p-5 transition-all hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${impactStyle[e.impact]}`}>
                            {e.impact} impact
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">
                            {e.currency} · {e.country}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground">{e.title}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {e.when.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC
                          {" · "}
                          {e.when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} your time
                          {" · "}
                          <span className={e.when.getTime() > now ? "text-primary font-semibold" : ""}>{countdown(e.when)}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {actual ? (
                          <>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Actual · {actual.period}</p>
                            <p className="text-2xl font-bold text-foreground tabular-nums">{fmtValue(e, actual.actual)}</p>
                            <p className="text-[11px] text-muted-foreground tabular-nums">
                              Prior: {actual.previous === null ? "—" : fmtValue(e, actual.previous)}
                              {beat !== null && (
                                <span className={beat >= 0 ? " text-emerald-400" : " text-rose-400"}>
                                  {" "}({beat >= 0 ? "+" : ""}{e.dataKey === "nfp" ? Math.round(beat) : beat.toFixed(1)})
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {actual.source} official
                            </p>
                          </>
                        ) : e.when.getTime() > now ? (
                          <>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Awaiting release</p>
                            <p className="text-2xl font-bold text-muted-foreground/50">—</p>
                            <p className="text-[10px] text-muted-foreground">{e.source}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Released</p>
                            <p className="text-[11px] text-muted-foreground max-w-[160px]">
                              Figure published by {e.source}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                      <p className="text-xs text-muted-foreground flex gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{e.reaction}</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {e.pairs.map((p) => (
                          <span key={p} className="text-[10px] font-semibold text-foreground bg-muted/40 border border-border/40 rounded px-1.5 py-0.5 tracking-wide">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ))}

          {!ordered.length && (
            <p className="text-center text-sm text-muted-foreground py-12">
              Nothing scheduled in this window with the selected impact level.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/30 p-4 space-y-2">
          <p className="text-xs text-foreground font-semibold flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-primary" /> How to read this calendar
          </p>
          <p className="text-[11px] text-muted-foreground">
            Dates follow each agency's published release rule — payrolls on the first Friday, consumer prices around the 12th —
            and central bank dates come from their officially announced 2026 meeting schedules. Actual figures are pulled live
            from the US Bureau of Labor Statistics.
          </p>
          <p className="text-[11px] text-muted-foreground flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            We deliberately do not show a "market expectation" figure: there is no free, verifiable consensus feed, and an
            invented forecast would be worse than none. Compare the actual against the prior reading instead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EconomicCalendar;
