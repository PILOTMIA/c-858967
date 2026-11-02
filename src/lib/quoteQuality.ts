export interface QuoteEvidence {
  rate: number;
  source: string;
  asOf?: string;
  kind?: "market" | "daily-reference";
  previousClose?: number;
}

export function usableQuote(q?: QuoteEvidence | null): q is QuoteEvidence {
  return Boolean(q && Number.isFinite(q.rate) && q.rate > 0 && !/fallback|unknown|unavailable/i.test(q.source));
}

export function quoteStatus(q: QuoteEvidence, now = Date.now()) {
  if (!usableQuote(q)) return "Unavailable";
  if (q.kind === "daily-reference" || /ecb|open-er|exchangerate/i.test(q.source)) return "Daily reference";
  const time = Date.parse(q.asOf ?? "");
  if (!Number.isFinite(time) || time > now + 60_000) return "Time unverified";
  const age = now - time;
  if (age > 15 * 60_000) return "Delayed / last close";
  return "Market quote";
}

export function quoteChange(q: QuoteEvidence): number | undefined {
  if (!usableQuote(q) || !Number.isFinite(q.previousClose) || (q.previousClose ?? 0) <= 0) return undefined;
  return (q.rate / Number(q.previousClose) - 1) * 100;
}