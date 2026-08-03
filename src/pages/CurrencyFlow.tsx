import PageHeader from "@/components/PageHeader";
import CurrencyFlowGlobeWidget from "@/components/globe/CurrencyFlowGlobeWidget";
import { CENTRAL_BANKS } from "@/components/globe/currencyFlowData";

const CurrencyFlow = () => (
  <main className="container mx-auto px-4 py-10">
    <PageHeader
      eyebrow="Institutional Positioning"
      title="3D Global Currency Flow"
      subtitle="Weekly CFTC Commitments of Traders positioning rendered as live capital flow between central banks. Scrub the timeline to watch speculative money rotate across the majors."
    />
    <CurrencyFlowGlobeWidget />

    <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {CENTRAL_BANKS.map((b) => (
        <div key={b.code} className="modern-surface rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
            <span className="font-mono text-sm font-semibold text-foreground">{b.code}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{b.bank}</p>
          <p className="text-xs text-muted-foreground/70">{b.city}</p>
        </div>
      ))}
    </section>
  </main>
);

export default CurrencyFlow;
