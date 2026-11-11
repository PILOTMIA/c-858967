export type RateObservation = { date: string; value: string };
export function latestRate(observations: RateObservation[] = []) {
  const valid = observations.filter(o => o.value !== '.' && Number.isFinite(Number(o.value)) && /^\d{4}-\d{2}-\d{2}$/.test(o.date));
  const sorted = [...valid].sort((a, b) => b.date.localeCompare(a.date));
  if (!sorted.length) return null;
  return { value: Number(sorted[0].value), date: sorted[0].date, previous: sorted[1] ? Number(sorted[1].value) : null };
}
export function basisPointChange(current: number, previous: number) {
  return Math.round((current - previous) * 10000) / 100;
}