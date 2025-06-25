import MarketStats from "@/components/MarketStats";
import ForexChart from "@/components/ForexChart";
import ForexPerformance from "@/components/ForexPerformance";
import ForexList from "@/components/ForexList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Men In Action LLC Forex Department</h1>
          <p className="text-muted-foreground">Welcome back to your trading platform</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ForexChart />
          </div>
          <div>
            <ForexPerformance />
          </div>
        </div>
        
        <ForexList />
      </div>
    </div>
  );
};

export default Index;
