import { usdchfEditorialSetup as setup } from "@/lib/editorialSetup";

/** A scenario diagram, deliberately not a fabricated price-history series. */
export default function USDCHFScenarioChart() {
  const y = (price: number) => 70 + (setup.rejectionLevel - price) * 2700;
  return <div className="w-full bg-background p-4 text-left sm:p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span className="font-semibold text-foreground">USDCHF <span className="text-xs font-normal text-muted-foreground">· Daily thesis</span></span>
      <span className="text-xs font-medium text-warning">Conditional · not live</span>
    </div>
    <svg viewBox="0 0 520 410" className="h-auto w-full" role="img" aria-label="Original USDCHF scenario diagram: rejection at 0.8400, daily-close confirmation required, then hypothetical downside targets at 0.7900, 0.7600 and 0.7400. Not observed price history.">
      <defs>
        <marker id="scenario-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" className="fill-destructive" /></marker>
      </defs>
      {[setup.rejectionLevel, ...setup.targets].map((level, i) => <g key={level}>
        <line x1="12" x2="505" y1={y(level)} y2={y(level)} className={i === 0 ? "stroke-warning" : "stroke-border"} strokeDasharray="4 5" />
        <text x="505" y={y(level) - 10} textAnchor="end" className="fill-foreground font-mono" fontSize="14">{level.toFixed(4)}</text>
        {i > 0 && <text x="12" y={y(level) - 10} className="fill-muted-foreground" fontSize="13">Target {i}</text>}
      </g>)}
      <text x="12" y="28" className="fill-warning" fontSize="14">Rejection area · 50% Fibonacci thesis</text>
      <path d="M30 163 L168 72" fill="none" className="stroke-primary" strokeWidth="3" />
      <circle cx="168" cy="72" r="5" className="fill-warning" />
      <path d="M168 78 L220 130" fill="none" className="stroke-destructive" strokeWidth="3" />
      <path d="M24 190 L270 106" fill="none" className="stroke-primary" strokeWidth="1.5" strokeDasharray="6 5" />
      <circle cx="220" cy="130" r="8" className="fill-background stroke-warning" strokeWidth="2" />
      <text x="280" y="126" className="fill-warning" fontSize="13">Daily close below trendline</text>
      <text x="280" y="146" className="fill-muted-foreground" fontSize="12">Not confirmed</text>
      <path d="M225 148 L300 205 L345 286 L390 334" fill="none" className="stroke-destructive" strokeWidth="2.5" strokeDasharray="7 6" markerEnd="url(#scenario-arrow)" />
      <text x="12" y="375" className="fill-muted-foreground" fontSize="12">Dashed decline = hypothetical path, not a forecast</text>
      <text x="12" y="397" className="fill-muted-foreground" fontSize="12">No price history, current quote or exact stop shown</text>
    </svg>
  </div>;
}