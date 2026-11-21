export interface MacroObservation {
  gdp: number | null;
  cpi: number | null;
  unemployment: number | null;
  interestRate: number | null;
  source: string;
}

export const UNAVAILABLE_MACRO: MacroObservation = {
  gdp: null, cpi: null, unemployment: null, interestRate: null, source: "unavailable",
};

export function observedMacroValue(observation: MacroObservation | undefined, field: keyof Omit<MacroObservation, "source">): number | null {
  const value = observation?.[field];
  return observation?.source === "fred" && typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Rate comparison only: GDP series across countries have incompatible units. */
export function observedRateScore(base: MacroObservation | undefined, quote: MacroObservation | undefined): number | null {
  const b = observedMacroValue(base, "interestRate");
  const q = observedMacroValue(quote, "interestRate");
  if (b === null || q === null) return null;
  return Math.max(-2, Math.min(2, Number(((b - q) * 0.15).toFixed(2))));
}