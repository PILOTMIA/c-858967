import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Calculator, Download, RotateCcw, TrendingUp, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { calculateCompounding, compoundCsv, compoundExample, lossStressPercent, type CompoundPlan } from "@/lib/compounding";
import PlannerLotSizing from "@/components/PlannerLotSizing";

const defaults = { startingBalance: "1000", riskPercent: "1", returnPercent: "2", sessions: "30", tradesPerSession: "3" };
const fields = [
  { key: "startingBalance", label: "Starting balance (USD)", min: 0.01, max: 1e12, step: "any" },
  { key: "riskPercent", label: "Risk per trade (%)", min: 0, max: 100, step: "any" },
  { key: "returnPercent", label: "Return per session (%)", min: -100, max: 1000, step: "any" },
  { key: "sessions", label: "Number of sessions", min: 1, max: 1000, step: "1" },
  { key: "tradesPerSession", label: "Trades per session", min: 1, max: 100, step: "1" },
] as const;
const chartConfig = {
  balance: { label: "Compounded balance", color: "hsl(var(--chart-1))" },
  simpleBalance: { label: "Without compounding", color: "hsl(var(--chart-3))" },
};
const money = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: Math.abs(value) >= 1e9 ? "scientific" : "standard", maximumFractionDigits: 2,
}).format(value);
const axisMoney = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: Math.abs(value) >= 1e15 ? "scientific" : "compact", maximumFractionDigits: 1,
}).format(value);

