import { squeezeCheck } from "@/hooks/useSpotMomentum";

/**
 * Single COT pair-bias engine shared by "What to Trade" and the Pair Scorecard,
 * so both always give the same call for the same pair.
 */
export const POSITION_SCALE = 150_000; // net-spread contracts that equal a full ±100 position score
export const FLOW_SCALE = 30_000; // weekly flow-spread contracts that equal a full ±100 flow score
export const WAIT_THRESHOLD = 8;

export interface PairCall {
  netSpread: number;
  flowSpread: number;
  positionScore: number; // -100..100
  flowScore: number; // -100..100
  conviction: number; // signed -100..100
  displayConviction: number; // 0..100
  direction: "LONG" | "SHORT" | "WAIT";
  aligned: boolean;
  conflict: boolean;
  squeeze: boolean;
  priceBias: number;
  reason: string;
}

const clamp = (v: number) => Math.max(-100, Math.min(100, Number.isFinite(v) ? v : 0));

export function computePairCall(
  base: string,
  quote: string,
  b: { net?: number; weekly?: number },
  q: { net?: number; weekly?: number },
  priceBias = 0
): PairCall {
  const netSpread = (b.net ?? 0) - (q.net ?? 0);
  const flowSpread = (b.weekly ?? 0) - (q.weekly ?? 0);
  const positionScore = clamp((netSpread / POSITION_SCALE) * 100);
  const flowScore = clamp((flowSpread / FLOW_SCALE) * 100);
  const conviction = positionScore * 0.6 + flowScore * 0.4;
  const alignedRaw = Math.sign(positionScore) === Math.sign(flowScore) && Math.abs(positionScore) > 5;
  const { conflict, squeeze } = squeezeCheck(netSpread, priceBias);

  let direction: PairCall["direction"] =
    Math.abs(conviction) < WAIT_THRESHOLD ? "WAIT" : conviction > 0 ? "LONG" : "SHORT";
  let displayConviction = Math.abs(conviction);
  let reason: string;

  const favoured = conviction > 0 ? base : quote;
  const other = conviction > 0 ? quote : base;

  if (squeeze) {
    direction = priceBias > 0 ? "LONG" : "SHORT";
    displayConviction = Math.max(displayConviction, 70);
    reason = `Big traders are crowded the other way, but price is running against them (${priceBias.toFixed(2)}% this week). Following price — squeeze risk.`;
  } else if (conflict) {
    direction = "WAIT";
    reason = `COT favours ${favoured} over ${other}, but price moved the opposite way this week. Wait for price to confirm.`;
  } else if (direction === "WAIT") {
    reason = `Positioning in ${base} and ${quote} is too close to call — no clear institutional edge.`;
  } else {
    reason = `Big traders favour ${favoured} over ${other}${alignedRaw ? " and added to that bet this week" : ", though weekly flow is fading"}.`;
  }

  return {
    netSpread,
    flowSpread,
    positionScore,
    flowScore,
    conviction,
    displayConviction,
    direction,
    aligned: alignedRaw && !conflict,
    conflict,
    squeeze,
    priceBias,
    reason,
  };
}
