import { Expand, ShieldAlert, TrendingDown } from "lucide-react";
import USDCHFScenarioChart from "@/components/USDCHFScenarioChart";
import { usdchfEditorialSetup as setup } from "@/lib/editorialSetup";
import { useLatestCOT } from "@/hooks/useLatestCOT";
import { useSpotMomentum } from "@/hooks/useSpotMomentum";
import { computePairCall } from "@/lib/pairBias";
import { pairSpotBias } from "@/lib/tradeTiming";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FeaturedTradeSetup() {
  const cot = useLatestCOT();
  const spot = useSpotMomentum();
  const usd = cot.data?.USD;
  const chf = cot.data?.CHF;
  const matched = usd && chf && usd.reportDate === chf.reportDate;
  const call = matched ? computePairCall("USD", "CHF", usd, chf, pairSpotBias("USD", "CHF", spot.data?.momentum)) : undefined;

  return <section aria-labelledby="featured-setup-title" className="mb-8 border-y border-border py-6">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-primary">Chart thesis · {setup.attribution}</p>
        <h2 id="featured-setup-title" className="flex items-center gap-2 text-2xl font-semibold text-foreground"><TrendingDown className="h-6 w-6 text-destructive" /> USDCHF: recovery or breakdown?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Daily swing scenario · shared October 19, 2026 · original scenario diagram</p>
      </div>
      <Badge variant="outline" className="border-warning/40 text-warning">WAIT · break not verified</Badge>
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <figure className="min-w-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative h-auto w-full overflow-hidden rounded-lg p-0" aria-label="Enlarge USDCHF daily chart">
              <USDCHFScenarioChart />
              <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground"><Expand className="h-4 w-4" /> View chart</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[94dvh] w-[94vw] max-w-4xl overflow-auto">
            <DialogTitle>USDCHF · conditional scenario</DialogTitle>
            <DialogDescription>Original diagram of the Men In Action LLC thesis. Illustrative only: not live prices, observed history or a confirmed entry.</DialogDescription>
            <USDCHFScenarioChart />
          </DialogContent>
        </Dialog>
        <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">Original scenario diagram, not market history. Levels are the author's unverified thesis; the dashed path is hypothetical, not a live forecast.</figcaption>
      </figure>
      <div className="min-w-0 space-y-5">
        <div>
          <h3 className="font-semibold text-foreground">Why lower is on the watchlist</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground">The author's thesis describes rejection near the 50% Fibonacci level at {setup.rejectionLevel.toFixed(4)} and a recovery testing its rising trendline. The Elliott Wave interpretation is that wave 4 may be complete and wave 5 lower could follow. The diagram illustrates that scenario, not proof that the downtrend has resumed.</p>
        </div>
        <ol className="divide-y divide-border border-y border-border">
          {[
            ["01", "Entry trigger", "Wait for a completed daily candle to close below the rising trendline. An intraday dip or an unfinished candle does not confirm this setup. Check the same broker's daily close and trendline anchors."],
            ["02", "Stop & invalidation", "After a confirmed break, place the stop above the rejection high. No exact stop is supplied. A recovery back above the broken trendline weakens the thesis; a move above the rejection high invalidates it."],
            ["03", "Manage the move", "Take partial profits at each target and tighten stops as price moves lower. Do not widen the stop or add to a failed setup. Size risk only after the actual entry and stop are known."],
          ].map(([number, title, text]) => <li key={number} className="flex gap-3 py-3"><span className="pt-0.5 font-mono text-xs text-primary">{number}</span><div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p></div></li>)}
        </ol>
        <div>
          <h3 className="text-xs font-medium uppercase text-muted-foreground">Author's targets · not live calculated levels</h3>
          <div className="mt-2 grid grid-cols-3 gap-3">{setup.targets.map((target, index) => <div key={target} className="border-l-2 border-destructive/50 pl-3"><p className="text-xs text-muted-foreground">Target {index + 1}</p><p className="mt-1 font-mono text-lg font-semibold text-foreground">{target.toFixed(4)}</p></div>)}</div>
          <p className="mt-2 text-xs text-muted-foreground">A 1,000-pip move is not promised; the actual distance and reward-to-risk depend on the confirmed entry.</p>
        </div>
        <div className="border-l-2 border-warning pl-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-warning"><ShieldAlert className="h-4 w-4" /> When not to trade</h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground">No completed daily break, a reclaimed trendline, price already near a target, wide spreads, or a major USD or CHF release approaching: stand aside and reassess. Do not sell just because the wave count points lower.</p>
        </div>
        <div className="border-t border-border pt-3 text-xs leading-relaxed">
          <h3 className="font-semibold text-foreground">Separate check: COT + daily price evidence</h3>
          <p className="mt-1 text-muted-foreground">{call ? `Shared feed, report ${usd?.reportDate}: ${call.direction === "LONG" ? "the automated watchlist currently favours higher USDCHF, conflicting with this bearish chart thesis" : call.direction === "SHORT" ? "the automated watchlist currently favours lower USDCHF, but does not confirm this trendline break" : "the automated watchlist has no confirmed directional edge"}. ${call.reason}` : "Matching USD and CHF COT reports are not available yet. No alignment claim can be made."}</p>
          <p className="mt-1 text-muted-foreground">Daily reference-rate evidence through {spot.data?.to ?? "unavailable"}; not a live execution quote. Neither Fibonacci nor Elliott Wave confirms an entry from COT data. Educational scenario, not personal trade advice.</p>
        </div>
      </div>
    </div>
  </section>;
}