
DROP POLICY IF EXISTS "Allow service role inserts" ON public.contact_submissions;
CREATE POLICY "Public can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(message) BETWEEN 1 AND 5000
  AND (phone IS NULL OR length(phone) <= 32)
);

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.indicator_downloads;
CREATE POLICY "Public can record indicator download"
ON public.indicator_downloads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) BETWEEN 3 AND 255
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (ip_address IS NULL OR length(ip_address) <= 64)
  AND (user_agent IS NULL OR length(user_agent) <= 512)
);
