import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Info, Clock, Target, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { fetchForexPrice, formatPrice } from "@/services/ForexPriceService";

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

// Helper to calculate pip-based price levels
const calculateZones = (price: number, currency: string, signal: 'BUY' | 'SELL' | 'NEUTRAL') => {
  const isJPYPair = currency.includes('JPY') || currency === 'JPY';
  const isMXN = currency === 'MXN';
  const decimals = isJPYPair ? 2 : (isMXN ? 2 : 4);
  
  // Calculate pip values
  const pipValue = isJPYPair ? 0.01 : (isMXN ? 0.01 : 0.0001);
  
  // Define pip distances based on pair type
  const entryPips = isJPYPair ? 30 : (isMXN ? 20 : 30);
  const targetPips = isJPYPair ? 150 : (isMXN ? 100 : 150);
  const stopPips = isJPYPair ? 80 : (isMXN ? 50 : 80);
  
  const fmt = (val: number) => val.toFixed(decimals);
  
  if (signal === 'BUY') {
    const entryLow = price - (entryPips * pipValue);
    const entryHigh = price;
    const targetLow = price + (targetPips * 0.8 * pipValue);
    const targetHigh = price + (targetPips * pipValue);
    const stopPrice = price - (stopPips * pipValue);
    const support1 = price - (entryPips * pipValue);
    const support2 = price - (stopPips * pipValue);
    const resistance1 = price + (targetPips * 0.5 * pipValue);
    const resistance2 = price + (targetPips * pipValue);
    
    return {
      entryZone: `${fmt(entryLow)} - ${fmt(entryHigh)} (on pullbacks)`,
      targetZone: `${fmt(targetLow)} - ${fmt(targetHigh)}`,
      stopZone: `Below ${fmt(stopPrice)}`,
      keyLevels: `Support: ${fmt(support1)}, ${fmt(support2)} | Resistance: ${fmt(resistance1)}, ${fmt(resistance2)}`
    };
  } else if (signal === 'SELL') {
    const entryLow = price;
    const entryHigh = price + (entryPips * pipValue);
    const targetLow = price - (targetPips * pipValue);
    const targetHigh = price - (targetPips * 0.8 * pipValue);
    const stopPrice = price + (stopPips * pipValue);
    const support1 = price - (targetPips * 0.5 * pipValue);
    const support2 = price - (targetPips * pipValue);
    const resistance1 = price + (entryPips * pipValue);
    const resistance2 = price + (stopPips * pipValue);
    
    return {
      entryZone: `${fmt(entryLow)} - ${fmt(entryHigh)} (on bounces)`,
      targetZone: `${fmt(targetLow)} - ${fmt(targetHigh)}`,
      stopZone: `Above ${fmt(stopPrice)}`,
      keyLevels: `Support: ${fmt(support1)}, ${fmt(support2)} | Resistance: ${fmt(resistance1)}, ${fmt(resistance2)}`
    };
  }
  
  return {
    entryZone: 'N/A - Wait for signal',
    targetZone: `Range bound around ${fmt(price)}`,
    stopZone: 'N/A',
    keyLevels: `Current price: ${fmt(price)}`
  };
};

