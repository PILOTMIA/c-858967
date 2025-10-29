import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InflationRadar from "@/components/InflationRadar";
import { BarChart3, TrendingUp, DollarSign, Briefcase, PieChart, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EconomicRadar = () => {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Economic Radar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real-time economic indicators and market data from Federal Reserve Economic Data (FRED)
          </p>
        </div>

        {/* Radar Type Tabs */}
        <Tabs defaultValue="inflation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 h-auto bg-card border border-border p-1 rounded-lg">
            <TabsTrigger 
              value="cot" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">COT Radar</span>
              <span className="sm:hidden">COT</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Jobs Radar</span>
              <span className="sm:hidden">Jobs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gdp" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              <PieChart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">GDP Radar</span>
              <span className="sm:hidden">GDP</span>
            </TabsTrigger>
            <TabsTrigger 
              value="inflation" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Inflation Radar</span>
              <span className="sm:hidden">Inflation</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bond" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Bond Radar</span>
              <span className="sm:hidden">Bond</span>
            </TabsTrigger>
            <TabsTrigger 
              value="seasonality" 
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Seasonality</span>
              <span className="sm:hidden">Season</span>
            </TabsTrigger>
          </TabsList>

          {/* COT Radar */}
          <TabsContent value="cot" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">COT Radar</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Commitment of Traders positioning and analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm sm:text-base">
                <p className="text-muted-foreground mb-4">
                  For detailed Commitment of Traders analysis, please visit our dedicated COT Analysis section.
                </p>
                <button 
                  onClick={() => window.location.href = '/cot-analysis'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  View Full COT Analysis
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Radar */}
          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Jobs Radar</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Employment data including Non-Farm Payrolls, unemployment rate, and labor force participation.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GDP Radar */}
          <TabsContent value="gdp" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">GDP Radar</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gross Domestic Product growth, forecasts, and historical trends.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inflation Radar */}
          <TabsContent value="inflation" className="mt-6">
            <InflationRadar />
          </TabsContent>

          {/* Bond Radar */}
          <TabsContent value="bond" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Bond Radar</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Treasury yields, yield curve, and bond market indicators.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seasonality Radar */}
          <TabsContent value="seasonality" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Seasonality Radar</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Historical seasonal patterns and trends in economic data and markets.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* MidasFX Banner */}
        <div className="mt-8 flex justify-center">
          <a 
            href="https://www.midasfx.com/?ib=1127736"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity duration-300 shadow-lg hover:shadow-xl rounded-lg overflow-hidden"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX - Professional Forex Trading"
              className="w-full h-auto max-w-[468px]"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default EconomicRadar;
