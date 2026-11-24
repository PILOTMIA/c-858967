import { admin, BUCKET, corsHeaders, json, readImage, requireUser } from "../_shared/journal/server.ts";
import { plannedR, riskError, tradeInputSchema } from "../_shared/journal/chart.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const userId = await requireUser(req);
  if (!userId) return json({ error: "Sign in to save to your journal." }, 401);
  let form: FormData;
  try { form = await req.formData(); } catch { return json({ error: "Send the trade as a form upload." }, 400); }
  let raw: unknown;
  try { raw = JSON.parse(String(form.get("record") ?? "")); } catch { return json({ error: "The trade details could not be read." }, 400); }
  const parsed = tradeInputSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return json({ error: issue?.path[0] === "verified" ? "Confirm you have checked the details before saving." : issue?.message || "Check the trade details." }, 400);
  }
  const record = parsed.data;
  const risk = riskError(record);
  if (risk) return json({ error: risk }, 400);

  const db = admin();
  let imageKey = form.get("imageKey");
  if (typeof imageKey === "string" && imageKey) {
    const [folder, name, ...rest] = imageKey.split("/");
    if (folder !== userId || !name || rest.length || !/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(name)) return json({ error: "That chart image does not belong to your account." }, 403);
    const { data } = await db.storage.from(BUCKET).list(userId, { search: name, limit: 1 });
    if (!data?.some(f => f.name === name)) return json({ error: "The analysed chart image was not found. Upload it again." }, 400);
  } else {
    const image = await readImage(form);
    if ("error" in image) return json({ error: image.error }, 400);
    imageKey = `${userId}/${crypto.randomUUID()}.${image.ext}`;
    const { error } = await db.storage.from(BUCKET).upload(imageKey, image.bytes, { contentType: image.mime });
    if (error) return json({ error: "Could not store the chart image." }, 500);
  }
  const full = { ...record, plannedR: plannedR(record) };
  const { data: row, error } = await db.from("trades").insert({ owner_id: userId, record: full, image_key: imageKey }).select("id, created_at, archived, record, image_key").single();
  if (error || !row) return json({ error: "Could not save your review." }, 500);
  return json({ trade: row });
});
