import { Expand, ShieldAlert, TrendingUp } from "lucide-react";
import BitcoinScenarioChart from "@/components/BitcoinScenarioChart";
import { bitcoinEditorialSetup as setup } from "@/lib/editorialSetup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function BitcoinTradeSetup() {
  const dollars = (value: number) => `$${value.toLocaleString("en-US")}`;
  return <section aria-labelledby="bitcoin-setup-title" className="mb-8 border-y border-border py-6">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-primary">Long-term chart thesis · {setup.attribution}</p>
        <h2 id="bitcoin-setup-title" className="flex items-start gap-2 text-2xl font-semibold text-foreground"><TrendingUp className="mt-1 h-6 w-6 shrink-0 text-primary" />Bitcoin: the final leg?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Two-week ending diagonal · shared October 19, 2026</p>
      </div>
      <Badge variant="outline" className="border-warning/40 text-warning">WATCHLIST · thesis unverified</Badge>
    </div>
    <figure className="min-w-0">
      <Dialog>
        <DialogTrigger asChild><Button variant="outline" className="relative h-auto w-full overflow-hidden rounded-lg p-0" aria-label="Enlarge Bitcoin scenario chart"><BitcoinScenarioChart /><span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground"><Expand className="h-4 w-4" /> View chart</span></Button></DialogTrigger>
        <DialogContent className="max-h-[94dvh] w-[94vw] max-w-5xl overflow-auto"><DialogTitle>Bitcoin · ending-diagonal scenario</DialogTitle><DialogDescription>Original illustration of the Men In Action LLC interpretation. Not live data, historical candles or a confirmed trade.</DialogDescription><BitcoinScenarioChart /></DialogContent>
      </Dialog>
      <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">Original schematic, not a price chart. Both the wave count and projected route are unverified interpretations; the supplied levels are not live calculated trade zones.</figcaption>
    </figure>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div><h3 className="font-semibold text-foreground">The bigger picture</h3><p className="mt-2 text-sm leading-relaxed text-foreground">The author's two-week count places wave 4 at the lower diagonal boundary and proposes that wave 5 is underway. In this interpretation, shorter-term retracements sit within a final leg higher of a structure built over years. Elliott Wave counts are subjective; neither this diagram nor COT data verifies that the final leg has begun.</p></div>
      <ol className="divide-y divide-border">{[["01", "First advance", `A proposed rally towards ${dollars(setup.firstObjective)}.`],["02", "Larger pullback", "A retracement is part of the scenario. No pullback price or date was supplied."],["03", "Final push", `A proposed move towards ${dollars(setup.finalTargetRange[0])}–${dollars(setup.finalTargetRange[1])}; not a promised outcome.`]].map(([n,title,text]) => <li key={n} className="flex gap-3 py-3 first:pt-0"><span className="pt-1 font-mono text-xs text-primary">{n}</span><div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></li>)}</ol>
      <div className="border-l-2 border-destructive pl-3"><h3 className="font-semibold text-destructive">Count invalidation · {dollars(setup.invalidationLevel)}</h3><p className="mt-2 text-sm leading-relaxed text-foreground">A move below this supplied level invalidates the current count. It is not an automatically calculated stop loss. The author has not specified whether an intraday breach or a candle close governs invalidation.</p></div>
      <div className="border-l-2 border-warning pl-3"><h3 className="flex items-center gap-2 font-semibold text-warning"><ShieldAlert className="h-4 w-4" />When not to trade</h3><p className="mt-2 text-sm leading-relaxed text-foreground">Do not buy solely because the projected path points up. No entry trigger, exact stop, timing window or live confirmation was supplied. Wait for an independently verified entry and defined risk; reassess if the count is invalidated. Educational scenario, not personal trade advice.</p></div>
    </div>
  </section>;
}