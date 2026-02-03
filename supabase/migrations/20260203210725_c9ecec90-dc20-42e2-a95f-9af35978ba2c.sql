-- 1. Remove manager access to all profiles (privacy protection)
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;

-- 2. Fix receipts policy to prevent anonymous receipt creation
-- Drop the old policy
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts;

-- Create new stricter policy that requires user_id to match auth.uid() (no null allowed)
CREATE POLICY "Users can create their own receipts"
ON public.receipts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());