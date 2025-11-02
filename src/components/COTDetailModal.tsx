import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface COTDetailData {
  currency: string;
  commercialLong: number;
  commercialShort: number;
  nonCommercialLong: number;
  nonCommercialShort: number;
  reportDate: string;
  weeklyChange: number;
}

interface COTDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: COTDetailData | null;
}

const formatCurrencyPair = (currency: string): string => {
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF'];
  return usdBasePairs.includes(currency) ? `USD/${currency}` : `${currency}/USD`;
};

const COTDetailModal = ({ open, onOpenChange, data }: COTDetailModalProps) => {
  if (!data) return null;

  const netCommercial = data.commercialLong - data.commercialShort;
  const netNonCommercial = data.nonCommercialLong - data.nonCommercialShort;
  const totalPositions = data.commercialLong + data.commercialShort + data.nonCommercialLong + data.nonCommercialShort;
  
  const commercialBullishPercent = (data.commercialLong / (data.commercialLong + data.commercialShort)) * 100;
  const nonCommercialBullishPercent = (data.nonCommercialLong / (data.nonCommercialLong + data.nonCommercialShort)) * 100;

  const getSignalStrength = (netPosition: number): string => {
    const absNet = Math.abs(netPosition);
    if (absNet > 50000) return "STRONG";
    if (absNet > 30000) return "MODERATE";
    return "WEAK";
  };

  const getTradeRecommendation = () => {
    const commercialSignal = netCommercial > 0 ? "bullish" : "bearish";
    const nonCommercialSignal = netNonCommercial > 0 ? "bullish" : "bearish";
    const commercialStrength = getSignalStrength(netCommercial);
    const alignment = commercialSignal === nonCommercialSignal;

    let recommendation = "";
    let reasoning = "";
    let signal: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";

    if (netCommercial > 30000) {
      signal = "BUY";
      recommendation = `Strong BUY signal for ${formatCurrencyPair(data.currency)}`;
      reasoning = `Commercial traders (smart money) are heavily long with ${netCommercial.toLocaleString()} net contracts. This indicates institutional accumulation and suggests fundamental strength. ${
        alignment ? "Large speculators are aligned, adding conviction." : "Contrarian to speculators, which often marks major turning points."
      }`;
    } else if (netCommercial < -30000) {
      signal = "SELL";
      recommendation = `Strong SELL signal for ${formatCurrencyPair(data.currency)}`;
      reasoning = `Commercial traders are heavily short with ${netCommercial.toLocaleString()} net contracts. This suggests institutions are hedging or expecting weakness. ${
        alignment ? "Large speculators are aligned, increasing bearish pressure." : "Contrarian to speculators, which may signal reversal ahead."
      }`;
    } else if (Math.abs(netCommercial) > 15000) {
      signal = netCommercial > 0 ? "BUY" : "SELL";
      recommendation = `Moderate ${signal} signal for ${formatCurrencyPair(data.currency)}`;
      reasoning = `Commercial positioning shows ${commercialSignal} bias with ${netCommercial.toLocaleString()} net position. ${commercialStrength} signal strength suggests ${
        signal === "BUY" ? "accumulation" : "distribution"
      } phase.`;
    } else {
      recommendation = `NEUTRAL - Wait for clearer signal on ${formatCurrencyPair(data.currency)}`;
      reasoning = `Commercial positioning is relatively balanced (${netCommercial.toLocaleString()} net). No strong directional bias from institutional traders. Wait for more extreme positioning before taking positions.`;
    }

    return { recommendation, reasoning, signal };
  };

  const { recommendation, reasoning, signal } = getTradeRecommendation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold flex items-center gap-2">
            {formatCurrencyPair(data.currency)} - Deep Dive Analysis
          </DialogTitle>
          <DialogDescription className="text-base">
            Comprehensive CFTC Commitment of Traders analysis • Report Date: {new Date(data.reportDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Trade Signal Card */}
          <Card className={`border-2 ${
            signal === "BUY" ? "border-success bg-success/5" : 
            signal === "SELL" ? "border-destructive bg-destructive/5" : 
            "border-muted bg-muted/5"
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {signal === "BUY" ? <TrendingUp className="w-6 h-6 text-success" /> : 
                 signal === "SELL" ? <TrendingDown className="w-6 h-6 text-destructive" /> :
                 <AlertCircle className="w-6 h-6 text-muted-foreground" />}
                Trading Signal: <span className={`font-extrabold ${
                  signal === "BUY" ? "text-success" : 
                  signal === "SELL" ? "text-destructive" : 
                  "text-muted-foreground"
                }`}>{signal}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg font-bold">{recommendation}</p>
              <p className="text-muted-foreground leading-relaxed">{reasoning}</p>
              
              {data.weeklyChange !== 0 && (
                <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                  <p className="text-sm font-semibold">
                    Weekly Change: <span className={`font-mono font-bold ${data.weeklyChange > 0 ? "text-success" : "text-destructive"}`}>
                      {data.weeklyChange > 0 ? "+" : ""}{data.weeklyChange.toLocaleString()}
                    </span> contracts
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.abs(data.weeklyChange) > 10000 
                      ? "Significant position change indicates shifting sentiment" 
                      : "Moderate position adjustment"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Position Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Commercial Traders */}
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-primary" />
                  Commercial Traders (Smart Money)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Long Positions:</span>
                    <span className="font-mono font-bold text-success">{data.commercialLong.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Short Positions:</span>
                    <span className="font-mono font-bold text-destructive">{data.commercialShort.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3 pt-2 border-t border-border">
                    <span className="font-bold">Net Position:</span>
                    <span className={`font-mono font-extrabold text-base ${netCommercial > 0 ? "text-success" : "text-destructive"}`}>
                      {netCommercial > 0 ? "+" : ""}{netCommercial.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Bullish Positioning</span>
                      <span className="font-bold">{commercialBullishPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={commercialBullishPercent} className="h-2" />
                  </div>
                </div>

                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-foreground">
                    {netCommercial > 0 
                      ? "✅ Institutions are accumulating this currency - typically indicates fundamental strength"
                      : "⚠️ Institutions are reducing exposure - suggests caution or anticipated weakness"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Non-Commercial Traders */}
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  Non-Commercial (Large Speculators)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Long Positions:</span>
                    <span className="font-mono font-bold text-success">{data.nonCommercialLong.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Short Positions:</span>
                    <span className="font-mono font-bold text-destructive">{data.nonCommercialShort.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3 pt-2 border-t border-border">
                    <span className="font-bold">Net Position:</span>
                    <span className={`font-mono font-extrabold text-base ${netNonCommercial > 0 ? "text-success" : "text-destructive"}`}>
                      {netNonCommercial > 0 ? "+" : ""}{netNonCommercial.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Bullish Positioning</span>
                      <span className="font-bold">{nonCommercialBullishPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={nonCommercialBullishPercent} className="h-2" />
                  </div>
                </div>

                <div className="bg-warning/10 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-foreground">
                    {Math.abs(netNonCommercial) > 40000
                      ? "⚠️ Extreme speculative positioning - potential reversal zone"
                      : "📊 Moderate speculative activity - supporting current trend"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📚 Understanding This Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-primary">Why Commercial Traders Matter:</p>
                <p className="text-muted-foreground">
                  Commercial traders (banks, corporations) use forex markets for legitimate business needs and hedging. 
                  Their positions often reflect underlying economic fundamentals and have historically been the most reliable indicator of future price direction.
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold text-warning">Interpreting Speculative Positions:</p>
                <p className="text-muted-foreground">
                  Large speculators drive short-term momentum but extreme positioning often marks market tops/bottoms. 
                  When speculators are extremely long or short, it can signal overcrowding and imminent reversals.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-foreground">How to Use This Analysis:</p>
                <p className="text-muted-foreground">
                  Best signals occur when: (1) Commercial positioning is extreme (±30,000+), (2) Weekly changes show continued momentum, 
                  (3) Speculators are positioned opposite to commercials (contrarian indicator). Always combine COT data with technical analysis and risk management.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default COTDetailModal;
