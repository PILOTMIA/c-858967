export interface CompoundPlan {
  startingBalance: number;
  riskPercent: number;
  returnPercent: number;
  sessions: number;
  tradesPerSession: number;
}

export const compoundExample = { riskPercent: 5, returnPercent: 24, sessions: 60, tradesPerSession: 3 };

export interface CompoundSession {
  session: number;
  openingBalance: number;
  gain: number;
  balance: number;
  riskAmount: number;
  simpleBalance: number;
}

export function calculateCompounding(plan: CompoundPlan): CompoundSession[] {
  const { startingBalance, riskPercent, returnPercent, sessions, tradesPerSession } = plan;
  if (Object.values(plan).some(value => !Number.isFinite(value))) throw new Error("Enter a number in every field.");
  if (startingBalance <= 0 || startingBalance > 1e12) throw new Error("Starting balance must be above zero and no more than 1 trillion.");
  if (riskPercent < 0 || riskPercent > 100) throw new Error("Risk per trade must be between 0% and 100%.");
  if (returnPercent < -100 || returnPercent > 1000) throw new Error("Session return must be between −100% and 1,000%.");
  if (!Number.isInteger(sessions) || sessions < 1 || sessions > 1000) throw new Error("Choose 1 to 1,000 whole sessions.");
  if (!Number.isInteger(tradesPerSession) || tradesPerSession < 1 || tradesPerSession > 100) throw new Error("Choose 1 to 100 whole trades per session.");
  const rows: CompoundSession[] = [{ session: 0, openingBalance: startingBalance, gain: 0, balance: startingBalance, riskAmount: startingBalance * riskPercent / 100, simpleBalance: startingBalance }];
  let balance = startingBalance;
  for (let session = 1; session <= sessions; session++) {
    const openingBalance = balance;
    const gain = openingBalance * returnPercent / 100;
    balance = openingBalance + gain;
    if (!Number.isFinite(balance) || balance > 1e100) throw new Error("This projection is too large to display. Reduce the return or number of sessions.");
    rows.push({ session, openingBalance, gain, balance, riskAmount: openingBalance * riskPercent / 100, simpleBalance: Math.max(0, startingBalance * (1 + session * returnPercent / 100)) });
  }
  return rows;
}

// Sequential stop-outs, resizing risk from the remaining balance after each trade.
export function lossStressPercent(riskPercent: number, trades: number): number {
  return (1 - Math.pow(1 - riskPercent / 100, trades)) * 100;
}

export function compoundCsv(rows: CompoundSession[], plan: CompoundPlan): string {
  return [
    "Hypothetical compounding plan — USD; no fees, taxes, deposits or withdrawals",
    `Starting balance,${plan.startingBalance}`,
    `Assumed session return (%),${plan.returnPercent}`,
    `Risk per trade (%),${plan.riskPercent}`,
    `Trades per session,${plan.tradesPerSession}`,
    "Session,Opening balance,Session gain or loss,Closing balance,Risk per trade at session open,Without compounding",
    ...rows.map(row => [row.session, row.openingBalance, row.gain, row.balance, row.riskAmount, row.simpleBalance].join(",")),
  ].join("\n");
}