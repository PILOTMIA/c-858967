import { bitcoinPullbackSetup as setup } from "@/lib/editorialSetup";

export default function BitcoinPullbackChart() {
  const dollars = (n: number) => `$${n.toLocaleString("en-US")}`;
  return <div className="w-full bg-background p-3 text-left sm:p-5">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-foreground">BTCUSD <span className="text-xs font-normal text-muted-foreground">· 2 days</span></span><span className="text-xs font-medium text-warning">Pullback first · unconfirmed</span></div>
    <svg viewBox="0 0 900 520" className="h-auto w-full" role="img" aria-label="Original Bitcoin pullback scenario: illustrative five-wave rally, wave B retracement into 68,000 to 71,000 dollars, bullish rejection then descending trendline break, proposed wave C to 130,000 dollars. Invalidation 57,750 dollars. Not historical prices.">
      <defs><marker id="btc-pullback-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9" className="fill-primary" /></marker></defs>
      {[110,200,290,380].map(y => <line key={y} x1="30" x2="870" y1={y} y2={y} className="stroke-border" strokeDasharray="3 7" />)}
      <text x="30" y="30" className="fill-muted-foreground" fontSize="15">Illustrative wave count · not observed prices</text>
      <path d="M40 365 L100 280 L145 315 L235 205 L280 245 L380 145" className="stroke-muted-foreground" strokeWidth="3" fill="none" />
      {[[100,280,"1"],[145,315,"2"],[235,205,"3"],[280,245,"4"],[380,145,"5 / A"]].map(([x,y,label]) => <text key={label} x={Number(x)} y={Number(y)+(label === "2" || label === "4" ? 25 : -15)} textAnchor="middle" className="fill-foreground" fontSize="17">{label}</text>)}
      <path d="M382 145 L435 240 L470 210 L530 325" className="stroke-warning" strokeWidth="2.5" strokeDasharray="7 6" fill="none" />
      <rect x="420" y="310" width="445" height="45" rx="4" className="fill-warning/10 stroke-warning" strokeDasharray="4 5" />
      <text x="655" y="300" className="fill-warning" fontSize="17" fontWeight="600">{dollars(setup.retracementZone[0])}–{dollars(setup.retracementZone[1])}</text>
      <text x="655" y="337" className="fill-warning" fontSize="15">50%–61.8% Fibonacci</text>
      <line x1="380" y1="145" x2="660" y2="345" className="stroke-destructive" strokeWidth="1.5" strokeDasharray="6 5" />
      <path d="M530 325 L560 306 L576 320 L610 260 L795 90" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="7 6" markerEnd="url(#btc-pullback-arrow)" />
      <circle cx="530" cy="325" r="7" className="fill-background stroke-warning" strokeWidth="2" />
      <circle cx="610" cy="260" r="7" className="fill-background stroke-primary" strokeWidth="2" />
      <text x="470" y="385" className="fill-foreground" fontSize="16">B · bullish rejection required</text>
      <text x="605" y="230" className="fill-primary" fontSize="15">Then: trendline break</text>
      <text x="650" y="65" className="fill-primary" fontSize="19" fontWeight="600">C · {dollars(setup.objective)}</text>
      <line x1="30" x2="870" y1="420" y2="420" className="stroke-destructive" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="545" y="446" className="fill-destructive" fontSize="17">Count invalidation · {dollars(setup.invalidationLevel)}</text>
      <text x="30" y="480" className="fill-muted-foreground" fontSize="14">Zone arrival alone is not an entry · both confirmations remain unverified</text>
      <text x="30" y="505" className="fill-muted-foreground" fontSize="14">Schematic spacing · no current quote, dates or guaranteed outcome</text>
    </svg>
  </div>;
}