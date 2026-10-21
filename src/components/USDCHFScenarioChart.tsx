import { usdchfEditorialSetup as setup } from "@/lib/editorialSetup";

/** Schematic channel diagram of the author's thesis, deliberately not a fabricated price-history series. */
export default function USDCHFScenarioChart() {
  const W = 520, top = 40, bottom = 380;
  const hi = 0.9, lo = 0.74;
  const y = (p: number) => top + ((hi - p) / (hi - lo)) * (bottom - top);
  const levels = [0.90, 0.88, 0.86, 0.84, 0.82, 0.80, 0.78, 0.76, 0.74];
  // Channel: lower 0.757 -> 0.805, upper 0.802 -> 0.850 across the plot.
  const x0 = 12, x1 = 455;
  const ch = (a: number, b: number) => `M${x0} ${y(a)} L${x1} ${y(b)}`;
  const swing = "M20 " + y(0.792) + " L60 " + y(0.803) + " L95 " + y(0.762) + " L130 " + y(0.766) + " L160 " + y(0.800) + " L175 " + y(0.785) + " L205 " + y(0.776) + " L240 " + y(0.780) + " L285 " + y(0.812) + " L305 " + y(0.818) + " L325 " + y(0.806) + " L345 " + y(0.795) + " L385 " + y(0.825) + " L405 " + y(0.836) + " L418 " + y(0.832) + " L425 " + y(0.825);
  return <div className="w-full bg-background p-4 text-left sm:p-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <span className="font-semibold text-foreground">USDCHF <span className="text-xs font-normal text-muted-foreground">· 1D · rising channel</span></span>
      <span className="text-xs font-medium text-warning">Conditional · not live</span>
    </div>
    <svg viewBox={`0 0 ${W} 410`} className="h-auto w-full" role="img" aria-label={`Original USDCHF daily diagram: rising channel, latest trendline broken near ${setup.trendlineBreakLevel.toFixed(4)}, projected move to channel support near ${setup.channelSupport.toFixed(4)}. Schematic, not observed price history.`}>
      {levels.map((l) => <g key={l}>
        <line x1="12" x2={x1} y1={y(l)} y2={y(l)} className="stroke-border" strokeOpacity="0.4" />
        <text x={W - 4} y={y(l) + 4} textAnchor="end" className="fill-muted-foreground font-mono" fontSize="11">{l.toFixed(4)}</text>
      </g>)}
      <path d={ch(0.802, 0.850)} className="stroke-primary" strokeWidth="2" fill="none" />
      <path d={ch(0.757, 0.805)} className="stroke-primary" strokeWidth="2" fill="none" />
      <path d={swing} className="stroke-foreground" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      {/* Rising legs */}
      {[[95, 0.766, 160, 0.800], [240, 0.780, 305, 0.818], [345, 0.795, 422, 0.832]].map(([a, b, c, d], i) =>
        <line key={i} x1={a} y1={y(b)} x2={c} y2={y(d)} className="stroke-destructive" strokeWidth="2.5" />)}
      {/* Prior pullbacks */}
      <path d={`M160 ${y(0.800)} L205 ${y(0.776)}`} className="stroke-primary" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      <path d={`M305 ${y(0.818)} L345 ${y(0.795)}`} className="stroke-primary" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      {/* Projection */}
      <path d={`M425 ${y(0.830)} L448 ${y(setup.channelSupport)}`} className="stroke-foreground" strokeWidth="2" strokeDasharray="6 5" fill="none" />
      <circle cx="420" cy={y(setup.trendlineBreakLevel)} r="6" className="fill-background stroke-warning" strokeWidth="2" />
      <circle cx="448" cy={y(setup.channelSupport)} r="5" className="fill-warning" />
      <text x="12" y="24" className="fill-warning" fontSize="13">Rejected near {setup.rejectionLevel.toFixed(4)} · trendline break ≈ {setup.trendlineBreakLevel.toFixed(4)}</text>
      <text x="300" y={y(setup.channelSupport) + 26} className="fill-warning" fontSize="12">Channel support ≈ {setup.channelSupport.toFixed(4)}</text>
      <text x="12" y="398" className="fill-muted-foreground" fontSize="11">Schematic swings, not real candles · dashed path is hypothetical</text>
    </svg>
  </div>;
}
