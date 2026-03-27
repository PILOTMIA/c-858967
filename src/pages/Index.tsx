import MarketStats from "@/components/MarketStats";
import ClientSignup from "@/components/ClientSignup";
import ChatBot from "@/components/ChatBot";
import CustomerServiceChat from "@/components/CustomerServiceChat";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BookOpen, Users, BarChart3, Building, Newspaper } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const sections = [
    { path: '/market-analysis', icon: TrendingUp, title: 'Market Analysis', desc: 'Real-time charts, heat maps, and forex analysis', color: 'from-blue-600/20 to-blue-800/20 border-blue-700/50 hover:border-blue-500' },
    { path: '/cot-analysis', icon: BarChart3, title: 'COT Analysis', desc: 'Institutional positioning & Pair Analyzer', color: 'from-purple-600/20 to-purple-800/20 border-purple-700/50 hover:border-purple-500' },
    { path: '/central-bank-rates', icon: Building, title: 'Central Banking', desc: 'Rate forecasts, meeting minutes & CB news', color: 'from-amber-600/20 to-amber-800/20 border-amber-700/50 hover:border-amber-500' },
    { path: '/news', icon: Newspaper, title: 'Market News', desc: 'Sentiment analysis & fundamental news', color: 'from-cyan-600/20 to-cyan-800/20 border-cyan-700/50 hover:border-cyan-500' },
    { path: '/education', icon: BookOpen, title: 'Education', desc: 'Learn forex from beginner to advanced', color: 'from-green-600/20 to-green-800/20 border-green-700/50 hover:border-green-500' },
    { path: '/community', icon: Users, title: 'Community', desc: 'Join our trading community & get signals', color: 'from-pink-600/20 to-pink-800/20 border-pink-700/50 hover:border-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative text-center py-16 sm:py-20 bg-gradient-to-b from-card to-background border-b border-border">
        <div className="relative z-10 px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            LIVE
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trading Command Center
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Professional forex analysis, education, and community. Transform your trading with institutional-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              onClick={() => navigate('/education')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Learning
            </button>
            <button 
              onClick={() => navigate('/cot-analysis')}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg font-semibold transition-colors border border-border"
            >
              COT Pair Analyzer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Market Stats */}
        <MarketStats />

        {/* Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.path}
                onClick={() => navigate(s.path)}
                className={`bg-gradient-to-br ${s.color} p-5 rounded-xl cursor-pointer transition-all duration-200 border`}
              >
                <Icon className="h-6 w-6 text-foreground mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* VIP CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8 rounded-xl text-center border border-primary/30">
          <h2 className="text-2xl font-bold text-foreground mb-3">VIP Signal Access</h2>
          <p className="text-muted-foreground mb-5 max-w-lg mx-auto">
            Get premium trading signals and expert analysis delivered directly to you
          </p>
          <ClientSignup />
        </div>

        {/* MidasFX Banner */}
        <div className="flex justify-center">
          <a 
            href="https://www.midasfx.com/?ib=1127736" 
            target="_blank" 
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX Trading" 
              className="rounded-lg border border-border max-w-[468px]"
            />
          </a>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <h3 className="text-xl font-bold text-foreground mb-2">Men In Action LLC</h3>
          <p className="text-muted-foreground mb-3">Professional Trading Education & Analysis</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            © 2024–2026 • Empowering Traders Worldwide
          </div>
          <button
            onClick={() => navigate('/risk-disclaimer')}
            className="text-sm text-destructive/70 hover:text-destructive underline transition-colors"
          >
            ⚠️ Risk Disclaimer
          </button>
        </div>
      </div>

      <ChatBot />
      <CustomerServiceChat />
    </div>
  );
};

export default Index;
