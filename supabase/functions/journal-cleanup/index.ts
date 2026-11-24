// Removes trades and private chart images that belong to deleted accounts.
import { authenticateCronRequest } from "../_shared/cron-auth.ts";
import { admin, BUCKET, json } from "../_shared/journal/server.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

Deno.serve(async (req) => {
  const denied = authenticateCronRequest(req);
  if (denied) return denied;
  const db = admin();
  const owners = new Set<string>();
  const { data: rows } = await db.from("trades").select("owner_id").limit(10000);
  rows?.forEach(r => owners.add(r.owner_id));
  const { data: folders } = await db.storage.from(BUCKET).list("", { limit: 1000 });
  folders?.forEach(f => { if (UUID.test(f.name)) owners.add(f.name); });

  let removedUsers = 0, removedImages = 0;
  for (const id of owners) {
    const { data, error } = await db.auth.admin.getUserById(id);
    if (data?.user || (error && error.status !== 404)) continue; // keep unless confirmed deleted
    for (;;) {
      const { data: files } = await db.storage.from(BUCKET).list(id, { limit: 100 });
      if (!files?.length) break;
      const { error: rmErr } = await db.storage.from(BUCKET).remove(files.map(f => `${id}/${f.name}`));
      if (rmErr) break;
      removedImages += files.length;
    }
    await db.from("trades").delete().eq("owner_id", id);
    removedUsers++;
  }
  return json({ removedUsers, removedImages });
});
