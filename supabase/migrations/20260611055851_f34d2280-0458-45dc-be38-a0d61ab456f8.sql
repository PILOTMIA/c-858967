
-- 1) Contact submissions: explicit restrictive SELECT deny for anon/authenticated
DROP POLICY IF EXISTS "Deny client reads on contact_submissions" ON public.contact_submissions;
CREATE POLICY "Deny client reads on contact_submissions"
ON public.contact_submissions
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

-- 2) Indicator downloads: explicit restrictive SELECT deny for anon/authenticated
DROP POLICY IF EXISTS "Deny client reads on indicator_downloads" ON public.indicator_downloads;
CREATE POLICY "Deny client reads on indicator_downloads"
ON public.indicator_downloads
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

-- 3) cot_history: remove permissive authenticated INSERT (service_role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role can insert COT history" ON public.cot_history;
DROP POLICY IF EXISTS "Service role can update COT history" ON public.cot_history;
DROP POLICY IF EXISTS "Service role can delete COT history" ON public.cot_history;

-- 4) Lock down SECURITY DEFINER trigger functions (only triggers/owner should call them)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated, public;
