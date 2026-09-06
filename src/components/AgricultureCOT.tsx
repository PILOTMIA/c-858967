import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wheat, Sparkles } from "lucide-react";

// Managed Money (speculator) positions from CFTC Disaggregated COT — September 1, 2026
// vs. August 25, 2026 (change in Managed Money net = change_long - change_short)
type AgRow = {
  commodity: string;
  exchange: string;
  long: number;
  short: number;
  changeLong: number;
  changeShort: number;
  unit: string;
  note: string;
};

const AG_DATA: AgRow[] = [
  { commodity: "Corn", exchange: "CBOT", long: 467856, short: 66853, changeLong: 56094, changeShort: -27461, unit: "5,000 bu", note: "Relentless bull build — net-long extends to +401.0k, the largest position in the complex" },
  { commodity: "Wheat SRW", exchange: "CBOT", long: 109614, short: 94710, changeLong: 22113, changeShort: -6388, unit: "5,000 bu", note: "Speculators flip net-long +14.9k after a massive +28.5k swing — bearish regime broken" },
  { commodity: "Wheat HRW", exchange: "CBOT", long: 82473, short: 33647, changeLong: 6440, changeShort: 128, unit: "5,000 bu", note: "Steady accumulation lifts net-long to +48.8k" },
  { commodity: "Lean Hogs", exchange: "CME", long: 58819, short: 93510, changeLong: 1308, changeShort: -99, unit: "40,000 lbs", note: "Net-short narrows slightly to -34.7k — bears easing off" },
  { commodity: "Live Cattle", exchange: "CME", long: 82039, short: 33188, changeLong: -2302, changeShort: 8576, unit: "40,000 lbs", note: "Sharp bullish unwind — net-long cut to +48.9k as shorts pile in" },
  { commodity: "Feeder Cattle", exchange: "CME", long: 16043, short: 7607, changeLong: 32, changeShort: 482, unit: "50,000 lbs", note: "Net-long slips to +8.4k on light short-side pressure" },
  { commodity: "Soybeans", exchange: "CBOT", long: 270450, short: 35530, changeLong: 31115, changeShort: -3126, unit: "5,000 bu", note: "Powerful continuation — net-long swells +34.2k to +234.9k" },
  { commodity: "Soybean Oil", exchange: "CBOT", long: 124046, short: 24223, changeLong: 9798, changeShort: -4909, unit: "60,000 lbs", note: "Bulls back in control — net-long rebounds to +99.8k" },
  { commodity: "Soybean Meal", exchange: "CBOT", long: 178183, short: 21004, changeLong: 48568, changeShort: -12658, unit: "100 short tons", note: "Explosive rotation — net-long rockets +61.2k to +157.2k" },
  { commodity: "Sugar No. 11", exchange: "ICE", long: 334372, short: 100601, changeLong: 36401, changeShort: 647, unit: "112,000 lbs", note: "Softs leadership continues — net-long grows to +233.8k" },
  { commodity: "Cotton No. 2", exchange: "ICE", long: 115804, short: 14841, changeLong: 11309, changeShort: -1361, unit: "50,000 lbs", note: "Net-long widens to +101.0k on fresh buying and short covering" },
  { commodity: "Coffee C", exchange: "ICE", long: 40000, short: 13271, changeLong: -2216, changeShort: 2243, unit: "37,500 lbs", note: "Bulls trim — net-long fades to +26.7k" },
  { commodity: "Cocoa", exchange: "ICE", long: 26056, short: 30806, changeLong: 4125, changeShort: -1583, unit: "10 tonnes", note: "Net-short shrinks to -4.8k — bearish structure nearly neutralized" },
];


const AgricultureCOT = () => {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/60 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)]">
      {/* Ambient glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 border border-primary/20">
            <Wheat className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                Agriculture COT — Managed Money
              </h2>
              <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 gap-1">
                <Sparkles className="w-3 h-3" /> New
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Food is everything. Grains and livestock feed the inflation story that drives yields, the dollar, and gold.
              Speculator positioning here often leads CPI prints by weeks.
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground shrink-0">
          <div>Report: <span className="text-foreground font-medium">Sep 1, 2026</span></div>
          <div>Source: CFTC Disaggregated</div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AG_DATA.map((row) => {
          const net = row.long - row.short;
          const netChange = row.changeLong - row.changeShort;
          const bullish = net > 0;
          const flowBullish = netChange > 0;
          const total = row.long + row.short;
          const longPct = total > 0 ? (row.long / total) * 100 : 50;

          return (
            <div
              key={row.commodity}
              className="group rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 hover:border-primary/40 transition-all p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">{row.commodity}</div>
                  <div className="text-[11px] text-muted-foreground">{row.exchange} · {row.unit}</div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${bullish ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-red-500/40 text-red-400 bg-red-500/10"}`}
                >
                  {bullish ? "NET LONG" : "NET SHORT"}
                </Badge>
              </div>

              <div>
                <div className={`text-2xl font-bold tracking-tight ${bullish ? "text-emerald-400" : "text-red-400"}`}>
                  {net > 0 ? "+" : ""}{net.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs mt-0.5">
                  {flowBullish ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className={flowBullish ? "text-emerald-400" : "text-red-400"}>
                    {netChange > 0 ? "+" : ""}{netChange.toLocaleString()} WoW
                  </span>
                </div>
              </div>

              {/* Long vs Short bar */}
              <div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                  <div className="h-full bg-emerald-500/70" style={{ width: `${longPct}%` }} />
                  <div className="h-full bg-red-500/70" style={{ width: `${100 - longPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>L {row.long.toLocaleString()}</span>
                  <span>S {row.short.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                {row.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="text-xs font-semibold text-foreground mb-1">Why agriculture matters to FX & Gold</div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Rising grain and livestock prices feed directly into food CPI — the most visible component of headline inflation.
          When speculators pile into long grains + long cattle, expect stickier CPI, hawkish Fed repricing, and headwinds for gold.
          Falling ag positioning has the opposite effect: disinflation tailwind, dovish tilt, gold support.
        </p>
      </div>
    </Card>
  );
};

export default AgricultureCOT;
