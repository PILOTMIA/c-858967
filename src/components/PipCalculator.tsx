import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLiveBoard } from "./LivePriceBoard";

/**
 * Accurate pip value calculator.
 * Pip value is NOT the same for every pair: it depends on the pip size of the
 * quote currency, the contract size of the instrument, and the FX rate used to
 * convert the quote currency back into the account currency.
 */

type Instrument = {
  symbol: string;
  label: string;
  quote: string;      // currency the pip value is initially expressed in
  pipSize: number;    // price increment of one pip
  contract: number;   // units per 1.00 standard lot
};

const INSTRUMENTS: Instrument[] = [
  { symbol: "EURUSD", label: "EURUSD", quote: "USD", pipSize: 0.0001, contract: 100000 },
  { symbol: "GBPUSD", label: "GBPUSD", quote: "USD", pipSize: 0.0001, contract: 100000 },
  { symbol: "AUDUSD", label: "AUDUSD", quote: "USD", pipSize: 0.0001, contract: 100000 },
  { symbol: "NZDUSD", label: "NZDUSD", quote: "USD", pipSize: 0.0001, contract: 100000 },
  { symbol: "USDJPY", label: "USDJPY", quote: "JPY", pipSize: 0.01, contract: 100000 },
  { symbol: "USDCHF", label: "USDCHF", quote: "CHF", pipSize: 0.0001, contract: 100000 },
  { symbol: "USDCAD", label: "USDCAD", quote: "CAD", pipSize: 0.0001, contract: 100000 },
  { symbol: "EURJPY", label: "EURJPY", quote: "JPY", pipSize: 0.01, contract: 100000 },
  { symbol: "GBPJPY", label: "GBPJPY", quote: "JPY", pipSize: 0.01, contract: 100000 },
  { symbol: "AUDJPY", label: "AUDJPY", quote: "JPY", pipSize: 0.01, contract: 100000 },
  { symbol: "EURGBP", label: "EURGBP", quote: "GBP", pipSize: 0.0001, contract: 100000 },
  { symbol: "EURCHF", label: "EURCHF", quote: "CHF", pipSize: 0.0001, contract: 100000 },
  { symbol: "XAUUSD", label: "Gold (XAUUSD)", quote: "USD", pipSize: 0.01, contract: 100 },
  { symbol: "XAGUSD", label: "Silver (XAGUSD)", quote: "USD", pipSize: 0.001, contract: 5000 },
];

const ACCOUNT_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD"];

/** Value of 1 unit of `ccy` expressed in USD, derived from live majors. */
function ccyInUsd(ccy: string, rates: Record<string, { rate: number }>): number | undefined {
  if (ccy === "USD") return 1;
  const direct = rates[`${ccy}USD`]?.rate;      // EURUSD, GBPUSD, AUDUSD, NZDUSD
  if (direct) return direct;
  const inverse = rates[`USD${ccy}`]?.rate;     // USDJPY, USDCHF, USDCAD
  if (inverse) return 1 / inverse;
  return undefined;
}

const PipCalculator = () => {
  const { data, isLoading } = useLiveBoard();
  const [symbol, setSymbol] = useState("EURUSD");
  const [lots, setLots] = useState("1");
  const [account, setAccount] = useState("USD");
  const [stopPips, setStopPips] = useState("20");

  const instrument = INSTRUMENTS.find((i) => i.symbol === symbol)!;
  const rates = data?.rates ?? {};

  const result = useMemo(() => {
    const lotNum = Math.max(0, Number(lots) || 0);
    const units = lotNum * instrument.contract;
    const pipInQuote = instrument.pipSize * units;

    const quoteUsd = ccyInUsd(instrument.quote, rates);
    const accountUsd = ccyInUsd(account, rates);
    const converted =
      quoteUsd !== undefined && accountUsd ? (pipInQuote * quoteUsd) / accountUsd : undefined;

    const fx = quoteUsd !== undefined && accountUsd ? quoteUsd / accountUsd : undefined;
    const perPip = converted;
    const risk = perPip !== undefined ? perPip * (Number(stopPips) || 0) : undefined;

    return { pipInQuote, perPip, fx, risk, units };
  }, [instrument, lots, account, stopPips, rates]);

  const money = (n?: number) =>
    n === undefined
      ? "—"
      : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="ma-panel p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="ma-accent-bar h-10 mt-1" />
        <div>
          <p className="ma-eyebrow">Position sizing</p>
          <h2 className="ma-serif text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" /> Pip Value Calculator
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Weighted per instrument — pip size, contract size and live conversion rate all differ by pair.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div>
            <label className="ma-eyebrow block mb-1.5">Instrument</label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="ma-mono"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {INSTRUMENTS.map((i) => (
                  <SelectItem key={i.symbol} value={i.symbol} className="ma-mono">{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ma-eyebrow block mb-1.5">Lots</label>
              <Input
                type="number" min="0" step="0.01" value={lots}
                onChange={(e) => setLots(e.target.value)} className="ma-mono"
              />
            </div>
            <div>
              <label className="ma-eyebrow block mb-1.5">Account ccy</label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="ma-mono"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c} className="ma-mono">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="ma-eyebrow block mb-1.5">Stop loss (pips)</label>
            <Input
              type="number" min="0" step="1" value={stopPips}
              onChange={(e) => setStopPips(e.target.value)} className="ma-mono"
            />
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <p className="ma-eyebrow">Value per pip</p>
            <p className="ma-mono text-2xl font-semibold text-foreground mt-1">
              {money(result.perPip)} <span className="text-sm text-muted-foreground">{account}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {instrument.pipSize} pip × {result.units.toLocaleString()} units
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--ma-elev)/0.6)] bg-[hsl(var(--ma-bg)/0.55)] p-4">
            <p className="ma-eyebrow">Risk at stop</p>
            <p className="ma-mono text-2xl font-semibold text-foreground mt-1">
              {money(result.risk)} <span className="text-sm text-muted-foreground">{account}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{stopPips || 0} pips from entry</p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--ma-elev)/0.6)] bg-[hsl(var(--ma-bg)/0.55)] p-4">
            <p className="ma-eyebrow">Pip value in quote ccy</p>
            <p className="ma-mono text-lg font-semibold text-foreground mt-1">
              {money(result.pipInQuote)} {instrument.quote}
            </p>
          </div>

          <div className="rounded-xl border border-[hsl(var(--ma-elev)/0.6)] bg-[hsl(var(--ma-bg)/0.55)] p-4">
            <p className="ma-eyebrow">Conversion {instrument.quote} → {account}</p>
            <p className="ma-mono text-lg font-semibold text-foreground mt-1">
              {isLoading ? "…" : result.fx ? result.fx.toFixed(5) : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Live rate from the price feed</p>
          </div>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-px shrink-0" />
        Gold uses a 100 oz contract with a 0.01 pip, silver a 5,000 oz contract with a 0.001 pip, and JPY pairs a
        0.01 pip — which is why their pip values differ sharply from standard 0.0001 FX pairs.
      </p>
    </section>
  );
};

export default PipCalculator;
