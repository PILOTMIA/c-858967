import { computePairCall } from "./pairBias";
import { validPairPositions, type PairPosition } from "./pairCalculations";
import { observedRateScore, type MacroObservation } from "./macroEvidence";

const bounded = (value: number, limit: number) => Number(Math.max(-limit, Math.min(limit, value)).toFixed(2));

export function computePairScores(base: string, quote: string, positions: Record<string, PairPosition>, fundamentals: Record<string, MacroObservation>, priceBias?: number, seasonalAverage?: number) {
  const b = positions[base], q = positions[quote];
  const available = validPairPositions(b, q) && base !== quote;
  const call = available ? computePairCall(base, quote, b, q, priceBias) : computePairCall(base, quote, {}, {});
  const cotScore = available ? bounded(call.positionScore / 100 * 3, 3) : null;
  const trendScore = available ? bounded(call.flowScore / 100 * 2, 2) : null;
  const seasScore = seasonalAverage !== undefined && Number.isFinite(seasonalAverage) ? bounded(seasonalAverage, 2) : null;
  const economicScore = observedRateScore(fundamentals[base], fundamentals[quote]);
  const totalScore = available ? Number(((cotScore ?? 0) + (trendScore ?? 0) + (seasScore ?? 0) + (economicScore ?? 0)).toFixed(2)) : null;
  return { call, cotScore, trendScore, seasScore, economicScore, totalScore };
}