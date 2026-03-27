import CentralBankRates from "@/components/CentralBankRates";
import CentralBankNewsTracker from "@/components/CentralBankNewsTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, TrendingUp, Newspaper } from "lucide-react";

const CentralBankRatesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Building className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Central Banking Hub
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Interest rate forecasts, meeting minutes, and central bank news — all in one place.
          </p>
        </div>

        <Tabs defaultValue="rates" className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 bg-muted">
            <TabsTrigger value="rates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
              <TrendingUp className="h-4 w-4" /> Rates & Forecasts
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
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
