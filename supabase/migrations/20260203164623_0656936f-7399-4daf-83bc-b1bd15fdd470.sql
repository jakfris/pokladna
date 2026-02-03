-- Fix 1: Restrict receipt viewing to owners and admins/managers
DROP POLICY IF EXISTS "Authenticated users can view receipts" ON public.receipts;

CREATE POLICY "Users can view own receipts or admins/managers view all"
  ON public.receipts FOR SELECT
  USING (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Fix 2: Restrict receipt items viewing based on receipt ownership
DROP POLICY IF EXISTS "Authenticated users can view receipt items" ON public.receipt_items;

CREATE POLICY "Users can view own receipt items or admins/managers view all"
  ON public.receipt_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND (
        receipts.user_id = auth.uid() 
        OR has_role(auth.uid(), 'admin'::app_role)
        OR has_role(auth.uid(), 'manager'::app_role)
      )
    )
  );

-- Fix 3: Validate user_id ownership on receipt creation
DROP POLICY IF EXISTS "Authenticated users can insert receipts" ON public.receipts;

CREATE POLICY "Users can create their own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (user_id = auth.uid() OR user_id IS NULL)
  );

-- Fix 4: Validate receipt_items insertion - only allow for own receipts
DROP POLICY IF EXISTS "Authenticated users can insert receipt items" ON public.receipt_items;

CREATE POLICY "Users can insert items for their own receipts"
  ON public.receipt_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.receipts
      WHERE receipts.id = receipt_items.receipt_id
      AND (
        receipts.user_id = auth.uid() 
        OR has_role(auth.uid(), 'admin'::app_role)
        OR has_role(auth.uid(), 'manager'::app_role)
      )
    )
  );