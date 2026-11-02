import { usableQuote, quoteStatus, type QuoteEvidence } from "@/lib/quoteQuality";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usdchfEditorialSetup as setup } from "@/lib/editorialSetup";
import { describeUsdchfQuote } from "@/lib/editorialSetup";

type Quote = QuoteEvidence & { fetchedAt: number };

async function fetchQuote(): Promise<Quote | null> {
  const { data, error } = await supabase.functions.invoke("forex-prices?pairs=USDCHF", { method: "GET" });
  const r = data?.rates?.USDCHF;
  if (error || !usableQuote(r)) return null;
  return { ...r, fetchedAt: data.timestamp ?? Date.now() };
}

/** Verified data panel: kept visually separate from the illustrative chart levels. */
export default function USDCHFVerifiedQuote() {
  const q = useQuery({ queryKey: ["usdchf-verified-quote"], queryFn: fetchQuote, refetchInterval: 30 * 60_000, staleTime: 10 * 60_000 });
  const quote = q.data;
  const status = quote ? describeUsdchfQuote(quote.rate) : null;
  return <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-xs font-semibold uppercase text-primary">API quote · source observation</h3>
      <span className="text-xs text-muted-foreground">{quote ? `${quote.source} · ${quoteStatus(quote)} · as of ${quote.asOf ? new Date(quote.asOf).toLocaleString() : "unavailable"}` : q.isLoading ? "Loading…" : "Unavailable"}</span>
    </div>
    {quote && status ? <>
      <p className="mt-2 font-mono text-2xl font-semibold text-foreground">{quote.rate.toFixed(5)}</p>
      <p className="mt-1 text-foreground">{status}</p>
      <p className="mt-1 text-xs text-muted-foreground">An indicative provider quote, not your broker’s execution price. It cannot confirm a completed daily close below the trendline — check your broker's chart.</p>
    </> : !q.isLoading && <p className="mt-2 text-muted-foreground">No verified USDCHF rate right now. Treat every level on this page as illustrative only.</p>}
    <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">Illustrative (author's chart, not verified): break ≈ {setup.trendlineBreakLevel.toFixed(4)}, channel support ≈ {setup.channelSupport.toFixed(4)}, targets {setup.targets.map(t => t.toFixed(4)).join(" / ")}.</p>
  </div>;
}
