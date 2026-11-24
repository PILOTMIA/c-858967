import { z } from "npm:zod@3.25.67";

export const SETUP_FOCUS = [
  { id: "auto", label: "Auto-detect the setup" },
  { id: "session_sweep", label: "Asian / session range sweep" },
  { id: "liquidity_reversal", label: "Liquidity sweep + structure shift" },
  { id: "crt", label: "CRT — candle range sweep" },
  { id: "fvg", label: "FVG retest" },
  { id: "order_block", label: "Order-block retest" },
  { id: "breaker", label: "Breaker retest" },
  { id: "structure", label: "BOS / CHOCH" },
] as const;
export const focusSchema = z.enum(["auto", "session_sweep", "liquidity_reversal", "crt", "fvg", "order_block", "breaker", "structure"]);
export const reviewParametersSchema = z.object({ focus: focusSchema, context: z.string().max(1200), rules: z.string().max(2400) });
export type ReviewParameters = z.infer<typeof reviewParametersSchema>;
export const marketContextSchema = z.object({
  structure: z.enum(["bullish", "bearish", "ranging", "unclear"]),
  narrative: z.string().max(900),
  levels: z.array(z.object({ name: z.string().max(80), value: z.string().max(100), basis: z.enum(["labelled", "approximate", "relative"]), significance: z.string().max(300) })).max(5),
});
export const setupReviewSchema = z.object({
  id: z.enum(["session_sweep", "liquidity_reversal", "crt", "fvg", "order_block", "breaker", "structure", "other"]),
  name: z.string().min(1).max(100),
  direction: z.enum(["bullish", "bearish", "unclear"]),
  status: z.enum(["supported", "developing", "not_supported", "insufficient_context"]),
  thesis: z.string().max(1000),
  checks: z.array(z.object({ criterion: z.string().max(140), status: z.enum(["met", "pending", "not_met", "unclear"]), required: z.boolean(), evidence: z.string().max(600) })).min(3).max(6),
  confirmation: z.string().max(700),
  invalidation: z.string().max(700),
  lesson: z.string().max(600),
});
export type SetupReview = z.infer<typeof setupReviewSchema>;

export function normaliseSetupReviews(reviews: SetupReview[]): SetupReview[] {
  return reviews.map(review => {
    const required = review.checks.filter(c => c.required);
    let status = review.status;
    if (status === "supported") {
      if (required.length < 2 || review.direction === "unclear") status = "insufficient_context";
      else if (required.some(c => c.status === "not_met")) status = "not_supported";
      else if (required.some(c => c.status === "unclear")) status = "insufficient_context";
      else if (required.some(c => c.status === "pending")) status = "developing";
    }
    return { ...review, status };
  });
}

const string = { type: "string" };
const setupIds = ["session_sweep", "liquidity_reversal", "crt", "fvg", "order_block", "breaker", "structure", "other"];
export const setupToolProperties = {
  analysisVersion: { type: "integer", enum: [2] },
  marketContext: {
    type: "object", properties: {
      structure: { type: "string", enum: ["bullish", "bearish", "ranging", "unclear"] }, narrative: string,
      levels: { type: "array", maxItems: 5, items: { type: "object", properties: { name: string, value: string, basis: { type: "string", enum: ["labelled", "approximate", "relative"] }, significance: string }, required: ["name", "value", "basis", "significance"], additionalProperties: false } },
    }, required: ["structure", "narrative", "levels"], additionalProperties: false,
  },
  setupReviews: { type: "array", maxItems: 2, items: {
    type: "object", properties: {
      id: { type: "string", enum: setupIds }, name: string,
      direction: { type: "string", enum: ["bullish", "bearish", "unclear"] },
      status: { type: "string", enum: ["supported", "developing", "not_supported", "insufficient_context"] }, thesis: string,
      checks: { type: "array", minItems: 3, maxItems: 6, items: { type: "object", properties: { criterion: string, status: { type: "string", enum: ["met", "pending", "not_met", "unclear"] }, required: { type: "boolean" }, evidence: string }, required: ["criterion", "status", "required", "evidence"], additionalProperties: false } },
      confirmation: string, invalidation: string, lesson: string,
    }, required: ["id", "name", "direction", "status", "thesis", "checks", "confirmation", "invalidation", "lesson"], additionalProperties: false,
  } },
};

