import COTData from "@/components/COTData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Building2 } from "lucide-react";

const COTAnalysis = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">COT Analysis</h1>
          <p className="text-muted-foreground text-lg">
            Commitment of Traders data provides insights into institutional and retail positioning in forex markets
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Commercial Traders
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Institutions</div>
              <p className="text-xs text-muted-foreground">
                Banks, hedge funds, and large financial institutions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Non-Commercial
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Speculators</div>
              <p className="text-xs text-muted-foreground">
                Large speculators and investment funds
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                Retail Traders
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">Small Specs</div>
              <p className="text-xs text-muted-foreground">
                Individual and small institutional traders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main COT Data Component */}
        <COTData />

        {/* Educational Section */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle className="text-card-foreground">Understanding COT Data</CardTitle>
            <CardDescription>
              Learn how to interpret Commitment of Traders reports for better trading decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Commercial Traders (Smart Money)</h3>
                <p className="text-muted-foreground text-sm">
                  These are the institutions that actually need the currencies for business purposes. 
                  When they're heavily positioned one way, it often indicates the underlying fundamentals.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Non-Commercial (Large Specs)</h3>
                <p className="text-muted-foreground text-sm">
                  Large speculative traders often drive short-term price movements. 
                  Extreme positioning can signal potential reversals.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Net Positioning</h3>
                <p className="text-muted-foreground text-sm">
                  The difference between long and short positions shows overall market sentiment. 
                  Extreme readings often precede trend changes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Weekly Changes</h3>
                <p className="text-muted-foreground text-sm">
                  Look for significant changes in positioning week-over-week to identify 
                  shifts in market sentiment before they show up in price.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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

export default COTAnalysis;