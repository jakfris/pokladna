-- Deny anonymous access to profiles table
-- This explicitly blocks any SELECT attempts from unauthenticated users
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles FOR SELECT
TO anon
USING (false);