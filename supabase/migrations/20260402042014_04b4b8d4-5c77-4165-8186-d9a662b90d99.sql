
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow the edge function (service role) to insert, and allow anon/authenticated to insert via the edge function
CREATE POLICY "Allow service role inserts"
ON public.contact_submissions
FOR INSERT
TO authenticated, anon
WITH CHECK (true);
