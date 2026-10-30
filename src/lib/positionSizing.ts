export const sizingInstruments = [
  ...["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDJPY", "USDCHF", "USDCAD", "EURJPY", "GBPJPY", "AUDJPY", "EURGBP", "EURCHF"].map(symbol => ({ symbol, quote: symbol.slice(3), contract: 100000, pip: symbol.endsWith("JPY") ? 0.01 : 0.0001 })),
  { symbol: "XAUUSD", quote: "USD", contract: 100, pip: 0.01 },
  { symbol: "XAGUSD", quote: "USD", contract: 5000, pip: 0.001 },
];

export interface SizingSettings {
  stopPips: number;
  bufferPips: number;
  feePerLot: number;
  contract: number;
  pip: number;
  lotStep: number;
  minLot: number;
  maxLot: number;
  quoteToUsd: number;
}

export function sizePosition(riskDollars: number, s: SizingSettings) {
  if (Object.values(s).some(v => !Number.isFinite(v)) || !Number.isFinite(riskDollars)) throw new Error("Enter a number in every lot-sizing field.");
  if (riskDollars < 0 || s.stopPips <= 0 || s.bufferPips < 0 || s.feePerLot < 0 || s.contract <= 0 || s.pip <= 0 || s.lotStep <= 0 || s.minLot <= 0 || s.maxLot < s.minLot || s.quoteToUsd <= 0) throw new Error("Stop, contract, pip size and broker lot limits must be positive; costs cannot be negative.");
  const pipValue = s.contract * s.pip * s.quoteToUsd;
  const costPerLot = (s.stopPips + s.bufferPips) * pipValue + s.feePerLot;
  const rawLots = riskDollars / costPerLot;
  const steps = Math.floor(Math.min(rawLots, s.maxLot) / s.lotStep);
  let lots = Number((steps * s.lotStep).toPrecision(12));
  // Never allow floating-point rounding to exceed the chosen risk budget.
  if (lots * costPerLot > riskDollars || lots > s.maxLot) lots = Number((Math.max(0, steps - 1) * s.lotStep).toPrecision(12));
  if (lots < s.minLot) lots = 0;
  return { lots, rawLots, pipValue, riskAtStop: lots * costPerLot, units: lots * s.contract };
}

export function referenceIsFresh(date: string, now = Date.now()) {
  const age = now - Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(age) && age >= 0 && age <= 4 * 86400000;
}