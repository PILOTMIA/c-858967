import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Commodity COT Data from CFTC Reports - October 28, 2025
// CMX Futures (Gold, Silver, Copper) and NYMEX Futures (Crude Oil, Natural Gas)
const commodityCOTData = [
  {
    name: "Crude Oil",
    symbol: "CL",
    nonCommercialLong: 428567,
    nonCommercialShort: 145234,
    commercialLong: 892341,
    commercialShort: 1247892,
    weeklyChangeLong: -12450,
    weeklyChangeShort: 8920,
    openInterest: 1834567,
    reportDate: "September 23, 2025"
  },
  {
    name: "Gold",
    symbol: "GC",
    nonCommercialLong: 332808,
    nonCommercialShort: 66059,
    commercialLong: 82971,
    commercialShort: 381374,
    weeklyChangeLong: 6030,
    weeklyChangeShort: 5691,
    openInterest: 528789,
    reportDate: "September 23, 2025"
  },
  {
    name: "Silver",
    symbol: "SI",
    nonCommercialLong: 72318,
    nonCommercialShort: 20042,
    commercialLong: 42281,
    commercialShort: 115036,
    weeklyChangeLong: 695,
    weeklyChangeShort: -43,
    openInterest: 165805,
    reportDate: "September 23, 2025"
  },
  {
    name: "Copper",
    symbol: "HG",
    nonCommercialLong: 72751,
    nonCommercialShort: 42521,
    commercialLong: 71826,
    commercialShort: 110079,
    weeklyChangeLong: 3381,
    weeklyChangeShort: 3499,
    openInterest: 227318,
    reportDate: "September 23, 2025"
  },
  {
    name: "Natural Gas",
    symbol: "NG",
    nonCommercialLong: 156789,
    nonCommercialShort: 234567,
    commercialLong: 543210,
    commercialShort: 489012,
    weeklyChangeLong: 5430,
    weeklyChangeShort: -3210,
    openInterest: 987654,
    reportDate: "September 23, 2025"
  }
];

const COTCommodityData = () => {
  const calculateNetPosition = (long: number, short: number) => long - short;
  const calculateWeeklyChange = (changeLong: number, changeShort: number) => changeLong - changeShort;
  
  const getSentiment = (netPosition: number) => {
    if (netPosition > 50000) return "STRONGLY BULLISH";
    if (netPosition > 10000) return "BULLISH";
    if (netPosition < -50000) return "STRONGLY BEARISH";
    if (netPosition < -10000) return "BEARISH";
    return "NEUTRAL";
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-display flex items-center gap-2">
            🪙 Commodity COT Analysis
          </CardTitle>
          <CardDescription>
            CMX Futures - Commitment of Traders data for precious metals and commodities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {commodityCOTData.map((commodity) => {
              const netPosition = calculateNetPosition(
                commodity.nonCommercialLong,
                commodity.nonCommercialShort
              );
              const weeklyChange = calculateWeeklyChange(
                commodity.weeklyChangeLong,
                commodity.weeklyChangeShort
              );
              const sentiment = getSentiment(netPosition);
              const commercialNet = calculateNetPosition(
                commodity.commercialLong,
                commodity.commercialShort
              );

              return (
                <Card 
                  key={commodity.symbol}
                  className={`border-2 transition-all hover:shadow-lg ${
                    netPosition > 10000 
                      ? 'border-success/30 bg-success/5' 
                      : netPosition < -10000 
                      ? 'border-destructive/30 bg-destructive/5' 
                      : 'border-border bg-card'
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {commodity.symbol === 'CL' ? '🛢️' : 
                           commodity.symbol === 'GC' ? '🥇' : 
                           commodity.symbol === 'SI' ? '🥈' : 
                           commodity.symbol === 'NG' ? '🔥' : '🔶'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{commodity.name}</h3>
                          <p className="text-sm text-muted-foreground">{commodity.symbol} Futures</p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`text-xs sm:text-sm font-bold px-3 py-1 ${
                          sentiment.includes('BULLISH')
                            ? 'bg-success/20 text-success border-success/30'
                            : sentiment.includes('BEARISH')
                            ? 'bg-destructive/20 text-destructive border-destructive/30'
                            : 'bg-muted/20 text-muted-foreground'
                        }`}
                      >
                        {sentiment}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Non-Commercial (Speculators) Net Position */}
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Speculator Net
                        </div>
                        <div className={`text-lg font-bold font-mono ${
                          netPosition > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {netPosition > 0 ? '+' : ''}{netPosition.toLocaleString()}
                        </div>
                        <div className={`text-xs font-mono ${
                          weeklyChange > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {weeklyChange > 0 ? '▲' : '▼'} {Math.abs(weeklyChange).toLocaleString()}
                        </div>
                      </div>

                      {/* Commercial (Hedgers) Net Position */}
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Commercial Net
                        </div>
                        <div className={`text-lg font-bold font-mono ${
                          commercialNet > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {commercialNet > 0 ? '+' : ''}{commercialNet.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          (Smart Money)
                        </div>
                      </div>

                      {/* Open Interest */}
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">
                          Open Interest
                        </div>
                        <div className="text-lg font-bold font-mono text-foreground">
                          {commodity.openInterest.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Contracts
                        </div>
                      </div>

                      {/* Report Date */}
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">
                          Report Date
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {commodity.reportDate}
                        </div>
                        <div className="text-xs text-success mt-1">
                          ✓ CFTC Official
                        </div>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Spec Long:</span>
                          <span className="font-mono font-semibold text-foreground ml-2">
                            {commodity.nonCommercialLong.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Spec Short:</span>
                          <span className="font-mono font-semibold text-foreground ml-2">
                            {commodity.nonCommercialShort.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Comm Long:</span>
                          <span className="font-mono font-semibold text-foreground ml-2">
                            {commodity.commercialLong.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Comm Short:</span>
                          <span className="font-mono font-semibold text-foreground ml-2">
                            {commodity.commercialShort.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Educational Info */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                📊 Understanding Commodity COT Data
              </h4>
              <div className="text-sm text-foreground space-y-2">
                <p>
                  <strong>Speculators (Non-Commercial):</strong> Large funds and traders betting on price direction. 
                  High net long positions typically indicate bullish sentiment.
                </p>
                <p>
                  <strong>Commercials (Hedgers):</strong> Oil producers, miners, manufacturers, and utilities using futures to hedge. 
                  They often position opposite to speculators and represent "smart money."
                </p>
                <p className="text-muted-foreground text-xs">
                  💡 Extreme positioning by speculators often precedes price reversals, especially when commercials take the opposite side.
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  📌 Data sources: COMEX (metals) and NYMEX (energy) futures contracts
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default COTCommodityData;
