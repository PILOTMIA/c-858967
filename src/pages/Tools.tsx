import RealTimeData from "@/components/RealTimeData";
import SentimentWidget from "@/components/SentimentWidget";
import TradingBot from "@/components/TradingBot";
import MarketClock from "@/components/MarketClock";
import { Shield, Zap, TrendingUp, ArrowUpRight, Globe2 } from "lucide-react";

const Tools = () => {
  const brokerLink = "https://www.midasfx.com/?ib=1127736";
  const clientPortal = "https://my.midasfx.com/?ib=1127736";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Trading Tools</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-xl mx-auto">
          Essential tools for your daily trading workflow
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-8">
        {/* Preferred broker CTA */}
        <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/50 to-card/30 backdrop-blur-sm p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            <a
              href={brokerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-2xl overflow-hidden border border-border/40 bg-background/40 hover:border-primary/50 transition-all hover:scale-[1.02]"
            >
              <img
                src="https://my.midasfx.com/themes/midasfx/img/b/200x200.png"
                alt="MidasFX — Preferred Broker"
                width={200}
                height={200}
                className="block"
              />
            </a>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold uppercase tracking-wider">
                  <Shield className="h-3 w-3" /> Preferred Broker
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">IB Code · 1127736</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Trade with MidasFX
              </h2>
              <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
                The broker I personally use and recommend. Tight spreads, fast execution, and
                access to the full FX, metals, and index suite. Sign up through the links below to
                support MIA FX Labs at no extra cost.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <BrokerPerk icon={Zap} title="Fast execution" desc="Institutional liquidity" />
                <BrokerPerk icon={TrendingUp} title="Low spreads" desc="From 0.0 pips" />
                <BrokerPerk icon={Globe2} title="Global access" desc="FX · Metals · Indices" />
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={brokerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Open account <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={clientPortal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border/50 bg-background/40 text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
                >
                  Client portal <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Affiliate disclosure: MIA FX Labs may earn a commission when you register through these links.
              </p>
            </div>
          </div>
        </section>

        <MarketClock />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealTimeData />
          <SentimentWidget />
        </div>
      </div>

      <TradingBot />
    </div>
  );
};

const BrokerPerk = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/40 p-3">
    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="min-w-0">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  </div>
);

export default Tools;
