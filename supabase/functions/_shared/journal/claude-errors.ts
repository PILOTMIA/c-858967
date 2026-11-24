type ClaudeError = { message: string; status: number; code: string; providerDetails?: string; requestId?: string };

export function describeClaudeError(status: number, payload: unknown, key: string, headerRequestId?: string | null): ClaudeError {
  const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const error = body.error && typeof body.error === "object" ? body.error as Record<string, unknown> : {};
  const original = typeof error.message === "string" ? error.message : "";
  const candidateId = headerRequestId || (typeof body.request_id === "string" ? body.request_id : "");
  const requestId = /^req_[A-Za-z0-9_-]{5,120}$/.test(candidateId) ? candidateId : undefined;
  // Return bounded diagnostic text to this visitor, never a key or image payload.
  const providerDetails = original
    .split(key || "\0").join("[key redacted]")
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[key redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/[A-Za-z0-9+/=_-]{120,}/g, "[long value redacted]")
    .replace(/[\u0000-\u001f]/g, " ").slice(0, 500) || undefined;
  const result = (code: string, message: string, responseStatus = 422): ClaudeError => ({ code, message, status: responseStatus, providerDetails, requestId });

  if (/credit balance|insufficient.{0,20}credit|credit.{0,20}(?:too low|insufficient|exhausted)|payment required/i.test(original))
    return result("billing", "Your Claude API credit balance is too low. Add credit in Claude Console under Billing, then retry this chart with the same key.");
  if (/workspace/i.test(original) && /required|missing|specify|select|scope|header/i.test(original))
    return result("workspace", "This API key needs a workspace. Create a key scoped to your workspace in Claude Console, then reconnect it.");
  if (status === 401 || status === 403)
    return result("authentication", "Claude could not authorise this key. Check the key and its access in AI connection, then try again.");
  if (status === 429)
    return result("rate_limit", "Claude's usage limit was reached. Wait a moment and check your Console usage limits before trying again.", 429);
  if (status === 413 || /image|base64|media_type|dimensions/i.test(original))
    return result("image", "Claude could not read this image. Export a fresh PNG or JPG screenshot with readable labels and try again.");
  if (status === 404 || (/model/i.test(original) && /not found|not available|unsupported|not support|access/i.test(original)))
    return result("model", "The configured Claude model is unavailable for this key. Check the provider details below.");
  if (status >= 500)
    return result("provider_unavailable", "Claude is temporarily unavailable. Your chart is still here; try again shortly.", 502);
  return result("request", "Claude rejected the analysis request. Check the provider details below to see what needs changing.");
}
