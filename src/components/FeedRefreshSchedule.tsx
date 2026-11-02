import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { arizonaRefreshCheckpoint } from "@/lib/feedSchedule";

/** Refresh mounted consumers at the two required Arizona-time checkpoints. */
export default function FeedRefreshSchedule() {
  const client = useQueryClient();
  useEffect(() => {
    let lastCheckpoint = "";
    const timer = setInterval(() => {
      const checkpoint = arizonaRefreshCheckpoint(new Date());
      if (checkpoint && lastCheckpoint !== checkpoint) {
        lastCheckpoint = checkpoint;
        void client.invalidateQueries();
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [client]);
  return null;
}