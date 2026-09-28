import type { CotHistoryRow } from "@/hooks/useCOTHistory";

/** Explains the measured change in contracts; COT reports do not establish why traders acted. */
export function explainCOTChange(row: Pick<CotHistoryRow, "change_long" | "change_short" | "net_position">): string {
  if (row.change_long == null || row.change_short == null) return "Weekly change unavailable; compare with the prior report.";
  const longs = Number(row.change_long);
  const shorts = Number(row.change_short);
  const delta = longs - shorts;
  const amount = (n: number) => Math.abs(n).toLocaleString("en-US");
  if (delta === 0) return "Net exposure was unchanged; long and short changes offset each other.";
  let driver: string;
  if (longs > 0 && shorts < 0) driver = `Traders added ${amount(longs)} longs and covered ${amount(shorts)} shorts`;
  else if (longs < 0 && shorts > 0) driver = `Traders cut ${amount(longs)} longs and added ${amount(shorts)} shorts`;
  else if (longs >= 0 && shorts >= 0) driver = longs > shorts
    ? `Both sides grew; longs rose ${amount(longs)}, more than shorts (${amount(shorts)})`
    : `Both sides grew; shorts rose ${amount(shorts)}, more than longs (${amount(longs)})`;
  else driver = longs > shorts
    ? `Both sides shrank; shorts fell ${amount(shorts)}, more than longs (${amount(longs)})`
    : `Both sides shrank; longs fell ${amount(longs)}, more than shorts (${amount(shorts)})`;
  const position = row.net_position >= 0 ? "net long" : "net short";
  return `${driver}. Net exposure ${delta > 0 ? "rose" : "fell"} ${amount(delta)} contracts; traders remain ${position}.`;
}