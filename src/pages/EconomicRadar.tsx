import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InflationRadar from "@/components/InflationRadar";
import BondRadar from "@/components/BondRadar";
import SeasonalityRadar from "@/components/SeasonalityRadar";
import GDPRadar from "@/components/GDPRadar";
import JobsRadar from "@/components/JobsRadar";
import { BarChart3, TrendingUp, DollarSign, Briefcase, PieChart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EconomicRadar = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Economic Radar</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-2xl mx-auto">
          Real-time economic indicators from FRED, BLS, Eurostat, and central banks worldwide
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-8">
        <Tabs defaultValue="gdp" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 h-auto bg-card/50 backdrop-blur-sm border border-border/30 p-1 rounded-xl">
            <TabsTrigger value="cot" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>COT</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all">
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="gdp" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all">
              <PieChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>GDP</span>
            </TabsTrigger>
            <TabsTrigger value="inflation" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Inflation</span>
              <span className="sm:hidden">CPI</span>
            </TabsTrigger>
            <TabsTrigger value="bond" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Bond</span>
            </TabsTrigger>
            <TabsTrigger value="seasonality" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Seasonality</span>
              <span className="sm:hidden">Season</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cot" className="mt-6">
            <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">COT Radar</h3>
              <p className="text-muted-foreground text-sm mb-6">For detailed Commitment of Traders analysis, visit our dedicated section.</p>
              <button onClick={() => navigate('/cot-analysis')} className="bg-foreground text-background px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105">
                View Full COT Analysis
              </button>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-6"><JobsRadar /></TabsContent>
          <TabsContent value="gdp" className="mt-6"><GDPRadar /></TabsContent>
          <TabsContent value="inflation" className="mt-6"><InflationRadar /></TabsContent>
          <TabsContent value="bond" className="mt-6"><BondRadar /></TabsContent>
          <TabsContent value="seasonality" className="mt-6"><SeasonalityRadar /></TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity duration-500">
            <img src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" alt="MidasFX Trading" className="rounded-xl max-w-[468px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default EconomicRadar;
