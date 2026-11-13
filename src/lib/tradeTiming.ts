export interface WeekdayEvidence {
  day: string;
  avgPct: number;
  upRate: number;
  samples: number;
}

export function pairSpotBias(base: string, quote: string, momentum?: Record<string, number>) {
  if (!momentum) return undefined;
  const b = base === "USD" ? 0 : momentum[base];
  const q = quote === "USD" ? 0 : momentum[quote];
  return Number.isFinite(b) && Number.isFinite(q) && b !== undefined && q !== undefined ? b - q : undefined;
}

export function forexIsOpen(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", hourCycle: "h23" }).formatToParts(now);
  const day = parts.find(p => p.type === "weekday")?.value;
  const hour = Number(parts.find(p => p.type === "hour")?.value);
  return day !== "Sat" && !(day === "Fri" && hour >= 17) && !(day === "Sun" && hour < 17);
}

export function timingAssessment(input: { direction: "LONG" | "SHORT" | "WAIT"; reportDates: string[]; priceDate?: string; now: Date; isForex?: boolean }) {
  const { direction, reportDates, priceDate, now, isForex = true } = input;
  const age = (date: string) => (now.getTime() - Date.parse(`${date.slice(0, 10)}T00:00:00Z`)) / 86400000;
  if (!reportDates.length || reportDates.some(d => !d || !Number.isFinite(age(d)) || age(d) < 0)) {
    return { status: "WAIT", reason: "Valid COT report dates are unavailable. Wait for verified reports." };
  }
  if (new Set(reportDates).size !== 1) {
    return { status: "WAIT", reason: "The selected currencies use different COT report weeks. Wait for matching reports." };
  }
  if (reportDates.some(d => age(d) > 10)) {
    return { status: "WAIT", reason: `The displayed COT report (${reportDates[0]}) is over 10 days old. Its positioning remains the stored snapshot, but needs a newer report for entry-timing review.` };
  }
  if (!priceDate || !Number.isFinite(age(priceDate)) || age(priceDate) < 0 || age(priceDate) > 4) {
    return { status: "WAIT", reason: "Recent daily price evidence is unavailable. Direction is not an entry signal." };
  }
  if (isForex && !forexIsOpen(now)) return { status: "WAIT", reason: "The forex market is closed for the weekend. Recheck prices and spreads after it opens." };
  if (direction === "WAIT") return { status: "WAIT", reason: "No clear directional edge. Wait for positioning and price evidence to agree." };
  return { status: "WATCHLIST", reason: "Directional setup only. Wait for a pullback and a closed 4H candle confirming the direction; check your live chart and spread before entry." };
}

export function alignedWeekday(days: WeekdayEvidence[], direction: "LONG" | "SHORT" | "WAIT") {
  if (direction === "WAIT") return undefined;
  return days.filter(d => d.samples >= 20 && Number.isFinite(d.avgPct) && Number.isFinite(d.upRate) &&
    (direction === "LONG" ? d.avgPct > 0 && d.upRate > 50 : d.avgPct < 0 && d.upRate < 50))
    .sort((a, b) => Math.abs(b.avgPct) - Math.abs(a.avgPct))[0];
}