export const REVIEW_DEFINITIONS = [
  { title: "Asian / session range sweep", text: "An established session range; price trades beyond an edge and closes back inside; displacement or a structure shift away from the sweep; a retracement or entry trigger. Session identity needs visible session labels, readable times with a known timezone, or your supplied context." },
  { title: "Liquidity sweep + structure shift", text: "A clear prior swing or range boundary is taken; price closes back through it; displacement closes beyond the relevant opposing swing. A retracement can develop after the shift. A wick alone does not establish a structure break." },
  { title: "CRT", text: "For this default review: identify a reference candle's high and low, then a later candle that trades beyond one edge and closes back inside that range. Assess confirmation toward the opposite edge. The reference timeframe and candle must be identifiable. You can replace this definition with your own CRT rules." },
  { title: "FVG retest", text: "For a bullish three-candle gap, candle 3's low is above candle 1's high; for a bearish gap, candle 3's high is below candle 1's low. Identify the displacement, gap boundaries, return into the gap and reaction or confirmation. A coloured rectangle by itself is not an FVG." },
  { title: "Order-block retest", text: "Identify the last opposing candle or base before displacement that closes beyond a relevant swing, then a return to that origin and the reaction. A marked demand or supply zone alone does not establish an order block." },
  { title: "Breaker retest", text: "Identify the original order-block candidate, a close that invalidates it, then a retest from the opposite side and a reaction. A normal zone retest without the earlier failure is not a breaker." },
  { title: "BOS / CHOCH", text: "Identify the prior swing sequence and a candle close beyond the relevant swing. A continuation break supports BOS; an opposing break after an established sequence supports CHOCH. If the prior structure is cropped out, keep that distinction unresolved." },
];

export const SETUP_ANALYSIS_GUIDANCE = `Your primary task is to assess the price-action setup, not caption drawing colours. Work through the candles chronologically: prior structure or range, what was swept or broken, displacement, retracement, and current reaction.
Use the following operational definitions as default review rules, not as universal definitions or a proven profitable strategy. User-provided rules refine them. Explain deviations from the defaults.
${REVIEW_DEFINITIONS.map(d => `${d.title}: ${d.text}`).join("\n")}
Review focus: auto means choose the best-supported model and at most one meaningful alternative. If a focus is selected, assess that model first even if it fails; don't force a match. If no named model fits, explain the closest candidate and why it fails or what evidence is missing.
For each candidate normally supply 3-4 concrete conditions, including at least two required conditions; use up to six only when distinct critical conditions require it. Never omit failed or missing required evidence to shorten the review. Mark each met, pending (future confirmation not yet printed), not_met (visible evidence contradicts it), or unclear (the screenshot lacks evidence). Tie each condition to a specific visible swing, candle sequence, range, zone or readable time.
Status supported means every required condition is met within the visible chart; it does NOT establish profitability, a future move or a trade recommendation. Developing means an otherwise plausible model awaits a specific printed confirmation. Not_supported means required evidence is contradicted. Insufficient_context means a critical feature is cropped, unreadable or ambiguous. Do not use a confidence percentage or A+ trade score.
Give a concise setup thesis, the precise confirmation condition still to check, what price action would invalidate this interpretation, and one relevant learning point. These are conditional review criteria, not instructions to enter a trade.
You MAY infer a bullish or bearish SETUP CANDIDATE from candle structure even without an order or position label. This must never populate the trader's actual direction, entry, stop or target. Missing execution labels must NOT stop structural setup analysis. Planned execution and inferred setup direction are separate fields.
Market context should describe the swing sequence or range and current phase. Give up to four useful levels with their role. Use exact numerical levels only when labelled; approximations read from a legible axis must be explicitly marked approximate. Prefer relative references such as 'the swing low before the displacement' when scale resolution is insufficient. Never turn an approximate review level into an extracted entry, stop or target.
Colours, box shapes, indicator names, event icons and annotations alone are not proof of a setup. A box may be an area to inspect; its institutional meaning is an interpretation. 'Visible' observations may report only direct facts. Any claim such as demand zone, order block, support, resistance or event identity is an interpretation unless the label itself is quoted as a label. Ignore decorative markers that do not affect the setup thesis. Do not duplicate unknowns.
CONCISE OUTPUT: Write a quick journal review, not an essay. Aim for roughly 100-130 words across the primary candidate's thesis, checks, confirmation, invalidation and lesson. Keep the setup name and bias clear. Thesis: one sentence, at most 20 words. Each criterion: at most five words; its evidence: one chart-specific sentence, at most 12 words. Confirmation and invalidation: one sentence each, at most 14 words each. Lesson: one practical takeaway, at most 12 words. Preserve decisive prices, contradictions and uncertainty; do not drop a critical condition to hit a word target.
Summary: one sentence, at most 20 words. Market narrative: one sentence, at most 15 words. Include at most three useful levels, each significance at most 10 words. Return only 1-2 non-repetitive supporting observations, at most 12 words each. Do not restate the same point across fields. Do not repeat the preset definitions or add generic trading disclaimers to every paragraph. Use the second candidate only for a material, well-supported alternative; otherwise return just one. Always supply analysisVersion 2, marketContext and setupReviews. If the image is not a chart, return setupReviews [] and unclear market context.`;
