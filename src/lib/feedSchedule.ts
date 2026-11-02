export function arizonaRefreshCheckpoint(now: Date): string | null {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const get = (name: string) => parts.find(p => p.type === name)?.value;
  const hour = get("hour");
  return (hour === "14" || hour === "15") && get("minute") === "00"
    ? `${get("year")}-${get("month")}-${get("day")}-${hour}` : null;
}