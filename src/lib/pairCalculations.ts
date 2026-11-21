import { POSITION_SCALE } from "./pairBias";

export function selectedPairKey(base: string, quote: string): string {
  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote) || base === quote) throw new Error("Choose two different currency codes.");
  return `${base}${quote}`;
}

/** Simple percentage returns compose as price ratios, not subtraction. */
export function relativeReturn(basePct: number, quotePct: number): number | undefined {
  if (![basePct, quotePct].every(Number.isFinite) || basePct <= -100 || quotePct <= -100) return undefined;
  return ((1 + basePct / 100) / (1 + quotePct / 100) - 1) * 100;
}

export function invertReturn(pct: number): number | undefined {
  return relativeReturn(0, pct);
}

export interface PairPosition {
  long: number; short: number; net: number; weekly: number; reportDate: string;
}

export function validPairPositions(base?: PairPosition, quote?: PairPosition) {
  return !!base && !!quote && base.reportDate === quote.reportDate && /^\d{4}-\d{2}-\d{2}$/.test(base.reportDate)
    && Number.isFinite(Date.parse(`${base.reportDate}T00:00:00Z`))
    && [base, quote].every(row => [row.long, row.short, row.net, row.weekly].every(Number.isFinite)
      && Number.isInteger(row.long) && Number.isInteger(row.short) && row.long >= 0 && row.short >= 0
      && row.net === row.long - row.short);
}

/** Contract-count proxy across two different futures markets, not trader probabilities. */
export function pairPositioning(base?: PairPosition, quote?: PairPosition) {
  if (!validPairPositions(base, quote) || !base || !quote) return null;
  const bullContracts = base.long + quote.short;
  const bearContracts = base.short + quote.long;
  const total = bullContracts + bearContracts;
  if (total <= 0) return null;
  const netSpread = base.net - quote.net;
  return {
    bullContracts, bearContracts, netSpread,
    bullPercent: bullContracts / total * 100,
    bearPercent: bearContracts / total * 100,
    positionScore: Math.max(-100, Math.min(100, netSpread / POSITION_SCALE * 100)),
    reportDate: base.reportDate,
  };
}