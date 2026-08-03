export interface CentralBank {
  code: string;
  bank: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  color: string;
  major: boolean;
}

/** Central banks plotted on the globe. Colors are neon terminal accents. */
export const CENTRAL_BANKS: CentralBank[] = [
  { code: "USD", bank: "Federal Reserve", city: "Washington D.C.", country: "United States", lat: 38.8921, lng: -77.0466, color: "#22e39b", major: true },
  { code: "EUR", bank: "European Central Bank", city: "Frankfurt", country: "Eurozone", lat: 50.1093, lng: 8.6742, color: "#3b9dff", major: true },
  { code: "GBP", bank: "Bank of England", city: "London", country: "United Kingdom", lat: 51.5142, lng: -0.0885, color: "#a06bff", major: true },
  { code: "JPY", bank: "Bank of Japan", city: "Tokyo", country: "Japan", lat: 35.6866, lng: 139.7712, color: "#ff4d6d", major: true },
  { code: "CHF", bank: "Swiss National Bank", city: "Bern", country: "Switzerland", lat: 46.9475, lng: 7.4442, color: "#ff8f3f", major: true },
  { code: "CAD", bank: "Bank of Canada", city: "Ottawa", country: "Canada", lat: 45.4211, lng: -75.6981, color: "#ff5ec7", major: true },
  { code: "AUD", bank: "Reserve Bank of Australia", city: "Sydney", country: "Australia", lat: -33.8642, lng: 151.2095, color: "#ffe14d", major: true },
  { code: "NZD", bank: "Reserve Bank of New Zealand", city: "Wellington", country: "New Zealand", lat: -41.2785, lng: 174.7762, color: "#4de3e3", major: true },
  { code: "CNY", bank: "People's Bank of China", city: "Beijing", country: "China", lat: 39.9075, lng: 116.3972, color: "#ff2e63", major: false },
  { code: "MXN", bank: "Banco de México", city: "Mexico City", country: "Mexico", lat: 19.4344, lng: -99.1416, color: "#7dff6b", major: false },
];

export const BANK_BY_CODE: Record<string, CentralBank> = Object.fromEntries(
  CENTRAL_BANKS.map((b) => [b.code, b]),
);

export const INFLOW_COLOR = "#22e39b";
export const OUTFLOW_COLOR = "#ff4d6d";

export interface CotRow {
  currency: string;
  report_date: string;
  net_position: number;
  long_positions: number;
  short_positions: number;
}

export interface WeekPoint {
  code: string;
  net: number;
  change: number;
  pctChange: number;
}

export interface FlowArc {
  id: string;
  from: string;
  to: string;
  pair: string;
  magnitude: number;
  change: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

export interface WeekFrame {
  week: string;
  points: WeekPoint[];
  arcs: FlowArc[];
}

/**
 * Turn raw weekly COT rows (schema: { week_ending/report_date, currency,
 * net_position, change_from_prior_week }) into globe frames.
 * Flow direction: capital rotating OUT of the currency whose speculative net
 * position fell, and INTO the currency whose net position rose. All majors are
 * quoted against USD, so the USD node anchors every arc unless USD itself moved
 * with the pair.
 */
export function buildFrames(rows: CotRow[]): WeekFrame[] {
  const byCurrency = new Map<string, CotRow[]>();
  rows.forEach((r) => {
    if (!BANK_BY_CODE[r.currency]) return;
    const list = byCurrency.get(r.currency) ?? [];
    list.push(r);
    byCurrency.set(r.currency, list);
  });
  byCurrency.forEach((list) => list.sort((a, b) => a.report_date.localeCompare(b.report_date)));

  const weeks = Array.from(new Set(rows.map((r) => r.report_date))).sort();

  return weeks.map((week) => {
    const points: WeekPoint[] = [];
    byCurrency.forEach((list, code) => {
      const idx = list.findIndex((r) => r.report_date === week);
      if (idx === -1) return;
      const cur = list[idx];
      const prev = idx > 0 ? list[idx - 1] : undefined;
      const change = prev ? cur.net_position - prev.net_position : 0;
      const pctChange = prev && prev.net_position !== 0
        ? (change / Math.abs(prev.net_position)) * 100
        : 0;
      points.push({ code, net: cur.net_position, change, pctChange });
    });

    const usd = points.find((p) => p.code === "USD");
    const arcs: FlowArc[] = [];
    points.forEach((p) => {
      if (p.code === "USD" || p.change === 0) return;
      const a = BANK_BY_CODE.USD;
      const b = BANK_BY_CODE[p.code];
      if (!a || !b) return;
      const inflow = p.change > 0; // capital rotating into the foreign currency
      const src = inflow ? a : b;
      const dst = inflow ? b : a;
      arcs.push({
        id: `${week}-${p.code}`,
        from: src.code,
        to: dst.code,
        pair: `${p.code}USD`,
        magnitude: Math.abs(p.change),
        change: p.change,
        startLat: src.lat,
        startLng: src.lng,
        endLat: dst.lat,
        endLng: dst.lng,
      });
    });

    // Keep the USD node informative even when it has no dedicated arc.
    if (usd) void usd;

    return { week, points, arcs };
  });
}

export const fmtNum = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(Math.round(n)).toLocaleString()}`;
