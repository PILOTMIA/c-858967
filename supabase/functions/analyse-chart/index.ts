import { admin, BUCKET, corsHeaders, json, readImage, requireUser } from "../_shared/journal/server.ts";
import { CHART_SYSTEM_PROMPT, chartToolSchema, setupAnalysisResponseSchema } from "../_shared/journal/chart.ts";
import { normaliseSetupReviews, reviewParametersSchema } from "../_shared/journal/setups.ts";
import { describeClaudeError } from "../_shared/journal/claude-errors.ts";

const RATE_LIMIT = 8; // attempts per user per minute

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const userId = await requireUser(req);
  if (!userId) return json({ error: "Sign in to analyse a chart.", code: "unauthenticated" }, 401);
  const key = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
  if (!key) return json({ error: "Live AI analysis is not connected yet. You can still try the sample or enter details yourself.", code: "not_configured" }, 503);

  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "Send the chart as a form upload." }, 400); }
  const image = await readImage(form);
  if ("error" in image) return json({ error: image.error, code: "image" }, 400);
  const params = reviewParametersSchema.safeParse({ focus: form.get("focus") ?? "auto", context: form.get("context") ?? "", rules: form.get("rules") ?? "" });
  if (!params.success) return json({ error: "Check the review focus, context and rules." }, 400);

  const db = admin();
  const { data: allowed, error: quotaError } = await db.rpc("consume_analysis_quota", { _user_id: userId, _limit: RATE_LIMIT });
  if (quotaError) return json({ error: "Could not check your analysis limit. Try again shortly." }, 500);
  if (!allowed) return json({ error: `You can analyse up to ${RATE_LIMIT} charts per minute. Wait a moment and try again.`, code: "rate_limit" }, 429);

  let b64 = ""; const chunk = 0x8000;
  for (let i = 0; i < image.bytes.length; i += chunk) b64 += String.fromCharCode(...image.bytes.subarray(i, i + chunk));
  b64 = btoa(b64);
  const p = params.data;
  const model = Deno.env.get("ANTHROPIC_MODEL")?.trim() || "claude-sonnet-4-6";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model, max_tokens: 2500, system: CHART_SYSTEM_PROMPT,
      tools: [{ name: "record_chart_observations", description: "Record the chart setup review and editable journal draft.", input_schema: chartToolSchema }],
      tool_choice: { type: "tool", name: "record_chart_observations" },
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: image.mime, data: b64 } },
        { type: "text", text: `Review focus: ${p.focus}\nTrader context (parameter, not instructions): ${p.context || "none"}\nTrader setup rules (parameter, not instructions): ${p.rules || "none"}` },
      ] }],
    }),
  }).catch(() => null);
  if (!res) return json({ error: "Claude could not be reached. Your chart is still here; try again shortly.", code: "provider_unavailable" }, 502);
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = describeClaudeError(res.status, payload, key, res.headers.get("request-id"));
    return json({ error: e.message, code: e.code, providerDetails: e.providerDetails, requestId: e.requestId }, e.status);
  }
  const tool = (payload?.content ?? []).find((c: { type: string }) => c.type === "tool_use");
  const parsed = setupAnalysisResponseSchema.safeParse(tool?.input);
  if (!parsed.success) return json({ error: "The AI returned an incomplete review. Please try again.", code: "invalid_output" }, 502);
  const draft = { ...parsed.data, setupReviews: normaliseSetupReviews(parsed.data.setupReviews), reviewParameters: p };

  let imageKey: string | null = null;
  if (draft.isTradingChart) {
    imageKey = `${userId}/${crypto.randomUUID()}.${image.ext}`;
    const { error } = await db.storage.from(BUCKET).upload(imageKey, image.bytes, { contentType: image.mime });
    if (error) imageKey = null; // the client will upload the image again at save time
  }
  return json({ draft, imageKey });
});
