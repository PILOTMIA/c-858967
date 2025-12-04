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
  // Cross pairs
  if (currency.includes('/')) return currency;
  if (currency === 'EURJPY') return 'EUR/JPY';
  if (currency === 'GBPJPY') return 'GBP/JPY';
  if (currency === 'EURGBP') return 'EUR/GBP';
  if (currency === 'GBPCAD') return 'GBP/CAD';
  if (currency === 'AUDJPY') return 'AUD/JPY';
  if (currency === 'EURAUD') return 'EUR/AUD';
  if (currency === 'GBPAUD') return 'GBP/AUD';
  if (currency === 'EURCAD') return 'EUR/CAD';
  if (currency === 'NZDJPY') return 'NZD/JPY';
  if (currency === 'CADJPY') return 'CAD/JPY';
  
  // USD pairs
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF'];
  return usdBasePairs.includes(currency) ? `USD/${currency}` : `${currency}/USD`;
};

// Currency-specific analysis based on CFTC data
const getCurrencyAnalysis = (currency: string, netNonCommercial: number, netCommercial: number, weeklyChange: number) => {
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
      reasoning: `Hedge funds are NET LONG EUR with +${netNonCommercial.toLocaleString()} contracts. Asset Managers hold massive long positions, showing strong institutional bullish conviction.`,
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)',
      entryZone: '1.0850 - 1.0880 (on pullbacks to 20 EMA)',
      targetZone: '1.1050 - 1.1100 (previous swing high)',
      stopZone: 'Below 1.0780 (recent support)',
      keyLevels: 'Support: 1.0850, 1.0780 | Resistance: 1.0950, 1.1050'
    },
    GBP: {
      signal: 'BUY',
      recommendation: 'STRONG BUY GBP/USD - Aggressive accumulation',
      reasoning: `Hedge funds are HEAVILY NET LONG GBP with +${netNonCommercial.toLocaleString()} contracts. This is aggressive institutional accumulation signaling strong upside momentum.`,
      timeframe: 'DAILY/4H charts - Momentum trade (1-2 weeks)',
      entryZone: '1.3000 - 1.3050 (current levels or minor pullbacks)',
      targetZone: '1.3200 - 1.3280 (2023 highs)',
      stopZone: 'Below 1.2920 (swing low)',
      keyLevels: 'Support: 1.3000, 1.2920 | Resistance: 1.3150, 1.3280'
    },
    JPY: {
      signal: 'SELL',
      recommendation: 'BUY USD/JPY - Funds heavily short JPY',
      reasoning: `Hedge funds are EXTREMELY NET SHORT JPY with ${netNonCommercial.toLocaleString()} contracts - the most bearish currency! JPY weakness expected to continue.`,
      timeframe: 'DAILY/4H charts - Trend following (2-4 weeks)',
      entryZone: '151.50 - 152.50 (on dips)',
      targetZone: '155.00 - 156.00 (2024 highs)',
      stopZone: 'Below 149.50 (key support)',
      keyLevels: 'Support: 151.00, 149.50 | Resistance: 154.00, 156.00'
    },
    CHF: {
      signal: 'NEUTRAL',
      recommendation: 'NEUTRAL USD/CHF - Wait for clearer signal',
      reasoning: `Hedge funds are slightly NET SHORT CHF with ${netNonCommercial.toLocaleString()} contracts. Positioning is relatively balanced.`,
      timeframe: 'Watch for catalyst - No immediate trade',
      entryZone: 'N/A - Wait for risk-off event',
      targetZone: 'Range: 0.8600 - 0.8800',
      stopZone: 'N/A',
      keyLevels: 'Support: 0.8600, 0.8500 | Resistance: 0.8750, 0.8850'
    },
    AUD: {
      signal: 'BUY',
      recommendation: 'BUY AUD/USD - Fresh institutional buying',
      reasoning: `Hedge funds are repositioning on AUD. Risk-on sentiment supports AUD strength.`,
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)',
      entryZone: '0.6600 - 0.6650 (on pullbacks)',
      targetZone: '0.6800 - 0.6850 (previous resistance)',
      stopZone: 'Below 0.6550 (recent lows)',
      keyLevels: 'Support: 0.6600, 0.6550 | Resistance: 0.6750, 0.6850'
    },
    CAD: {
      signal: 'BUY',
      recommendation: 'BUY USD/CAD - Extreme bearish CAD positioning',
      reasoning: `Hedge funds are EXTREMELY NET SHORT CAD with ${netNonCommercial.toLocaleString()} contracts - one of the most extreme bearish positions!`,
      timeframe: 'DAILY/4H charts - Trend following (2-4 weeks)',
      entryZone: '1.3800 - 1.3850 (on dips)',
      targetZone: '1.4000 - 1.4100 (2024 highs)',
      stopZone: 'Below 1.3700 (key support)',
      keyLevels: 'Support: 1.3750, 1.3650 | Resistance: 1.3950, 1.4100'
    },
    MXN: {
      signal: 'SELL',
      recommendation: 'SELL USD/MXN - Hedge funds bullish on peso',
      reasoning: `Hedge funds are STRONGLY NET LONG MXN with +${netNonCommercial.toLocaleString()} contracts. High Mexican rates make carry trade attractive.`,
      timeframe: 'DAILY charts - Carry trade (3-6 weeks)',
      entryZone: '17.60 - 17.80 (on bounces)',
      targetZone: '17.00 - 17.20 (recent lows)',
      stopZone: 'Above 18.00 (breakout level)',
      keyLevels: 'Support: 17.20, 17.00 | Resistance: 17.80, 18.00'
    },
    // Cross pairs
    EURJPY: {
      signal: 'BUY',
      recommendation: 'BUY EUR/JPY - Strong bullish bias',
      reasoning: `EUR bullish + JPY bearish = Double bullish confluence. Institutions heavily long EUR and short JPY creates strong upside momentum for this cross.`,
      timeframe: 'DAILY/4H charts - Momentum trade (1-3 weeks)',
      entryZone: '162.50 - 163.00 (on pullbacks)',
      targetZone: '166.00 - 167.00',
      stopZone: 'Below 161.00',
      keyLevels: 'Support: 162.00, 161.00 | Resistance: 165.00, 167.00'
    },
    GBPJPY: {
      signal: 'BUY',
      recommendation: 'BUY GBP/JPY - Very strong bullish setup',
      reasoning: `GBP bullish + JPY bearish = Strong bullish confluence. This is one of the highest momentum cross pairs based on COT positioning.`,
      timeframe: 'DAILY/4H charts - Momentum trade (1-2 weeks)',
      entryZone: '188.00 - 189.00 (on pullbacks)',
      targetZone: '193.00 - 195.00',
      stopZone: 'Below 186.50',
      keyLevels: 'Support: 188.00, 186.50 | Resistance: 191.00, 195.00'
    },
    EURGBP: {
      signal: 'SELL',
      recommendation: 'SELL EUR/GBP - GBP stronger than EUR',
      reasoning: `While both EUR and GBP are bullish vs USD, GBP shows stronger institutional buying. This creates bearish bias for EUR/GBP.`,
      timeframe: 'DAILY charts - Range trade (2-4 weeks)',
      entryZone: '0.8580 - 0.8600 (on bounces)',
      targetZone: '0.8480 - 0.8500',
      stopZone: 'Above 0.8650',
      keyLevels: 'Support: 0.8500, 0.8450 | Resistance: 0.8600, 0.8650'
    },
    GBPCAD: {
      signal: 'BUY',
      recommendation: 'BUY GBP/CAD - Strong bullish setup',
      reasoning: `GBP bullish + CAD bearish = Double bullish confluence. Institutions long GBP and short CAD creates strong momentum.`,
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)',
      entryZone: '1.7450 - 1.7500 (on pullbacks)',
      targetZone: '1.7750 - 1.7850',
      stopZone: 'Below 1.7350',
      keyLevels: 'Support: 1.7400, 1.7300 | Resistance: 1.7650, 1.7850'
    },
    AUDJPY: {
      signal: 'SELL',
      recommendation: 'SELL AUD/JPY - Bearish bias',
      reasoning: `AUD showing weakness while JPY remains bearish. Net effect is slightly bearish for AUD/JPY. Watch for risk-off moves.`,
      timeframe: 'DAILY charts - Cautious trade (1-2 weeks)',
      entryZone: '98.50 - 99.00 (on bounces)',
      targetZone: '96.50 - 97.00',
      stopZone: 'Above 100.00',
      keyLevels: 'Support: 97.00, 96.00 | Resistance: 99.50, 100.50'
    },
    EURAUD: {
      signal: 'BUY',
      recommendation: 'BUY EUR/AUD - EUR stronger than AUD',
      reasoning: `EUR bullish positioning is stronger than AUD. This creates bullish bias for EUR/AUD cross.`,
      timeframe: 'DAILY charts - Swing trade (2-3 weeks)',
      entryZone: '1.6550 - 1.6600 (on pullbacks)',
      targetZone: '1.6850 - 1.6950',
      stopZone: 'Below 1.6450',
      keyLevels: 'Support: 1.6500, 1.6400 | Resistance: 1.6750, 1.6950'
    },
    GBPAUD: {
      signal: 'BUY',
      recommendation: 'BUY GBP/AUD - GBP outperforming AUD',
      reasoning: `GBP shows stronger bullish positioning than AUD. This creates bullish momentum for GBP/AUD.`,
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)',
      entryZone: '1.9200 - 1.9280 (on pullbacks)',
      targetZone: '1.9550 - 1.9650',
      stopZone: 'Below 1.9100',
      keyLevels: 'Support: 1.9150, 1.9050 | Resistance: 1.9450, 1.9650'
    },
    EURCAD: {
      signal: 'BUY',
      recommendation: 'BUY EUR/CAD - Bullish setup',
      reasoning: `EUR bullish + CAD bearish = Bullish confluence for EUR/CAD. Institutions positioned for this move.`,
      timeframe: 'DAILY charts - Swing trade (2-4 weeks)',
      entryZone: '1.5000 - 1.5050 (on pullbacks)',
      targetZone: '1.5250 - 1.5350',
      stopZone: 'Below 1.4900',
      keyLevels: 'Support: 1.4950, 1.4850 | Resistance: 1.5150, 1.5350'
    },
    NZDJPY: {
      signal: 'SELL',
      recommendation: 'SELL NZD/JPY - Bearish bias',
      reasoning: `NZD showing neutral-to-bearish positioning while JPY remains weak. Net effect is slightly bearish.`,
      timeframe: 'DAILY charts - Cautious (1-2 weeks)',
      entryZone: '91.00 - 91.50 (on bounces)',
      targetZone: '89.00 - 89.50',
      stopZone: 'Above 92.50',
      keyLevels: 'Support: 89.50, 88.50 | Resistance: 91.50, 93.00'
    },
    CADJPY: {
      signal: 'SELL',
      recommendation: 'SELL CAD/JPY - Double bearish',
      reasoning: `CAD bearish positioning reinforced. Despite JPY weakness, CAD is weaker. Bearish bias for CAD/JPY.`,
      timeframe: 'DAILY charts - Swing trade (2-3 weeks)',
      entryZone: '109.50 - 110.00 (on bounces)',
      targetZone: '107.00 - 107.50',
      stopZone: 'Above 111.00',
      keyLevels: 'Support: 108.00, 106.50 | Resistance: 110.50, 112.00'
    }
  };

  return analysisData[currency] || {
    signal: 'NEUTRAL' as const,
    recommendation: `Monitor ${formatCurrencyPair(currency)}`,
    reasoning: `Net non-commercial position: ${netNonCommercial.toLocaleString()} contracts. Analysis based on institutional positioning data.`,
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