import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Info, Clock, Target } from "lucide-react";
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

// Currency-specific analysis based on CFTC Oct 14, 2025 data
const getCurrencyAnalysis = (currency: string, netNonCommercial: number, netCommercial: number, weeklyChange: number) => {
  const isUsdBase = ['JPY', 'CAD', 'MXN', 'CHF'].includes(currency);
  
  const analysisData: Record<string, {
    signal: 'BUY' | 'SELL' | 'NEUTRAL';
    recommendation: string;
    reasoning: string;
    timeframe: string;
    entryZone: string;
    targetZone: string;
    stopZone: string;
    keyLevels: string;
  }> = {
    EUR: {
      signal: 'BUY',
      recommendation: 'BUY EUR/USD on pullbacks',
      reasoning: `Hedge funds (Leveraged Funds) are NET LONG EUR with +${netNonCommercial.toLocaleString()} contracts. Asset Managers hold massive long positions (499K vs 128K short), showing strong institutional bullish conviction. Weekly change of +893 contracts confirms continued accumulation.`,
      timeframe: 'DAILY/4H charts - Swing trade setup (1-3 weeks)',
      entryZone: '1.0850 - 1.0880 (on pullbacks to 20 EMA)',
      targetZone: '1.1050 - 1.1100 (previous swing high)',
      stopZone: 'Below 1.0780 (recent support)',
      keyLevels: 'Support: 1.0850, 1.0780 | Resistance: 1.0950, 1.1050'
    },
    GBP: {
      signal: 'BUY',
      recommendation: 'STRONG BUY GBP/USD - Aggressive accumulation detected',
      reasoning: `Hedge funds are HEAVILY NET LONG GBP with +${netNonCommercial.toLocaleString()} contracts - one of the largest positions! Weekly change of +14,487 contracts shows MASSIVE new buying. This is aggressive institutional accumulation signaling strong upside momentum.`,
      timeframe: 'DAILY/4H charts - Momentum trade (1-2 weeks)',
      entryZone: '1.3000 - 1.3050 (current levels or minor pullbacks)',
      targetZone: '1.3200 - 1.3280 (2023 highs)',
      stopZone: 'Below 1.2920 (swing low)',
      keyLevels: 'Support: 1.3000, 1.2920 | Resistance: 1.3150, 1.3280'
    },
    JPY: {
      signal: 'SELL',
      recommendation: 'BUY USD/JPY - Funds heavily short JPY',
      reasoning: `Hedge funds are EXTREMELY NET SHORT JPY with ${netNonCommercial.toLocaleString()} contracts - the most bearish currency! Dealers also massively short. Despite +3,531 weekly change (position reduction), positioning remains deeply bearish. JPY weakness expected to continue.`,
      timeframe: 'DAILY/4H charts - Trend following (2-4 weeks)',
      entryZone: '151.50 - 152.50 (on dips)',
      targetZone: '155.00 - 156.00 (2024 highs)',
      stopZone: 'Below 149.50 (key support)',
      keyLevels: 'Support: 151.00, 149.50 | Resistance: 154.00, 156.00'
    },
    CHF: {
      signal: 'NEUTRAL',
      recommendation: 'NEUTRAL USD/CHF - Wait for clearer signal',
      reasoning: `Hedge funds are slightly NET SHORT CHF with ${netNonCommercial.toLocaleString()} contracts. Positioning is relatively balanced with no extreme readings. CHF primarily acts as safe haven during risk-off events. Wait for risk sentiment shift or extreme positioning.`,
      timeframe: 'Watch for catalyst - No immediate trade',
      entryZone: 'N/A - Wait for risk-off event or extreme COT reading',
      targetZone: 'Range: 0.8600 - 0.8800',
      stopZone: 'N/A',
      keyLevels: 'Support: 0.8600, 0.8500 | Resistance: 0.8750, 0.8850'
    },
    AUD: {
      signal: 'BUY',
      recommendation: 'BUY AUD/USD - Fresh institutional buying',
      reasoning: `Hedge funds are NET LONG AUD with +${netNonCommercial.toLocaleString()} contracts. Weekly change of +8,460 shows STRONG fresh buying - one of the biggest weekly increases! Asset managers repositioning bullish. Risk-on sentiment supports AUD strength.`,
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)',
      entryZone: '0.6600 - 0.6650 (on pullbacks)',
      targetZone: '0.6800 - 0.6850 (previous resistance)',
      stopZone: 'Below 0.6550 (recent lows)',
      keyLevels: 'Support: 0.6600, 0.6550 | Resistance: 0.6750, 0.6850'
    },
    CAD: {
      signal: 'BUY',
      recommendation: 'BUY USD/CAD - Extreme bearish CAD positioning',
      reasoning: `Hedge funds are EXTREMELY NET SHORT CAD with ${netNonCommercial.toLocaleString()} contracts - one of the most extreme bearish positions! Despite +10,191 weekly change (some covering), positioning remains deeply short. Oil weakness and rate differentials support USD/CAD upside.`,
      timeframe: 'DAILY/4H charts - Trend following (2-4 weeks)',
      entryZone: '1.3800 - 1.3850 (on dips)',
      targetZone: '1.4000 - 1.4100 (2024 highs)',
      stopZone: 'Below 1.3700 (key support)',
      keyLevels: 'Support: 1.3750, 1.3650 | Resistance: 1.3950, 1.4100'
    },
    MXN: {
      signal: 'SELL',
      recommendation: 'SELL USD/MXN - Hedge funds bullish on peso',
      reasoning: `Hedge funds are STRONGLY NET LONG MXN with +${netNonCommercial.toLocaleString()} contracts. High Mexican rates make carry trade attractive. Despite -15,404 weekly change (profit taking), core bullish positioning intact. Peso strength expected to continue.`,
      timeframe: 'DAILY charts - Carry trade (3-6 weeks)',
      entryZone: '17.60 - 17.80 (on bounces)',
      targetZone: '17.00 - 17.20 (recent lows)',
      stopZone: 'Above 18.00 (breakout level)',
      keyLevels: 'Support: 17.20, 17.00 | Resistance: 17.80, 18.00'
    },
    NZD: {
      signal: 'BUY',
      recommendation: 'BUY NZD/USD - Gradual bullish bias',
      reasoning: `Hedge funds are NET LONG NZD with +${netNonCommercial.toLocaleString()} contracts. Dealers show extremely bullish positioning. Weekly change of +147 is minor but positioning remains constructive. Gradual NZD strength expected.`,
      timeframe: 'DAILY charts - Patient swing trade (2-4 weeks)',
      entryZone: '0.6000 - 0.6050 (on pullbacks)',
      targetZone: '0.6200 - 0.6250 (resistance zone)',
      stopZone: 'Below 0.5950 (recent lows)',
      keyLevels: 'Support: 0.6000, 0.5950 | Resistance: 0.6150, 0.6250'
    }
  };

  return analysisData[currency] || {
    signal: 'NEUTRAL' as const,
    recommendation: `Monitor ${formatCurrencyPair(currency)}`,
    reasoning: `Net non-commercial position: ${netNonCommercial.toLocaleString()} contracts.`,
    timeframe: 'Wait for clearer signal',
    entryZone: 'N/A',
    targetZone: 'N/A',
    stopZone: 'N/A',
    keyLevels: 'Check technical levels'
  };
};

