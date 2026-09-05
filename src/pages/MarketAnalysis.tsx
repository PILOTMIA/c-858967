import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BarChart3, Activity, Newspaper, LineChart, Circle, ShieldCheck } from "lucide-react";
import LivePriceBoard from "@/components/LivePriceBoard";
import LiveRateTicker from "@/components/LiveRateTicker";
import PipCalculator from "@/components/PipCalculator";

/**
 * Market Analysis — live rate board, session status and an accurate pip calculator.
 * Everything shown here is sourced from the live price feed; no simulated signals.
 */

const MarketAnalysis = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const sessions = [
    { name: "Sydney", open: utcHour >= 21 || utcHour < 6, window: "21:00–06:00 UTC" },
    { name: "Tokyo", open: utcHour >= 23 || utcHour < 8, window: "23:00–08:00 UTC" },
    { name: "London", open: utcHour >= 7 && utcHour < 16, window: "07:00–16:00 UTC" },
    { name: "New York", open: utcHour >= 12 && utcHour < 21, window: "12:00–21:00 UTC" },
  ];
  const activeCount = sessions.filter((s) => s.open).length;

  const links = [
    { path: "/charts", icon: LineChart, title: "Live Charts", desc: "TradingView & performance metrics" },
    { path: "/cot-analysis", icon: BarChart3, title: "COT Analysis", desc: "Institutional positioning data" },
    { path: "/economic-radar", icon: Activity, title: "Economic Radar", desc: "CPI, PPI, bonds & seasonality" },
    { path: "/news", icon: Newspaper, title: "Market News", desc: "Sentiment & fundamental news" },
  ];

  const utcStr = now.toISOString().slice(11, 19);

  return (
    <div className="ma-terminal min-h-screen text-foreground">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-6">

        {/* Status command bar */}
        <header className="ma-panel px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="ma-accent-bar h-10" />
            <div className="min-w-0">
              <p className="ma-eyebrow">Workspace · Live quotes only</p>
              <h1 className="ma-serif text-2xl sm:text-[28px] leading-tight font-bold text-foreground truncate">
                Market Analysis
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <div className="ma-chip">
              <span className="ma-mono text-[11px] text-foreground/90">{utcStr} UTC</span>
            </div>
            <div className="ma-chip ma-chip-live">
              <span className="text-[10px]">{activeCount} of 4 Sessions Open</span>
            </div>
          </div>
        </header>

        {/* Sessions */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {sessions.map((s) => (
            <div
              key={s.name}
              className={`ma-panel p-4 ${s.open ? "!border-emerald-500/40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="ma-mono text-xs text-foreground">{s.name}</span>
                <Circle
                  className={`h-2 w-2 ${s.open ? "fill-emerald-400 text-emerald-400" : "fill-muted-foreground/40 text-muted-foreground/40"}`}
                />
              </div>
              <p className={`text-[11px] mt-2 font-semibold ${s.open ? "text-emerald-400" : "text-muted-foreground"}`}>
                {s.open ? "Open" : "Closed"}
              </p>
              <p className="ma-mono text-[10px] text-muted-foreground mt-0.5">{s.window}</p>
            </div>
          ))}
        </section>

        {/* Live rate board */}
        <LivePriceBoard />

        {/* Pip calculator */}
        <PipCalculator />

        {/* Transparency note */}
        <div className="ma-panel p-4 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This page only displays data we can verify from the live price feed. Simulated pivot signals and
            placeholder "heat map" scores were removed so nothing here implies a live edge we cannot source.
            For positioning and directional research, use COT Analysis and the Weekly Playbook.
          </p>
        </div>

        {/* Related workspaces */}
        <section>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="ma-serif text-lg font-bold text-foreground">Related workspaces</h2>
            <span className="ma-eyebrow">Jump to analysis</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className="ma-panel group text-left p-5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="ma-serif mt-4 text-base font-bold text-foreground">{l.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{l.desc}</p>
                  <span className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Partner strip */}
        <div className="flex justify-center pt-2">
          <a
            href="https://www.midasfx.com/?ib=1127736"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-40 hover:opacity-90 transition-opacity duration-500"
          >
            <img
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png"
              alt="MidasFX Trading"
              className="rounded-xl max-w-[468px]"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
