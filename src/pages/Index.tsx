import MarketStats from "@/components/MarketStats";
import ClientSignup from "@/components/ClientSignup";
import ChatBot from "@/components/ChatBot";
import CustomerServiceChat from "@/components/CustomerServiceChat";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BookOpen, Users, BarChart3, Building, Newspaper, ArrowRight } from "lucide-react";

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
      {/* Hero Section — Apple-inspired */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-4">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-500/15 animate-glow-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 animate-glow-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Live badge */}
          <div className="animate-text-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm text-muted-foreground text-xs tracking-widest uppercase mb-10">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live Markets
          </div>
          
          {/* Main title */}
          <h1 className="font-display-hero animate-text-reveal text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-foreground leading-[0.9] mb-6">
            MIA FX
            <span className="block bg-gradient-to-r from-primary via-violet-400 to-blue-400 bg-clip-text text-transparent">
              Labs
            </span>
          </h1>

          {/* Divider line */}
          <div className="flex justify-center mb-8">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-line-expand" />
          </div>

          {/* Subtitle */}
          <p className="animate-text-reveal-delay text-muted-foreground text-lg sm:text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Institutional-grade forex analysis.
            <span className="text-foreground font-medium"> Built for serious traders.</span>
          </p>

          {/* CTA buttons */}
          <div className="animate-text-reveal-delay-2 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/education')}
              className="group relative bg-foreground text-background px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
            >
              Get Started
              <ArrowRight className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/cot-analysis')}
              className="group px-8 py-4 rounded-full font-semibold text-base border border-border/50 bg-card/30 backdrop-blur-sm text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-card/50"
            >
              COT Pair Analyzer
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-16">
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
                className="group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border border-border/30 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-border/60 hover:scale-[1.02]"
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
        <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
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
