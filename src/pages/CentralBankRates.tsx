import CentralBankRates from "@/components/CentralBankRates";

const CentralBankRatesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Central Bank Interest Rate Forecaster
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay ahead of the markets with real-time central bank rates, projections, and seasonality analysis. 
            Essential intelligence for forex traders and financial professionals.
          </p>
        </div>
        <CentralBankRates />
      </div>
    </div>
  );
};

export default CentralBankRatesPage;