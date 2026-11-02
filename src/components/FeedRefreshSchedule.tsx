import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** Refresh mounted consumers at the two required Arizona-time checkpoints. */
export default function FeedRefreshSchedule() {
  const client = useQueryClient();
  useEffect(() => {
    let lastCheckpoint = "";
    const timer = setInterval(() => {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      }).formatToParts(new Date());
      const get = (name: string) => parts.find(p => p.type === name)?.value;
      const hour = get("hour");
      const checkpoint = `${get("year")}-${get("month")}-${get("day")}-${hour}`;
      if ((hour === "14" || hour === "15") && get("minute") === "00" && lastCheckpoint !== checkpoint) {
        lastCheckpoint = checkpoint;
        void client.invalidateQueries();
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [client]);
  return null;
}