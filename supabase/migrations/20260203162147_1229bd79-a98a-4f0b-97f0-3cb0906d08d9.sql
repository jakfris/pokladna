-- Add policy requiring authentication for profiles table
-- This modifies the existing user policy to explicitly check for authentication
-- Since RLS is default-deny and all existing policies require auth.uid(), 
-- we'll add an explicit authentication check
CREATE POLICY "Profiles require authentication"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);