-- Create enum for payment type
CREATE TYPE public.payment_type AS ENUM ('hotovost', 'karta');

-- Add payment_type column to receipts
ALTER TABLE public.receipts 
ADD COLUMN payment_type public.payment_type NOT NULL DEFAULT 'hotovost';

-- Add refund tracking columns
ALTER TABLE public.receipts 
ADD COLUMN is_refunded boolean NOT NULL DEFAULT false,
ADD COLUMN refunded_at timestamp with time zone,
ADD COLUMN refunded_by uuid REFERENCES auth.users(id);

-- Create index for refund queries
CREATE INDEX idx_receipts_is_refunded ON public.receipts(is_refunded);

-- Allow admins and managers to update receipts (for refunds)
CREATE POLICY "Admins and managers can update receipts for refunds"
ON public.receipts
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));