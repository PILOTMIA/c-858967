import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { referenceIsFresh, sizePosition, sizingInstruments, type SizingSettings } from "@/lib/positionSizing";
import type { CompoundSession } from "@/lib/compounding";

async function fetchConversion(quote: string) {
  const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${quote}&symbols=USD`, { cache: "no-store" });
  if (!response.ok) throw new Error("Conversion source unavailable.");
  const data = await response.json();
  if (!referenceIsFresh(data.date) || !Number.isFinite(data.rates?.USD) || data.rates.USD <= 0) throw new Error("Conversion reference is missing or older than four days.");
  return { rate: Number(data.rates.USD), date: String(data.date) };
}
const dollars = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
const lotsLabel = (n: number) => n === 0 ? "No trade — below minimum" : n.toLocaleString("en-US", { maximumFractionDigits: 8 });

export default function PlannerLotSizing({ rows }: { rows: CompoundSession[] }) {
  const [symbol, setSymbol] = useState("EURUSD");
  const [values, setValues] = useState({ stopPips: "20", bufferPips: "0", feePerLot: "0", contract: "100000", pip: "0.0001", lotStep: "0.01", minLot: "0.01", maxLot: "100" });
  const instrument = sizingInstruments.find(item => item.symbol === symbol);
  const quote = instrument?.quote ?? "USD";
  const conversion = useQuery({ queryKey: ["planner-conversion", quote], queryFn: () => fetchConversion(quote), enabled: quote !== "USD", refetchInterval: 60000, staleTime: 30000 });
  const quoteToUsd = quote === "USD" ? 1 : !conversion.error && conversion.data && referenceIsFresh(conversion.data.date) ? conversion.data.rate : NaN;
  const settings = { ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim() === "" ? NaN : Number(v)])), quoteToUsd } as unknown as SizingSettings;
  let error = "";
  let sized: ReturnType<typeof sizePosition>[] = [];
  if (quote !== "USD" && !Number.isFinite(quoteToUsd)) error = conversion.isLoading ? "Loading official conversion reference…" : "Sizing paused: current conversion reference is unavailable. Refresh or choose a USD-quoted instrument.";
  else {
    try { sized = rows.slice(1).map(row => sizePosition(row.riskAmount, settings)); }
    catch (e) { error = e instanceof Error ? e.message : "Check your sizing inputs."; }
  }
  const first = sized[0];
  const last = sized.at(-1);
  const controls = [
    ["stopPips", "Stop-loss distance (pips)"], ["bufferPips", "Spread / slippage buffer (pips)"], ["feePerLot", "Round-trip commission per lot (USD)"],
    ["contract", "Units per lot (broker contract)"], ["pip", "Price change per pip"], ["lotStep", "Broker lot step"], ["minLot", "Broker minimum lot"], ["maxLot", "Broker maximum lot"],
  ] as const;
  const download = () => {
    if (!first) return;
    const csv = [
      "Hypothetical session lot sizing — USD account; not an order recommendation",
      `Instrument,${symbol}`, `Quote to USD,${quoteToUsd}`, `Conversion date,${quote === "USD" ? "Not required" : conversion.data?.date}`,
      ...Object.entries(values).map(([key, value]) => `${key},${value}`),
      "Session,Projected opening balance,Risk budget USD,Lots rounded down,Modeled stop loss USD",
      ...rows.slice(1).map((row, index) => `${row.session},${row.openingBalance},${row.riskAmount},${sized[index]?.lots},${sized[index]?.riskAtStop}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "mia-fx-session-lot-sizes.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <section aria-labelledby="planner-lot-title" className="border-t border-border mt-8 pt-8 text-foreground">
      <h3 id="planner-lot-title" className="text-xl font-bold">Lot size for your first trade</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-5">USD account · Starting balance {dollars(rows[0]?.balance ?? 0)} · Risk per trade {dollars(rows[0]?.riskAmount ?? 0)}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="planner-instrument">Trading pair</Label><Select value={symbol} onValueChange={value => {
          const next = sizingInstruments.find(item => item.symbol === value);
          if (!next) return;
          setSymbol(value); setValues(current => ({ ...current, contract: String(next.contract), pip: String(next.pip) }));
        }}><SelectTrigger id="planner-instrument"><SelectValue /></SelectTrigger><SelectContent>{sizingInstruments.map(item => <SelectItem key={item.symbol} value={item.symbol}>{item.symbol}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="size-stopPips">Stop-loss distance (pips)</Label><Input id="size-stopPips" type="number" min="0.01" step="any" value={values.stopPips} onChange={e => setValues(current => ({ ...current, stopPips: e.target.value }))} /></div>
      </div>
      <p className="text-sm text-muted-foreground mt-3">Estimate uses standard contract sizes and excludes trading costs unless added below. Check your broker’s settings before trading.</p>
      {quote !== "USD" && <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
        <span>{conversion.data && !conversion.error ? `ECB daily reference via Frankfurter · ${conversion.data.date} · 1 ${quote} = ${conversion.data.rate.toFixed(6)} USD` : "Official conversion reference unavailable."}</span>
        {quote !== "USD" && <Button variant="outline" size="icon-sm" title="Refresh conversion" aria-label="Refresh conversion" onClick={() => conversion.refetch()}><RefreshCw className="h-4 w-4" /></Button>}
        <span className="text-muted-foreground">Daily reference, not a live broker quote.</span>
      </div>}
      {error && <p role="alert" className="mt-4 border-l-2 border-warning bg-warning/10 p-3 text-foreground">{error}</p>}
      {first && last && <>
        <div className="grid gap-5 sm:grid-cols-2 border-y border-border py-5 mt-5" aria-live="polite">
          <div><p className="text-sm text-muted-foreground">Estimated lot size · Per trade</p><p data-testid="first-session-lots" className="text-3xl text-success font-bold mt-1 break-words">{lotsLabel(first.lots)}{first.lots > 0 && <span className="text-base font-medium"> lots</span>}</p></div>
          <div><p className="text-sm text-muted-foreground">Estimated loss if stop is hit</p><p className="text-2xl font-bold mt-1">{dollars(first.riskAtStop)}</p></div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">Estimate only, not a trade recommendation. Actual losses may be larger. Available margin and other open trades still matter.</p>
      </>}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm py-2 font-medium">Advanced broker settings & trading costs</summary>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-3">{controls.slice(1).map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`size-${key}`}>{label}</Label><Input id={`size-${key}`} type="number" min="0" step="any" value={values[key]} onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))} /></div>)}</div>
        <p className="text-sm text-muted-foreground mt-4">Forex defaults to 100,000 base units per lot; gold to 100 oz and silver to 5,000 oz. Pip conventions and volume limits vary by broker. For gold, the default 0.01 pip means a $5 price distance is 500 pips.</p>
        {first && <p className="text-sm text-muted-foreground mt-3">Pip value per full lot: {dollars(first.pipValue)}. Lot size is risk budget divided by stop-loss cost plus commission, rounded down to your broker’s lot step and capped at its maximum. A zero result means the minimum lot exceeds your risk budget.</p>}
      </details>
      {first && last && <details className="mt-3">
        <summary className="cursor-pointer text-sm py-2 font-medium">Future session estimates</summary>
        <p className="text-sm text-muted-foreground mt-3">Last projected session: {lotsLabel(last.lots)} lots per trade. These hypothetical sizes reuse today’s settings; recalculate with your actual balance and broker rates before each trade.</p>
        <div className="flex flex-wrap justify-between items-center gap-3 mt-5"><h4 className="font-semibold">Projected lot sizes by session</h4><Button variant="outline" size="sm" onClick={download}><Download className="h-4 w-4 mr-2" /> Download lot sizes</Button></div>
        <details className="mt-3"><summary className="text-sm cursor-pointer py-2">View session lot sizes</summary><div className="overflow-auto max-h-[420px] border border-border rounded-md mt-2"><table className="w-full text-sm text-left whitespace-nowrap tabular-nums"><thead className="sticky top-0 bg-secondary text-secondary-foreground"><tr>{["Session", "Opening balance", "Risk budget", "Lots per trade", "Modeled stop loss"].map(label => <th key={label} className="px-4 py-3" scope="col">{label}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, i) => <tr key={row.session} className="border-t border-border"><td className="px-4 py-3">{row.session}</td><td className="px-4 py-3">{dollars(row.openingBalance)}</td><td className="px-4 py-3">{dollars(row.riskAmount)}</td><td className="px-4 py-3">{lotsLabel(sized[i]?.lots ?? 0)}</td><td className="px-4 py-3">{dollars(sized[i]?.riskAtStop ?? 0)}</td></tr>)}</tbody></table></div></details>
      </details>}
    </section>
  );
}