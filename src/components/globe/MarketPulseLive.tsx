import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Radio } from "lucide-react";

/** Session windows in UTC hours (start inclusive, end exclusive; wraps midnight). */
const SESSIONS = [
  { name: "Sydney", start: 21, end: 6, weight: 0.55, color: "#f59e0b" },
  { name: "Tokyo", start: 0, end: 9, weight: 0.75, color: "#f43f5e" },
  { name: "London", start: 7, end: 16, weight: 1, color: "#3b82f6" },
  { name: "New York", start: 12, end: 21, weight: 0.95, color: "#10b981" },
] as const;

const inWindow = (h: number, start: number, end: number) =>
  start < end ? h >= start && h < end : h >= start || h < end;

const hoursUntil = (fromH: number, target: number) => (target - fromH + 24) % 24;

const fmtCountdown = (hoursFloat: number) => {
  const total = Math.max(0, Math.round(hoursFloat * 60));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}h ${String(total % 60).padStart(2, "0")}m`;
};

interface Tick {
  t: number;
  btc: number;
  gold: number;
  vol: number;
}

const MarketPulseLive = () => {
  const [now, setNow] = useState(() => new Date());
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [status, setStatus] = useState<"live" | "connecting" | "degraded">("connecting");
  const [latency, setLatency] = useState<number | null>(null);
  const lastRef = useRef<Tick | null>(null);

  // Clock — 1s tick.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Live quote feed — 12s poll of free public endpoints.
  useEffect(() => {
    let active = true;

    const poll = async () => {
      const started = performance.now();
      try {
        const [btcRes, goldRes] = await Promise.all([
          fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true",
          ),
          fetch("https://api.gold-api.com/price/XAU"),
        ]);
        const btcJson = await btcRes.json();
        const goldJson = await goldRes.json();
        if (!active) return;

        const tick: Tick = {
          t: Date.now(),
          btc: Number(btcJson?.bitcoin?.usd) || lastRef.current?.btc || 0,
          gold: Number(goldJson?.price) || lastRef.current?.gold || 0,
          vol: Number(btcJson?.bitcoin?.usd_24h_vol) || lastRef.current?.vol || 0,
        };
        lastRef.current = tick;
        setLatency(Math.round(performance.now() - started));
        setStatus("live");
        setTicks((prev) => [...prev, tick].slice(-40));
      } catch {
        if (active) setStatus("degraded");
      }
    };

    poll();
    const id = setInterval(poll, 12000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const utcHourFloat = now.getUTCHours() + now.getUTCMinutes() / 60;

  const sessions = useMemo(
    () =>
      SESSIONS.map((s) => {
        const open = inWindow(Math.floor(utcHourFloat), s.start, s.end);
        const nextEvent = open ? hoursUntil(utcHourFloat, s.end) : hoursUntil(utcHourFloat, s.start);
        return { ...s, open, nextEvent };
      }),
    [utcHourFloat],
  );

  const openSessions = sessions.filter((s) => s.open);
  const liquidityWeight = Math.min(
    1,
    openSessions.reduce((sum, s) => sum + s.weight, 0) / 1.95,
  );

  // Realized volatility from tick-to-tick returns (annualised-free, relative scale).
  const realizedVol = useMemo(() => {
    if (ticks.length < 3) return 0;
    const rets: number[] = [];
    for (let i = 1; i < ticks.length; i++) {
      const a = ticks[i - 1];
      const b = ticks[i];
      if (a.btc > 0 && b.btc > 0) rets.push(Math.abs(b.btc / a.btc - 1));
      if (a.gold > 0 && b.gold > 0) rets.push(Math.abs(b.gold / a.gold - 1));
    }
    if (!rets.length) return 0;
    const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
    return Math.min(1, mean / 0.0012);
  }, [ticks]);

  // Participation index: session liquidity x live volatility.
  const activity = Math.round((liquidityWeight * 0.65 + realizedVol * 0.35) * 100);

  // Volume bars: per-tick relative activity, so bars grow as volatility rises.
  const bars = useMemo(() => {
    if (ticks.length < 2) return [] as number[];
    return ticks.slice(1).map((b, i) => {
      const a = ticks[i];
      const moveBtc = a.btc > 0 ? Math.abs(b.btc / a.btc - 1) : 0;
      const moveGold = a.gold > 0 ? Math.abs(b.gold / a.gold - 1) : 0;
      const move = Math.min(1, ((moveBtc + moveGold) / 2) / 0.0012);
      return Math.max(6, Math.round((liquidityWeight * 0.55 + move * 0.45) * 100));
    });
  }, [ticks, liquidityWeight]);

  const btc = lastRef.current?.btc ?? 0;
  const gold = lastRef.current?.gold ?? 0;
  const vol24h = lastRef.current?.vol ?? 0;

  const utcLabel = now.toUTCString().replace(" GMT", " UTC");
  const localLabel = now.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return (
    <Card className="modern-surface mb-4 overflow-hidden border-border/60 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio
            className={`h-4 w-4 ${status === "live" ? "animate-pulse text-emerald-400" : "text-amber-400"}`}
          />
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Live Market Pulse
          </span>
          <Badge variant="outline" className="font-mono text-[10px]">
            {status === "live" ? `LIVE · ${latency ?? 0}ms` : status === "degraded" ? "FEED DEGRADED" : "CONNECTING"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-foreground">{utcLabel}</span>
          </span>
          <span>Local: {localLabel}</span>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Trading sessions (UTC)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {sessions.map((s) => (
              <div
                key={s.name}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  s.open ? "border-primary/40 bg-primary/5" : "border-border/50 bg-muted/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${s.open ? "animate-pulse" : "opacity-30"}`}
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs font-medium text-foreground">{s.name}</span>
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {s.open ? `closes ${fmtCountdown(s.nextEvent)}` : `opens ${fmtCountdown(s.nextEvent)}`}
                </span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            {openSessions.length === 0
              ? "All desks closed — liquidity minimal"
              : openSessions.length > 1
                ? `Overlap: ${openSessions.map((s) => s.name).join(" + ")} — peak participation`
                : `${openSessions[0].name} session active`}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Activity className="h-3.5 w-3.5" /> Participation & volatility
            </p>
            <span className="font-mono text-sm font-semibold text-foreground">{activity}</span>
          </div>

          <div className="flex h-16 items-end gap-[3px] rounded-lg border border-border/50 bg-muted/20 p-2">
            {bars.length === 0 ? (
              <span className="w-full text-center font-mono text-[10px] text-muted-foreground">
                Sampling live ticks…
              </span>
            ) : (
              bars.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-[height] duration-700 ease-out"
                  style={{
                    height: `${v}%`,
                    backgroundColor: v > 70 ? "#f43f5e" : v > 45 ? "#3b82f6" : "#64748b",
                    opacity: 0.45 + (i / bars.length) * 0.55,
                  }}
                />
              ))
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
            <div className="rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5">
              <p className="text-muted-foreground">BTC</p>
              <p className="text-foreground">{btc ? `$${btc.toLocaleString()}` : "—"}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5">
              <p className="text-muted-foreground">Gold</p>
              <p className="text-foreground">{gold ? `$${gold.toFixed(2)}` : "—"}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5">
              <p className="text-muted-foreground">BTC 24h vol</p>
              <p className="text-foreground">{vol24h ? `$${(vol24h / 1e9).toFixed(1)}B` : "—"}</p>
            </div>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            Source: CoinGecko + gold-api · refreshed every 12s
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MarketPulseLive;
