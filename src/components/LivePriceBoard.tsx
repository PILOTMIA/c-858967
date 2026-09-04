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

/** Real prior official close per pair, derived from Frankfurter (ECB reference rates). */
async function fetchPrevCloses(): Promise<Record<string, number>> {
  const end = new Date();
  const start = new Date(Date.now() - 12 * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/${iso(start)}..${iso(end)}?base=USD&symbols=EUR,GBP,JPY,CHF,AUD,CAD,NZD`
    );
    if (!res.ok) return {};
    const json = await res.json();
    const dates = Object.keys(json?.rates ?? {}).sort();
    if (dates.length < 2) return {};
    const prev = json.rates[dates[dates.length - 2]] as Record<string, number>;
    const perUsd = (c: string) => (c === "USD" ? 1 : prev[c]); // units of c per 1 USD
    const out: Record<string, number> = {};
    for (const pair of BOARD_PAIRS) {
      const base = pair.slice(0, 3);
      const quote = pair.slice(3);
      const b = perUsd(base);
      const q = perUsd(quote);
      if (Number.isFinite(b) && Number.isFinite(q) && b) out[pair] = q / b;
    }
    return out;
  } catch {
    return {};
  }
}

export async function fetchLiveBoard(): Promise<LiveBoard> {
  const started = performance.now();
  const url = `https://${PROJECT}.supabase.co/functions/v1/forex-prices?pairs=${BOARD_PAIRS.join(",")}`;
  const [res, prevCloses] = await Promise.all([
    fetch(url, { cache: "no-store", headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }),
    fetchPrevCloses(),
  ]);
  if (!res.ok) throw new Error(`Price feed returned ${res.status}`);
  const json = await res.json();
  const rates: Record<string, LiveRate> = {};
  for (const pair of BOARD_PAIRS) {
    const r = json?.rates?.[pair];
    if (!r || !Number.isFinite(Number(r.rate))) continue;
    rates[pair] = {
      pair,
      rate: Number(r.rate),
      prevClose: prevCloses[pair],
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
              Live quotes from the price feed. Daily change is measured against the previous official ECB reference close — no simulated data.
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
            const isFallback = r.source.includes("fallback");
            return (
              <div
                key={r.pair}
                className="group relative overflow-hidden rounded-xl border border-[hsl(var(--ma-elev)/0.6)] bg-[hsl(var(--ma-bg)/0.55)] p-4 transition-all duration-300 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.55)]"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-px opacity-70 ${
                    flat ? "bg-muted-foreground/30" : up ? "bg-emerald-400/70" : "bg-rose-400/70"
                  }`}
                />
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
                <p className="ma-mono text-lg font-semibold text-foreground mt-2 tabular-nums">
                  {r.rate.toFixed(decimals(r.pair))}
                </p>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <span
                    className={`ma-mono text-[11px] rounded px-1.5 py-0.5 tabular-nums ${
                      flat
                        ? "text-muted-foreground bg-muted/20"
                        : up
                        ? "text-emerald-300 bg-emerald-500/10"
                        : "text-rose-300 bg-rose-500/10"
                    }`}
                  >
                    {change === undefined ? "—" : `${up ? "+" : ""}${change.toFixed(2)}%`}
                  </span>
                  <span
                    className={`text-[10px] truncate ${isFallback ? "text-amber-400" : "text-muted-foreground"}`}
                    title={`Source: ${r.source}`}
                  >
                    {isFallback ? "cached" : r.source}
                  </span>
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
