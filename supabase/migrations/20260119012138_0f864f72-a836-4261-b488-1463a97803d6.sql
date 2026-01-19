-- Add DELETE policy for GDPR compliance
CREATE POLICY "Users can delete own profile"
ON public.profiles
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);