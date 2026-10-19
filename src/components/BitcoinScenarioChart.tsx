import { bitcoinEditorialSetup as setup } from "@/lib/editorialSetup";

export default function BitcoinScenarioChart() {
  const dollars = (value: number) => `$${value.toLocaleString("en-US")}`;
  return <div className="w-full bg-background p-3 text-left sm:p-5">
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <span className="font-semibold text-foreground">BTCUSD <span className="text-xs font-normal text-muted-foreground">· 2 weeks</span></span>
      <span className="text-xs font-medium text-warning">Editorial scenario · not live</span>
    </div>
    <svg viewBox="0 0 900 560" className="h-auto w-full" role="img" aria-label="Original illustrative Bitcoin ending diagonal with waves 1 to 4 and hypothetical wave 5: advance toward 130,000 dollars, unspecified pullback, then 150,000 to 200,000 dollars. Invalidation 57,750 dollars. Not price history.">
      <defs><marker id="btc-scenario-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9" className="fill-primary" /></marker></defs>
      {[110, 200, 290, 380, 470].map(y => <line key={y} x1="35" x2="865" y1={y} y2={y} className="stroke-border" strokeDasharray="3 7" />)}
      <path d="M55 290 L840 88 M160 480 L840 225" fill="none" className="stroke-primary" strokeWidth="2" />
      <text x="245" y="435" transform="rotate(-20 245 435)" className="fill-primary" fontSize="16">ENDING DIAGONAL · INTERPRETATION</text>
      <path d="M40 445 L100 280 L185 470 L420 195 L525 342" fill="none" className="stroke-muted-foreground" strokeWidth="3" />
      {[[100,280,"1"],[185,470,"2"],[420,195,"3"],[525,342,"4"]].map(([x,y,label]) => <g key={label}>
        <circle cx={Number(x)} cy={Number(y)} r="5" className="fill-background stroke-primary" strokeWidth="2" />
        <text x={Number(x)} y={Number(y)+(label === "2" || label === "4" ? 25 : -15)} textAnchor="middle" className="fill-foreground" fontSize="18" fontWeight="600">{label}</text>
      </g>)}
      <line x1="548" x2="548" y1="60" y2="450" className="stroke-border" strokeDasharray="5 6" />
      <text x="36" y="35" className="fill-muted-foreground" fontSize="15">Schematic wave structure · not observed prices</text>
      <text x="570" y="35" className="fill-warning" fontSize="15">PROPOSED WAVE 5</text>
      <path d="M530 337 L625 170 L700 275 L815 95" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="8 6" markerEnd="url(#btc-scenario-arrow)" />
      <text x="595" y="140" className="fill-foreground" fontSize="18" fontWeight="600">(A) {dollars(setup.firstObjective)}</text>
      <text x="650" y="310" className="fill-foreground" fontSize="16">(B) Pullback</text>
      <text x="650" y="330" className="fill-muted-foreground" fontSize="13">Level unspecified</text>
      <text x="710" y=" sixty" className="fill-primary" fontSize="18" />
      <text x="695" y="60" className="fill-primary" fontSize="18" fontWeight="600">(C) {dollars(setup.finalTargetRange[0])}</text>
      <text x="735" y="82" className="fill-primary" fontSize="18" fontWeight="600">–{dollars(setup.finalTargetRange[1])}</text>
      <line x1="35" x2="865" y1="398" y2="398" className="stroke-destructive" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x="555" y="386" className="fill-destructive" fontSize="17" fontWeight="600">Invalidation {dollars(setup.invalidationLevel)}</text>
      <text x="35" y="520" className="fill-muted-foreground" fontSize="14">Wave 4 completion is the author's count, not a verified market event.</text>
      <text x="35" y="545" className="fill-muted-foreground" fontSize="14">Schematic spacing only · no dates, entry price or guaranteed outcome</text>
    </svg>
  </div>;
}