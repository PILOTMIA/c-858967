import ForexHeatMap from "@/components/ForexHeatMap";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Activity, Newspaper, LineChart } from "lucide-react";

const MarketAnalysis = () => {
  const navigate = useNavigate();

  const links = [
    { path: '/charts', icon: LineChart, title: 'Live Charts', desc: 'TradingView charts with performance metrics' },
    { path: '/cot-analysis', icon: BarChart3, title: 'COT Analysis', desc: 'Institutional positioning data' },
    { path: '/economic-radar', icon: Activity, title: 'Economic Radar', desc: 'CPI, PPI, Bonds & Seasonality' },
    { path: '/news', icon: Newspaper, title: 'Market News', desc: 'Sentiment & fundamental news' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Market Analysis</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-xl mx-auto">
          Real-time forex market analysis and insights
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-10">
        <ForexHeatMap />

        {/* Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <div
                key={l.path}
                onClick={() => navigate(l.path)}
                className="group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border border-border/30 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-border/60 hover:scale-[1.02]"
              >
                <Icon className="h-5 w-5 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                <h3 className="text-base font-semibold text-foreground mb-1">{l.title}</h3>
                <p className="text-muted-foreground text-sm">{l.desc}</p>
                <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300 group-hover:translate-x-1" />
              </div>
            );
          })}
        </div>

        {/* MidasFX Banner */}
        <div className="flex justify-center">
          <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity duration-500">
            <img src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" alt="MidasFX Trading" className="rounded-xl max-w-[468px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
