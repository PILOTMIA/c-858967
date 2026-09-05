/**
 * Economic calendar schedule builder.
 *
 * Release dates are derived from each agency's published release rule
 * (e.g. payrolls on the first Friday, CPI around the 12th) or from the
 * central bank's officially announced 2026 meeting dates. Actual figures are
 * filled in from the live BLS feed; anything not yet released stays blank.
 */

export type Impact = "high" | "medium" | "low";

export interface CalendarEvent {
  id: string;
  /** UTC timestamp of the scheduled release */
  when: Date;
  title: string;
  currency: string;
  country: string;
  impact: Impact;
  source: string;
  /** Which pairs typically react most, and how */
  pairs: string[];
  reaction: string;
  /** Key used to attach live actual/previous values */
  dataKey?: "nfp" | "cpi" | "coreCPI" | "ppi";
  unit?: string;
}

const at = (y: number, m: number, d: number, hUtc: number, min = 0) => new Date(Date.UTC(y, m, d, hUtc, min));

const firstFriday = (y: number, m: number) => {
  const d = new Date(Date.UTC(y, m, 1));
  while (d.getUTCDay() !== 5) d.setUTCDate(d.getUTCDate() + 1);
  return d.getUTCDate();
};

/** Shift to the next weekday if the nominal day lands on a weekend. */
const businessDay = (y: number, m: number, day: number) => {
  const d = new Date(Date.UTC(y, m, day));
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
  return d.getUTCDate();
};

const USD_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "XAUUSD"];

/** Officially announced 2026 policy meeting dates. */
const POLICY_MEETINGS: { date: string; title: string; currency: string; country: string; source: string; pairs: string[] }[] = [
  { date: "2026-09-16", title: "FOMC Interest Rate Decision", currency: "USD", country: "United States", source: "Federal Reserve", pairs: USD_PAIRS },
  { date: "2026-10-28", title: "FOMC Interest Rate Decision", currency: "USD", country: "United States", source: "Federal Reserve", pairs: USD_PAIRS },
  { date: "2026-12-09", title: "FOMC Interest Rate Decision", currency: "USD", country: "United States", source: "Federal Reserve", pairs: USD_PAIRS },
  { date: "2026-09-10", title: "ECB Interest Rate Decision", currency: "EUR", country: "Eurozone", source: "European Central Bank", pairs: ["EURUSD", "EURGBP", "EURJPY", "EURCHF"] },
  { date: "2026-10-29", title: "ECB Interest Rate Decision", currency: "EUR", country: "Eurozone", source: "European Central Bank", pairs: ["EURUSD", "EURGBP", "EURJPY", "EURCHF"] },
  { date: "2026-12-17", title: "ECB Interest Rate Decision", currency: "EUR", country: "Eurozone", source: "European Central Bank", pairs: ["EURUSD", "EURGBP", "EURJPY", "EURCHF"] },
  { date: "2026-09-17", title: "Bank of England Rate Decision", currency: "GBP", country: "United Kingdom", source: "Bank of England", pairs: ["GBPUSD", "EURGBP", "GBPJPY"] },
  { date: "2026-11-05", title: "Bank of England Rate Decision", currency: "GBP", country: "United Kingdom", source: "Bank of England", pairs: ["GBPUSD", "EURGBP", "GBPJPY"] },
  { date: "2026-12-17", title: "Bank of England Rate Decision", currency: "GBP", country: "United Kingdom", source: "Bank of England", pairs: ["GBPUSD", "EURGBP", "GBPJPY"] },
  { date: "2026-09-18", title: "Bank of Japan Policy Decision", currency: "JPY", country: "Japan", source: "Bank of Japan", pairs: ["USDJPY", "EURJPY", "GBPJPY", "AUDJPY"] },
  { date: "2026-10-30", title: "Bank of Japan Policy Decision", currency: "JPY", country: "Japan", source: "Bank of Japan", pairs: ["USDJPY", "EURJPY", "GBPJPY", "AUDJPY"] },
  { date: "2026-12-18", title: "Bank of Japan Policy Decision", currency: "JPY", country: "Japan", source: "Bank of Japan", pairs: ["USDJPY", "EURJPY", "GBPJPY", "AUDJPY"] },
];

