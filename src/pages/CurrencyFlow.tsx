import PageHeader from "@/components/PageHeader";
import CurrencyFlowGlobeWidget from "@/components/globe/CurrencyFlowGlobeWidget";
import MarketPulseLive from "@/components/globe/MarketPulseLive";
import { CENTRAL_BANKS } from "@/components/globe/currencyFlowData";
import { Card } from "@/components/ui/card";
import { MousePointerClick, Orbit, TimerReset } from "lucide-react";

const HOW_TO = [
  {
    icon: Orbit,
    title: "Spin the globe",
    body: "Drag to rotate, scroll to zoom. Glowing nodes are futures venues; brighter nodes moved more this week.",
  },
  {
    icon: MousePointerClick,
    title: "Tap a node or arc",
    body: "Click any bank or flow line to read the exact non-commercial net position and week-over-week change.",
  },
  {
    icon: TimerReset,
    title: "Scrub the timeline",
    body: "Play the last 60 CFTC releases to see where speculative capital rotated in and out of the majors.",
  },
];

const CurrencyFlow = () => (
  <main className="container mx-auto max-w-[1500px] px-4 py-10">
    <PageHeader
      eyebrow="Institutional Positioning"
      title="3D Global Currency Flow"
      subtitle="Weekly CFTC Commitments of Traders positioning rendered as live capital flow between central banks. Scrub the timeline to watch speculative money rotate across the majors."
    />

    <div className="space-y-6">
      <MarketPulseLive />
      <CurrencyFlowGlobeWidget />

      <section className="grid gap-4 md:grid-cols-3">
        {HOW_TO.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="modern-surface border-border/60 p-5">
            <Icon className="h-4 w-4 text-primary" />
            <h2 className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-foreground">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Venues on the globe
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            {CENTRAL_BANKS.length} tracked
          </span>
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {CENTRAL_BANKS.map((b) => (
            <div
              key={b.code}
              className="modern-surface group relative overflow-hidden rounded-xl border border-border/60 p-4 transition-colors hover:border-primary/50"
            >
              <span
                className="absolute inset-x-0 top-0 h-0.5 opacity-70"
                style={{ backgroundColor: b.color }}
              />
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: b.color, boxShadow: `0 0 10px ${b.color}` }}
                />
                <span className="font-mono text-sm font-semibold text-foreground">{b.code}</span>
              </div>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{b.bank}</p>
              <p className="text-[11px] text-muted-foreground/70">{b.city}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  </main>
);

export default CurrencyFlow;
