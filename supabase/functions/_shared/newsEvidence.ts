/** Only dated provider articles can contribute to current news sentiment. */
export function currentNewsTimestamp(value: string, now = Date.now()): string | null {
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time > now || now - time > 72 * 3600_000) return null;
  return new Date(time).toISOString();
}