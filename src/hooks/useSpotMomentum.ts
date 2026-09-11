import { useQuery } from "@tanstack/react-query";

/**
 * Live spot momentum per currency, measured against USD over the last ~5 sessions.
 * Positive = the currency has strengthened. USD's own reading is the inverse of the
 * average move of the basket, so it can be compared like any other currency.
 *
 * Source: ECB reference rates via Frankfurter (no key, no simulated data).
 */
const BASKET = ["EUR", "JPY", "GBP", "CHF", "CAD", "AUD", "NZD", "MXN", "SEK"];

export interface SpotMomentum {
  /** % strength vs USD over the window, keyed by currency code */
  momentum: Record<string, number>;
  from: string;
  to: string;
}

async function fetchSpotMomentum(): Promise<SpotMomentum> {
  const end = new Date();
  const start = new Date(Date.now() - 14 * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const res = await fetch(
    `https://api.frankfurter.dev/v1/${iso(start)}..${iso(end)}?base=USD&symbols=${BASKET.join(",")}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Spot history unavailable");
  const json = await res.json();
  const dates = Object.keys(json?.rates ?? {}).sort();
  if (dates.length < 2) throw new Error("Not enough spot history");

  const to = dates[dates.length - 1];
  const from = dates[Math.max(0, dates.length - 6)];
  const now = json.rates[to] as Record<string, number>;
  const then = json.rates[from] as Record<string, number>;

  const momentum: Record<string, number> = {};
  const moves: number[] = [];
  for (const c of BASKET) {
    const a = then?.[c];
    const b = now?.[c];
    if (!Number.isFinite(a) || !Number.isFinite(b) || !a || !b) continue;
    // rates are "units of c per USD" — a fall means the currency strengthened
    const pct = ((a - b) / a) * 100;
    momentum[c] = pct;
    moves.push(pct);
  }
  momentum.USD = moves.length ? -(moves.reduce((s, v) => s + v, 0) / moves.length) : 0;

  return { momentum, from, to };
}

export function useSpotMomentum() {
  return useQuery({
    queryKey: ["spotMomentum"],
    queryFn: fetchSpotMomentum,
    refetchInterval: 30 * 60_000,
    staleTime: 15 * 60_000,
  });
}

/** A crowded position moving against price = squeeze risk. */
export function squeezeCheck(
  netDiff: number,
  priceBias: number,
  crowdedThreshold = 40000,
  moveThreshold = 0.4
) {
  const conflict =
    Math.sign(netDiff) !== 0 &&
    Math.sign(priceBias) !== 0 &&
    Math.sign(netDiff) !== Math.sign(priceBias) &&
    Math.abs(priceBias) >= moveThreshold;
  return {
    conflict,
    squeeze: conflict && Math.abs(netDiff) >= crowdedThreshold,
  };
}
