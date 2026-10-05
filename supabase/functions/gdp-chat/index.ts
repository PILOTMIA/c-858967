import { createOpenAI } from "npm:@ai-sdk/openai@4";
import { convertToModelMessages, streamText, type UIMessage } from "npm:ai@7";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "../_shared/run-id.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

interface GdpRow {
  country: string;
  currency: string;
  gdp: number;
  previous: number;
  forecast: number;
  source: string;
}

function sanitizeRows(input: unknown): GdpRow[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 20).flatMap((r: any) => {
    const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    const s = (v: unknown) => (typeof v === "string" ? v.slice(0, 60) : "");
    const gdp = n(r?.gdp), previous = n(r?.previous), forecast = n(r?.forecast);
    if (gdp === null || previous === null || forecast === null) return [];
    return [{ country: s(r.country), currency: s(r.currency), gdp, previous, forecast, source: s(r.source) }];
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI is not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const messages: UIMessage[] = Array.isArray(body?.messages) ? body.messages.slice(-30) : [];
  if (!messages.length) {
    return new Response(JSON.stringify({ error: "No messages" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const rows = sanitizeRows(body?.gdp);
  const table = rows
    .map((r) => `${r.currency} (${r.country}): current ${r.gdp}%, previous ${r.previous}%, forecast ${r.forecast}% — source ${r.source}`)
    .join("\n");

  const system = `You are the GDP Explainer for MIA FX Labs, a forex education site. Explain GDP figures and growth forecasts in plain, friendly language a beginner trader can follow.

Data shown on the dashboard right now (annualized quarterly GDP growth):
${table || "No data supplied."}

Rules:
- Base every number on the data above. If asked about a country not listed, say it isn't on the dashboard.
- Explain what the change from previous to current means and why the forecast points up or down (consumer spending, trade, rates, inflation — keep it general and say when you're giving typical reasons rather than confirmed causes).
- Connect it to the currency: stronger growth tends to support a currency through higher-rate expectations; weaker growth tends to weigh on it.
- Write currency pairs as plain text like EURUSD, never with slashes. No emojis.
- Keep answers under about 180 words, use short paragraphs or bullets.
- End with a brief reminder that this is educational, not financial advice, only when giving a trading angle.`;

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      system,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    return await withLovableAiGatewayRunIdHeader(
      result.toUIMessageStreamResponse({
        originalMessages: messages,
        sendReasoning: true,
        onError: (error: any) => {
          const status = error?.statusCode ?? error?.status;
          if (status === 429) return "Too many questions right now — please wait a moment and try again.";
          if (status === 402) return "The AI assistant is temporarily unavailable (credits exhausted).";
          if (status === 403) return "The AI assistant can't answer this request.";
          return "The assistant couldn't answer just now. Please try again.";
        },
      }),
      runIdFetch,
      corsHeaders,
    );
  } catch (e) {
    console.error("gdp-chat error", e);
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
