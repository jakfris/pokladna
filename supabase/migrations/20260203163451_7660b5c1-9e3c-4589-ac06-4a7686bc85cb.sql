-- Drop the overly permissive policy that allows any authenticated user to read all profiles
DROP POLICY IF EXISTS "Profiles require authentication" ON public.profiles;

-- The remaining policies are correct:
-- "Users can view their own profile" - allows users to see their own data (auth.uid() = user_id)
-- "Admins can view all profiles" - allows admins to see all data for user management

-- Also add manager access for user management
CREATE POLICY "Managers can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role));