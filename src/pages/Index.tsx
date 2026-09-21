import MarketStats from "@/components/MarketStats";
import ClientSignup from "@/components/ClientSignup";
import ChatBot from "@/components/ChatBot";
import CustomerServiceChat from "@/components/CustomerServiceChat";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BookOpen, Users, BarChart3, Building, Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import COTMarketSnapshot from "@/components/COTMarketSnapshot";

const Index = () => {
  const navigate = useNavigate();

  const sections = [
    { path: '/market-analysis', icon: TrendingUp, title: 'Market Analysis', desc: 'Real-time charts, heat maps & forex analysis', accent: 'group-hover:text-blue-400' },
    { path: '/cot-analysis', icon: BarChart3, title: 'COT Analysis', desc: 'Institutional positioning & Pair Analyzer', accent: 'group-hover:text-violet-400' },
    { path: '/central-bank-rates', icon: Building, title: 'Central Banking', desc: 'Rate forecasts, minutes & CB news', accent: 'group-hover:text-amber-400' },
    { path: '/news', icon: Newspaper, title: 'Market News', desc: 'Sentiment analysis & fundamental news', accent: 'group-hover:text-cyan-400' },
    { path: '/education', icon: BookOpen, title: 'Education', desc: 'Learn forex from beginner to advanced', accent: 'group-hover:text-emerald-400' },
    { path: '/community', icon: Users, title: 'Community', desc: 'Trading community & premium signals', accent: 'group-hover:text-pink-400' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <section className="hq-page pb-4">
        <div className="grid gap-6 border-b border-border/70 py-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="hq-kicker"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live decision desk</div>
            <h1 className="mt-3 max-w-4xl text-5xl font-black uppercase leading-[0.92] text-foreground sm:text-7xl lg:text-8xl">MIA FX <span className="text-primary">Labs</span></h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">Institutional positioning, live market confirmation, macro catalysts and risk conditions in one tactical workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/weekly-playbook')}>Open weekly playbook <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => navigate('/cot-analysis')}>Inspect COT data</Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="hq-page space-y-10 pt-0">
        <COTMarketSnapshot />
        {/* Market Stats */}
        <MarketStats />

        {/* Section Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.path}
                onClick={() => navigate(s.path)}
                 className="group relative cursor-pointer rounded-md border border-border/60 bg-card p-5 transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                <Icon className={`h-5 w-5 text-muted-foreground mb-4 transition-colors ${s.accent}`} />
                <h3 className="text-base font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300 group-hover:translate-x-1" />
              </div>
            );
          })}
        </div>

        {/* VIP CTA */}
        <div className="relative overflow-hidden rounded-md border border-border/70 bg-card p-8 text-center sm:p-12">
          <div className="relative z-10">
            <h2 className="font-display-hero text-3xl sm:text-4xl font-bold text-foreground mb-4">VIP Signal Access</h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto font-light">
              Premium trading signals and expert analysis delivered directly to you
            </p>
            <ClientSignup />
          </div>
        </div>

        {/* MidasFX Banner */}
        <div className="flex justify-center">
          <a
            href="https://www.midasfx.com/?ib=1127736"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-50 hover:opacity-100 transition-opacity duration-500"
          >
            <img
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png"
              alt="MidasFX Trading"
              className="rounded-xl max-w-[468px]"
            />
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 border-t border-border/20">
          <p className="text-sm text-muted-foreground/60 tracking-wide uppercase mb-2">Men In Action LLC</p>
          <p className="text-xs text-muted-foreground/40 mb-4">© 2024–2026 · Professional Trading Education & Analysis</p>
          <button
            onClick={() => navigate('/risk-disclaimer')}
            className="text-xs text-muted-foreground/40 hover:text-destructive transition-colors underline underline-offset-4"
          >
            Risk Disclaimer
          </button>
        </footer>
      </div>

      <ChatBot />
      <CustomerServiceChat />
    </div>
  );
};

export default Index;