/**
 * Build the calendar across a window of months around today.
 */
export function buildCalendar(monthsBack = 2, monthsForward = 4): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();

  for (let offset = -monthsBack; offset <= monthsForward; offset++) {
    const ref = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    const y = ref.getUTCFullYear();
    const m = ref.getUTCMonth();
    const monthLabel = ref.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
    const priorMonth = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });

    events.push({
      id: `nfp-${y}-${m}`,
      when: at(y, m, firstFriday(y, m), 12, 30),
      title: `US Non-Farm Payrolls (${priorMonth})`,
      currency: "USD",
      country: "United States",
      impact: "high",
      source: "Bureau of Labor Statistics",
      pairs: USD_PAIRS,
      reaction:
        "A stronger-than-expected jobs number usually lifts the Dollar within seconds — EURUSD and GBPUSD fall, USDJPY rises, Gold typically dips. A weak print does the opposite.",
      dataKey: "nfp",
      unit: "K jobs",
    });

    const cpiDay = businessDay(y, m, 12);
    events.push({
      id: `cpi-${y}-${m}`,
      when: at(y, m, cpiDay, 12, 30),
      title: `US Consumer Price Index (${priorMonth})`,
      currency: "USD",
      country: "United States",
      impact: "high",
      source: "Bureau of Labor Statistics",
      pairs: USD_PAIRS,
      reaction:
        "Hotter inflation pushes rate-cut bets further out and supports the Dollar; a cooler print weakens it and usually supports Gold.",
      dataKey: "cpi",
      unit: "% year over year",
    });

    events.push({
      id: `core-${y}-${m}`,
      when: at(y, m, cpiDay, 12, 30),
      title: `US Core CPI (${priorMonth})`,
      currency: "USD",
      country: "United States",
      impact: "high",
      source: "Bureau of Labor Statistics",
      pairs: USD_PAIRS,
      reaction:
        "Core strips out food and fuel, so the Fed weighs it more heavily. Surprises here move USDJPY and Gold hardest.",
      dataKey: "coreCPI",
      unit: "% year over year",
    });

    events.push({
      id: `ppi-${y}-${m}`,
      when: at(y, m, businessDay(y, m, cpiDay + 1), 12, 30),
      title: `US Producer Price Index (${priorMonth})`,
      currency: "USD",
      country: "United States",
      impact: "medium",
      source: "Bureau of Labor Statistics",
      pairs: ["EURUSD", "USDJPY", "XAUUSD"],
      reaction:
        "Producer prices lead consumer prices, so a big miss reshapes expectations for the next CPI and gives the Dollar a secondary push.",
      dataKey: "ppi",
      unit: "% year over year",
    });

    events.push({
      id: `claims-${y}-${m}`,
      when: at(y, m, businessDay(y, m, 4), 12, 30),
      title: "US Initial Jobless Claims (weekly)",
      currency: "USD",
      country: "United States",
      impact: "low",
      source: "Department of Labor",
      pairs: ["EURUSD", "USDJPY"],
      reaction: "Released every Thursday. Only moves the market when the number breaks well outside its recent range.",
    });

    void monthLabel;
  }

  for (const meeting of POLICY_MEETINGS) {
    const [yy, mm, dd] = meeting.date.split("-").map(Number);
    events.push({
      id: `policy-${meeting.currency}-${meeting.date}`,
      when: at(yy, mm - 1, dd, meeting.currency === "JPY" ? 3 : meeting.currency === "USD" ? 18 : 12, meeting.currency === "USD" ? 0 : 15),
      title: meeting.title,
      currency: meeting.currency,
      country: meeting.country,
      impact: "high",
      source: meeting.source,
      pairs: meeting.pairs,
      reaction:
        "Rate decisions and the tone of the statement set the trend for that currency over the following weeks, not just the day.",
    });
  }

  return events.sort((a, b) => a.when.getTime() - b.when.getTime());
}
