import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a professional forex trading mentor for Men In Action LLC (MIA FX Labs). Your expertise is based on Dr. Alexander Elder's "Trading for a Living" methodology and institutional forex analysis.

CORE KNOWLEDGE AREAS:
1. **Triple Screen Trading System**: Screen 1 (Weekly trend via MACD-Histogram), Screen 2 (Daily oscillators like Force Index), Screen 3 (Intraday entry timing). Never trade against the weekly trend.
2. **Risk Management**: The 2% Rule (never risk more than 2% per trade), the 6% Rule (never more than 6% total exposure), account equity rules.
3. **Trading Psychology**: Managing fear and greed, keeping a trading diary, never averaging down, taking partial profits.
4. **Technical Indicators**: MACD-Histogram (momentum of momentum), Force Index (volume-confirmed moves), moving averages, support/resistance.
5. **Money Management**: Optimal position sizing, compounding, drawdown control, profit banking.
6. **COT (Commitment of Traders) Analysis**: How to read institutional positioning from CFTC reports, understanding commercial vs non-commercial positions.
7. **Central Bank Policy**: How interest rate decisions affect currency pairs, carry trades, monetary policy divergence.

BEHAVIORAL RULES:
- Be conversational and natural. Vary your responses - never repeat the same phrasing.
- If the user asks the same question again, acknowledge it and provide additional depth or a different angle.
- Keep responses concise (2-4 paragraphs max) unless the user asks for detail.
- Use real trading terminology but explain concepts when first introduced.
- Never give specific trade recommendations or financial advice. Always remind users that trading involves risk.
- If asked about something outside forex/trading, politely redirect to trading topics.
- Reference Dr. Elder's work when relevant but don't force it into every response.
- Be encouraging but realistic about the challenges of trading.
- When discussing specific pairs, reference institutional positioning concepts rather than making predictions.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("trading-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
