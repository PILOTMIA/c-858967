import CentralBankRates from "@/components/CentralBankRates";
import CentralBankNewsTracker from "@/components/CentralBankNewsTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Newspaper } from "lucide-react";

const CentralBankRatesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Central Banking</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-2xl mx-auto">
          Interest rate forecasts, meeting minutes, and central bank news — all in one place.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <Tabs defaultValue="rates" className="space-y-8">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 bg-card/50 backdrop-blur-sm border border-border/30 rounded-full p-1">
            <TabsTrigger value="rates" className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full gap-1.5 transition-all">
              <TrendingUp className="h-4 w-4" /> Rates & Forecasts
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full gap-1.5 transition-all">
              <Newspaper className="h-4 w-4" /> CB News Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates">
            <CentralBankRates />
          </TabsContent>

          <TabsContent value="news">
            <CentralBankNewsTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CentralBankRatesPage;