export default function CompoundingPlanner() {
  const [inputs, setInputs] = useState(defaults);
  const [logScale, setLogScale] = useState(false);
  const result = useMemo(() => {
    const plan = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, value.trim() === "" ? NaN : Number(value)])) as unknown as CompoundPlan;
    try {
      const rows = calculateCompounding(plan);
      return { plan, rows, error: "" };
    } catch (error) {
      return { plan, rows: [], error: error instanceof Error ? error.message : "Please check your inputs." };
    }
  }, [inputs]);
  const { plan, rows, error } = result;
  const final = rows.at(-1);
  const stress = final ? lossStressPercent(plan.riskPercent, plan.tradesPerSession) : 0;
  const canLog = rows.length > 0 && rows.every(row => row.balance > 0 && row.simpleBalance > 0);
  const download = () => {
    if (!final) return;
    const url = URL.createObjectURL(new Blob([compoundCsv(rows, plan)], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mia-fx-compounding-plan.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="compounding-planner" aria-labelledby="compounding-title" className="border-y border-border py-8 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-success text-sm mb-2"><Calculator className="h-4 w-4" /> Plan your sessions</div>
          <h2 id="compounding-title" className="text-2xl sm:text-3xl font-bold">Compounding planner</h2>
          <p className="text-muted-foreground text-sm mt-2">Hypothetical growth · Full profits reinvested · USD</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setInputs(current => ({ ...current, ...Object.fromEntries(Object.entries(compoundExample).map(([key, value]) => [key, String(value)])) }))}>
            <TrendingUp className="mr-2 h-4 w-4" /> 24% × 60 example
          </Button>
          <Button variant="ghost" size="icon" title="Reset plan" aria-label="Reset plan" onClick={() => { setInputs(defaults); setLogScale(false); }}><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`compound-${field.key}`} className="text-sm text-foreground">{field.label}</Label>
              <Input id={`compound-${field.key}`} type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step} value={inputs[field.key]} aria-invalid={Boolean(error)} aria-describedby={error ? "compound-error" : undefined} onChange={event => setInputs(current => ({ ...current, [field.key]: event.target.value }))} className="bg-background text-foreground tabular-nums" />
            </div>
          ))}
          <p className="text-sm text-muted-foreground">Return is assumed once per session, not once per trade. Risk sets the amount at stake; it does not determine profit.</p>
          <p className="text-sm text-muted-foreground">Men In Action LLC example: 24% per session, 60 sessions, 3 trades per session, 5–8% risk per trade. The example starts at 5% risk and keeps your starting balance.</p>
        </div>

        <div className="min-w-0 space-y-6">
          {error && <div id="compound-error" role="alert" className="border-l-2 border-destructive bg-destructive/10 p-4 text-foreground">{error}</div>}
          {final && <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-border pb-5" aria-live="polite">
              <div><p className="text-sm text-muted-foreground">Projected balance</p><p data-testid="compound-final" className="text-2xl font-bold tabular-nums break-all mt-1 text-success">{money(final.balance)}</p></div>
              <div><p className="text-sm text-muted-foreground">Total gain / loss</p><p className="text-xl font-bold tabular-nums break-all mt-1">{money(final.balance - plan.startingBalance)}</p></div>
              <div><p className="text-sm text-muted-foreground">Balance multiplier</p><p className="text-xl font-bold tabular-nums break-all mt-1">{new Intl.NumberFormat("en-US", { notation: final.balance / plan.startingBalance >= 1e9 ? "scientific" : "standard", maximumFractionDigits: 2 }).format(final.balance / plan.startingBalance)}×</p></div>
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 text-sm text-foreground">
                <span className="flex gap-2 items-center"><span className="w-5 border-t-2 border-success" />Compounded balance</span>
                <span className="flex gap-2 items-center"><span className="w-5 border-t-2 border-dashed border-warning" />Without compounding</span>
              </div>
              <div className="flex items-center gap-2"><Switch id="compound-log" checked={logScale && canLog} disabled={!canLog} onCheckedChange={setLogScale} /><Label htmlFor="compound-log" className="text-sm">Log scale</Label></div>
            </div>
            <ChartContainer config={chartConfig} className="h-[320px] sm:h-[360px] w-full aspect-auto" aria-label="Projected account balance by session">
              <LineChart data={rows} margin={{ top: 12, right: 12, bottom: 20, left: 12 }} accessibilityLayer>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="session" type="number" domain={[0, plan.sessions]} minTickGap={30} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} label={{ value: "Session", position: "insideBottom", offset: -12, fill: "hsl(var(--foreground))" }} />
                <YAxis width={85} tickFormatter={axisMoney} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} scale={logScale && canLog ? "log" : "auto"} domain={logScale && canLog ? ["auto", "auto"] : [0, "auto"]} />
                <ChartTooltip content={<ChartTooltipContent className="bg-popover text-popover-foreground text-sm" labelFormatter={(_, payload) => `Session ${payload[0]?.payload.session ?? 0}`} formatter={(value, name) => <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 w-full"><span>{name === "balance" ? "Compounded balance" : "Without compounding"}</span><span className="font-semibold tabular-nums">{money(Number(value))}</span></div>} />} />
                <Line dataKey="simpleBalance" type="linear" stroke="var(--color-simpleBalance)" strokeDasharray="6 4" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="balance" type="linear" stroke="var(--color-balance)" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ChartContainer>
            <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-5">
              <div><p className="text-sm text-muted-foreground">Risk per trade · First → Last session open</p><p className="text-base font-semibold tabular-nums break-all mt-1">{money(rows[0].riskAmount)} → {money(final.riskAmount)}</p></div>
              <div><p className="text-sm text-muted-foreground">Loss stress · {plan.tradesPerSession} consecutive stop-outs</p><p className="text-base font-semibold mt-1">−{stress.toFixed(2)}% of session-start equity</p></div>
            </div>
            <p className="text-sm text-muted-foreground">Loss stress assumes each trade loses the selected risk, resized after every loss. It is separate from the fixed-return projection; gaps and slippage can make losses larger.</p>
          </>}
        </div>
      </div>

      <div className="flex items-start gap-3 border-l-2 border-warning bg-warning/10 px-4 py-3 mt-6">
        <ShieldAlert className="h-5 w-5 shrink-0 text-warning mt-0.5" />
        <p className="text-sm text-foreground">This is a mathematical illustration, not a forecast, trade signal, or recommended risk level. A consistent 24% return per session is an aggressive assumption, not an expected result. Risking 5–8% per trade can cause substantial drawdowns. Actual results vary; losing sessions, fees, spreads, slippage, taxes and withdrawals are not included in this projection.</p>
      </div>
      {final && <PlannerLotSizing rows={rows} />}
      {final && <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold">Session-by-session plan</h3>
          <Button variant="outline" size="sm" onClick={download}><Download className="h-4 w-4 mr-2" /> Download CSV</Button>
        </div>
        <details>
          <summary className="cursor-pointer text-sm text-foreground py-2">View all {plan.sessions} sessions</summary>
          <div className="overflow-auto max-h-[420px] mt-3 rounded-md border border-border">
            <table className="w-full text-sm text-left whitespace-nowrap tabular-nums">
              <caption className="sr-only">Hypothetical session balances and risk per trade at each session's opening balance</caption>
              <thead className="sticky top-0 bg-secondary text-secondary-foreground"><tr>{["Session", "Opening balance", "Gain / loss", "Closing balance", "Risk per trade at open"].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
              <tbody>{rows.slice(1).map(row => <tr key={row.session} className="border-t border-border"><td className="px-4 py-3">{row.session}</td><td className="px-4 py-3">{money(row.openingBalance)}</td><td className="px-4 py-3">{money(row.gain)}</td><td className="px-4 py-3">{money(row.balance)}</td><td className="px-4 py-3">{money(row.riskAmount)}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
      </div>}
    </section>
  );
}