// Currency-specific analysis based on CFTC data with dynamic prices
const getCurrencyAnalysis = (currency: string, netNonCommercial: number, netCommercial: number, weeklyChange: number, currentPrice: number) => {
  // Determine signal based on net positioning
  const getSignalFromPositioning = (): 'BUY' | 'SELL' | 'NEUTRAL' => {
    // Check for specific currency biases
    const bullishCurrencies = ['EUR', 'GBP', 'AUD', 'MXN'];
    const bearishCurrencies = ['JPY', 'CAD', 'CHF'];
    
    // Cross pairs logic
    if (currency === 'EURJPY' || currency === 'GBPJPY') return 'BUY'; // Bullish + Bearish = BUY cross
    if (currency === 'EURGBP') return netNonCommercial > 5000 ? 'SELL' : 'NEUTRAL'; // GBP stronger
    if (currency === 'GBPCAD' || currency === 'EURCAD') return 'BUY'; // Bullish + Bearish CAD
    if (currency === 'AUDJPY' || currency === 'NZDJPY' || currency === 'CADJPY') return 'SELL';
    if (currency === 'EURAUD' || currency === 'GBPAUD') return 'BUY';
    
    // USD pairs
    if (bullishCurrencies.includes(currency)) return netNonCommercial > 5000 ? 'BUY' : 'NEUTRAL';
    if (bearishCurrencies.includes(currency)) return netNonCommercial < -5000 ? 'SELL' : 'NEUTRAL';
    
    return Math.abs(netNonCommercial) < 5000 ? 'NEUTRAL' : (netNonCommercial > 0 ? 'BUY' : 'SELL');
  };
  
  const signal = getSignalFromPositioning();
  const zones = calculateZones(currentPrice, currency, signal);
  
  // Dynamic recommendations based on currency
  const recommendations: Record<string, { rec: string; reasoning: string; timeframe: string }> = {
    EUR: {
      rec: signal === 'BUY' ? 'BUY EUR/USD on pullbacks' : 'Monitor EUR/USD',
      reasoning: `Hedge funds are ${netNonCommercial > 0 ? 'NET LONG' : 'NET SHORT'} EUR with ${netNonCommercial > 0 ? '+' : ''}${netNonCommercial.toLocaleString()} contracts. Institutional positioning suggests ${signal === 'BUY' ? 'bullish' : 'cautious'} outlook.`,
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)'
    },
    GBP: {
      rec: signal === 'BUY' ? 'STRONG BUY GBP/USD - Institutional accumulation' : 'Monitor GBP/USD',
      reasoning: `Hedge funds are ${netNonCommercial > 0 ? 'HEAVILY NET LONG' : 'NET SHORT'} GBP with ${netNonCommercial > 0 ? '+' : ''}${netNonCommercial.toLocaleString()} contracts. Strong institutional conviction.`,
      timeframe: 'DAILY/4H charts - Momentum trade (1-2 weeks)'
    },
    JPY: {
      rec: 'BUY USD/JPY - Funds heavily short JPY',
      reasoning: `Hedge funds are EXTREMELY NET SHORT JPY with ${netNonCommercial.toLocaleString()} contracts - the most bearish currency! JPY weakness expected to continue.`,
      timeframe: 'DAILY/4H charts - Trend following (2-4 weeks)'
    },
    CHF: {
      rec: 'NEUTRAL USD/CHF - Wait for clearer signal',
      reasoning: `Positioning is relatively balanced with ${netNonCommercial.toLocaleString()} contracts. Watch for risk-off catalysts.`,
      timeframe: 'Watch for catalyst - No immediate trade'
    },
    AUD: {
      rec: signal === 'BUY' ? 'BUY AUD/USD - Fresh institutional buying' : 'Monitor AUD/USD',
      reasoning: `Hedge funds repositioning on AUD. Risk-on sentiment ${signal === 'BUY' ? 'supports' : 'may support'} AUD strength.`,
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)'
    },
    CAD: {
      rec: 'BUY USD/CAD - Extreme bearish CAD positioning',
      reasoning: `Hedge funds are EXTREMELY NET SHORT CAD with ${netNonCommercial.toLocaleString()} contracts - one of the most extreme bearish positions!`,
      timeframe: 'DAILY/4H charts - Trend following (2-4 weeks)'
    },
    MXN: {
      rec: 'SELL USD/MXN - Hedge funds bullish on peso',
      reasoning: `Hedge funds are STRONGLY NET LONG MXN with +${netNonCommercial.toLocaleString()} contracts. High Mexican rates make carry trade attractive.`,
      timeframe: 'DAILY charts - Carry trade (3-6 weeks)'
    },
    EURJPY: {
      rec: 'BUY EUR/JPY - Strong bullish bias',
      reasoning: 'EUR bullish + JPY bearish = Double bullish confluence. Institutions heavily long EUR and short JPY creates strong upside momentum.',
      timeframe: 'DAILY/4H charts - Momentum trade (1-3 weeks)'
    },
    GBPJPY: {
      rec: 'BUY GBP/JPY - Very strong bullish setup',
      reasoning: 'GBP bullish + JPY bearish = Strong bullish confluence. One of the highest momentum cross pairs based on COT positioning.',
      timeframe: 'DAILY/4H charts - Momentum trade (1-2 weeks)'
    },
    EURGBP: {
      rec: 'SELL EUR/GBP - GBP stronger than EUR',
      reasoning: 'While both EUR and GBP are bullish vs USD, GBP shows stronger institutional buying. Bearish bias for EUR/GBP.',
      timeframe: 'DAILY charts - Range trade (2-4 weeks)'
    },
    GBPCAD: {
      rec: 'BUY GBP/CAD - Strong bullish setup',
      reasoning: 'GBP bullish + CAD bearish = Double bullish confluence. Institutions long GBP and short CAD creates strong momentum.',
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)'
    },
    AUDJPY: {
      rec: 'SELL AUD/JPY - Bearish bias',
      reasoning: 'AUD showing weakness while JPY remains bearish. Net effect is slightly bearish for AUD/JPY. Watch for risk-off moves.',
      timeframe: 'DAILY charts - Cautious trade (1-2 weeks)'
    },
    EURAUD: {
      rec: 'BUY EUR/AUD - EUR stronger than AUD',
      reasoning: 'EUR bullish positioning is stronger than AUD. Bullish bias for EUR/AUD cross.',
      timeframe: 'DAILY charts - Swing trade (2-3 weeks)'
    },
    GBPAUD: {
      rec: 'BUY GBP/AUD - GBP outperforming AUD',
      reasoning: 'GBP shows stronger bullish positioning than AUD. Bullish momentum for GBP/AUD.',
      timeframe: 'DAILY/4H charts - Swing trade (1-3 weeks)'
    },
    EURCAD: {
      rec: 'BUY EUR/CAD - Bullish setup',
      reasoning: 'EUR bullish + CAD bearish = Bullish confluence for EUR/CAD. Institutions positioned for this move.',
      timeframe: 'DAILY charts - Swing trade (2-4 weeks)'
    },
    NZDJPY: {
      rec: 'SELL NZD/JPY - Bearish bias',
      reasoning: 'NZD showing neutral-to-bearish positioning while JPY remains weak. Net effect is slightly bearish.',
      timeframe: 'DAILY charts - Cautious (1-2 weeks)'
    },
    CADJPY: {
      rec: 'SELL CAD/JPY - Double bearish',
      reasoning: 'CAD bearish positioning reinforced. Despite JPY weakness, CAD is weaker. Bearish bias for CAD/JPY.',
      timeframe: 'DAILY charts - Swing trade (2-3 weeks)'
    }
  };
  
  const currencyRec = recommendations[currency] || {
    rec: `Monitor ${formatCurrencyPair(currency)}`,
    reasoning: `Net non-commercial position: ${netNonCommercial.toLocaleString()} contracts. Analysis based on institutional positioning data.`,
    timeframe: 'Wait for clearer signal'
  };
  
  return {
    signal,
    recommendation: currencyRec.rec,
    reasoning: currencyRec.reasoning,
    timeframe: currencyRec.timeframe,
    ...zones
  };
};

