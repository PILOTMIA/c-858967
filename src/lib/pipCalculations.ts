export function currencyInUsd(currency: string, rates: Record<string, { rate: number }>): number | undefined {
  if (currency === "USD") return 1;
  const direct = rates[`${currency}USD`]?.rate;
  if (typeof direct === "number" && Number.isFinite(direct) && direct > 0) return direct;
  const inverse = rates[`USD${currency}`]?.rate;
  return typeof inverse === "number" && Number.isFinite(inverse) && inverse > 0 ? 1 / inverse : undefined;
}

export function calculatePipValue(input: { lots: number; stopPips: number; contract: number; pipSize: number; quote: string; account: string }, rates: Record<string, { rate: number }>) {
  const { lots, stopPips, contract, pipSize, quote, account } = input;
  if (![lots, stopPips, contract, pipSize].every(Number.isFinite) || lots < 0 || stopPips < 0 || contract <= 0 || pipSize <= 0) return null;
  const units = lots * contract;
  const pipInQuote = pipSize * units;
  const q = currencyInUsd(quote, rates), a = currencyInUsd(account, rates);
  const fx = quote === account ? 1 : q !== undefined && a !== undefined ? q / a : undefined;
  const perPip = fx === undefined ? undefined : pipInQuote * fx;
  const risk = perPip === undefined ? undefined : perPip * stopPips;
  if (![units, pipInQuote, fx, perPip, risk].every(v => v === undefined || Number.isFinite(v))) return null;
  return { units, pipInQuote, fx, perPip, risk };
}