const COTDetailModal = ({ open, onOpenChange, data }: COTDetailModalProps) => {
  if (!data) return null;

  const netCommercial = data.commercialLong - data.commercialShort;
  const netNonCommercial = data.nonCommercialLong - data.nonCommercialShort;
  
  const commercialBullishPercent = (data.commercialLong / (data.commercialLong + data.commercialShort)) * 100;
  const nonCommercialBullishPercent = (data.nonCommercialLong / (data.nonCommercialLong + data.nonCommercialShort)) * 100;

  const analysis = getCurrencyAnalysis(data.currency, netNonCommercial, netCommercial, data.weeklyChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold flex items-center gap-2">
            {formatCurrencyPair(data.currency)} - Deep Dive Analysis
          </DialogTitle>
          <DialogDescription className="text-base">
            CFTC Commitment of Traders Report • Oct 14, 2025
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Trade Signal Card */}
          <Card className={`border-2 ${
            analysis.signal === "BUY" ? "border-success bg-success/5" : 
            analysis.signal === "SELL" ? "border-destructive bg-destructive/5" : 
            "border-muted bg-muted/5"
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {analysis.signal === "BUY" ? <TrendingUp className="w-6 h-6 text-success" /> : 
                 analysis.signal === "SELL" ? <TrendingDown className="w-6 h-6 text-destructive" /> :
                 <AlertCircle className="w-6 h-6 text-muted-foreground" />}
                Trading Signal: <span className={`font-extrabold ${
                  analysis.signal === "BUY" ? "text-success" : 
                  analysis.signal === "SELL" ? "text-destructive" : 
                  "text-muted-foreground"
                }`}>{analysis.signal}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-bold">{analysis.recommendation}</p>
              <p className="text-muted-foreground leading-relaxed">{analysis.reasoning}</p>
              
              {data.weeklyChange !== 0 && (
                <div className={`p-4 rounded-lg border-2 relative overflow-hidden ${
                  Math.abs(data.weeklyChange) > 10000 
                    ? "bg-warning/10 border-warning/30" 
                    : "bg-card border-border"
                }`}>
                  {Math.abs(data.weeklyChange) > 10000 && (
                    <Badge className="absolute top-2 right-2 bg-warning/20 text-warning border-warning/30">
                      🔥 SIGNIFICANT CHANGE
                    </Badge>
                  )}
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-foreground">Weekly Position Change:</span>
                    <span className={`font-mono font-bold text-lg ${data.weeklyChange > 0 ? "text-success" : "text-destructive"}`}>
                      {data.weeklyChange > 0 ? "+" : ""}{data.weeklyChange.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs">contracts</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeframe & Levels Card - NEW */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Trade Plan - Timeframe & Key Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Timeframe</p>
                      <p className="text-sm text-primary font-medium">{analysis.timeframe}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <span className="text-xs text-success">▶</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Entry Zone</p>
                      <p className="text-sm text-success font-mono">{analysis.entryZone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <span className="text-xs text-primary">🎯</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Target Zone</p>
                      <p className="text-sm text-primary font-mono">{analysis.targetZone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <span className="text-xs text-destructive">✕</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Stop Zone</p>
                      <p className="text-sm text-destructive font-mono">{analysis.stopZone}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <p className="text-sm font-bold text-foreground mb-1">Key Technical Levels</p>
                <p className="text-sm text-muted-foreground font-mono">{analysis.keyLevels}</p>
              </div>
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
                      ? "✅ Dealers/Asset Managers accumulating - fundamental support"
                      : "⚠️ Dealers/Asset Managers reducing exposure - watch for weakness"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Non-Commercial Traders */}
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  Leveraged Funds (Hedge Funds)
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
                      ? "⚠️ EXTREME positioning - trend continuation likely but watch for reversal"
                      : netNonCommercial > 0 
                        ? "📈 Hedge funds bullish - momentum supports upside"
                        : "📉 Hedge funds bearish - momentum supports downside"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How to Use This Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📚 How to Trade This Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-semibold text-primary">Timeframe Guidance:</p>
                  <p className="text-muted-foreground">
                    COT data is released weekly (Fridays). Best used for SWING trades on Daily/4H charts. 
                    Position changes take 1-4 weeks to fully impact price. Avoid using for scalping/intraday.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-semibold text-warning">Entry Strategy:</p>
                  <p className="text-muted-foreground">
                    Wait for price pullbacks to the Entry Zone. Confirm with technical indicators (20 EMA, support levels). 
                    Don't chase - institutional positioning gives you time to wait for better entries.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-success">Position Sizing:</p>
                  <p className="text-muted-foreground">
                    Risk 1-2% per trade. Use the Stop Zone for stop-loss placement. 
                    Scale into positions on multiple pullbacks rather than all-in entries.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Extreme Readings:</p>
                  <p className="text-muted-foreground">
                    When net positions exceed ±50,000 contracts, be cautious of reversals. 
                    Extreme positioning often marks trend exhaustion points.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default COTDetailModal;