const COTDetailModal = ({ open, onOpenChange, data }: COTDetailModalProps) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceSource, setPriceSource] = useState<string>('');
  
  const refreshPrice = async () => {
    if (!data) return;
    setIsLoadingPrice(true);
    try {
      const price = await fetchForexPrice(data.currency);
      setCurrentPrice(price);
      setPriceSource('Live');
    } catch (error) {
      console.error('Failed to refresh price:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  };
  
  useEffect(() => {
    if (open && data) {
      refreshPrice();
    }
  }, [open, data?.currency]);
  
  if (!data) return null;

  const netCommercial = data.commercialLong - data.commercialShort;
  const netNonCommercial = data.nonCommercialLong - data.nonCommercialShort;
  
  const commercialBullishPercent = (data.commercialLong / (data.commercialLong + data.commercialShort)) * 100;
  const nonCommercialBullishPercent = (data.nonCommercialLong / (data.nonCommercialLong + data.nonCommercialShort)) * 100;

  const analysis = getCurrencyAnalysis(data.currency, netNonCommercial, netCommercial, data.weeklyChange, currentPrice || 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold flex items-center gap-2">
            {formatCurrencyPair(data.currency)} - Deep Dive Analysis
          </DialogTitle>
          <DialogDescription className="text-base flex flex-col gap-2">
            <span>CFTC Commitment of Traders Report</span>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <Badge variant="outline" className="text-sm font-mono">
                {isLoadingPrice ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Loading price...
                  </span>
                ) : (
                  <span>Current Price: <span className="text-primary font-bold">{formatPrice(currentPrice, data.currency)}</span></span>
                )}
              </Badge>
              {!isLoadingPrice && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {priceSource} Market Data
                  </Badge>
                  <button
                    onClick={refreshPrice}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </>
              )}
            </div>
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