import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Minus, RefreshCw } from "lucide-react";

const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const PROJECT = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;

export const BOARD_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
  "EURJPY", "GBPJPY", "EURGBP", "AUDJPY", "EURCHF",
];

export interface LiveRate {
  pair: string;
  rate: number;
  prevClose?: number;
  source: string;
}

export interface LiveBoard {
  rates: Record<string, LiveRate>;
  fetchedAt: number;
  latencyMs: number;
}

export async function fetchLiveBoard(): Promise<LiveBoard> {
  const started = performance.now();
  const url = `https://${PROJECT}.supabase.co/functions/v1/forex-prices?pairs=${BOARD_PAIRS.join(",")}&history=true`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  if (!res.ok) throw new Error(`Price feed returned ${res.status}`);
  const json = await res.json();
  const rates: Record<string, LiveRate> = {};
  for (const pair of BOARD_PAIRS) {
    const r = json?.rates?.[pair];
    if (!r || !Number.isFinite(Number(r.rate))) continue;
    const hist = json?.history?.[pair] as { date: string; close: number }[] | undefined;
    rates[pair] = {
      pair,
      rate: Number(r.rate),
      prevClose: hist && hist.length > 1 ? Number(hist[hist.length - 2].close) : undefined,
      source: r.source ?? "unknown",
    };
  }
  return { rates, fetchedAt: Date.now(), latencyMs: Math.round(performance.now() - started) };
}

export function useLiveBoard() {
  return useQuery({
    queryKey: ["liveBoard"],
    queryFn: fetchLiveBoard,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

const decimals = (pair: string) => (pair.includes("JPY") ? 3 : 5);

const LivePriceBoard = () => {
  const { data, isLoading, isFetching, refetch, error } = useLiveBoard();

  const rows = data ? BOARD_PAIRS.map((p) => data.rates[p]).filter(Boolean) : [];

  return (
    <section className="ma-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="ma-accent-bar h-10 mt-1" />
          <div>
            <p className="ma-eyebrow">Live quotes</p>
            <h2 className="ma-serif text-xl sm:text-2xl font-bold text-foreground">Rate Board</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Real quotes from the price feed. Change is measured against the previous daily close — no simulated data.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="ma-chip ma-mono !text-[10px]">
              {new Date(data.fetchedAt).toLocaleTimeString()} · {data.latencyMs}ms
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="ma-chip hover:!border-primary/50 transition-colors"
            aria-label="Refresh quotes"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive mb-3">
          Price feed unavailable right now — showing nothing rather than stale numbers.
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {rows.map((r) => {
            const change =
              r.prevClose && r.prevClose > 0 ? ((r.rate - r.prevClose) / r.prevClose) * 100 : undefined;
            const up = (change ?? 0) > 0;
            const flat = change === undefined || Math.abs(change) < 0.01;
            return (
              <div
                key={r.pair}
                className="rounded-xl border border-[hsl(var(--ma-elev)/0.6)] bg-[hsl(var(--ma-bg)/0.55)] p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="ma-mono text-xs tracking-wider text-muted-foreground">{r.pair}</span>
                  {flat ? (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : up ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                  )}
                </div>
                <p className="ma-mono text-lg font-semibold text-foreground mt-2">
                  {r.rate.toFixed(decimals(r.pair))}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`ma-mono text-[11px] ${
                      flat ? "text-muted-foreground" : up ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {change === undefined ? "—" : `${up ? "+" : ""}${change.toFixed(2)}%`}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate ml-2">{r.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default LivePriceBoard;
