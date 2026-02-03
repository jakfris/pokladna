-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 21.00,
  category TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view products)
CREATE POLICY "Products are publicly readable"
  ON public.products
  FOR SELECT
  USING (true);

-- Create policy for authenticated users to manage products (temporary - will add admin role later)
CREATE POLICY "Authenticated users can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default products
INSERT INTO public.products (name, price, vat_rate, category, is_favorite, sort_order) VALUES
  ('Káva', 45, 21, 'Nápoje', true, 1),
  ('Čaj', 35, 21, 'Nápoje', true, 2),
  ('Limonáda', 40, 21, 'Nápoje', true, 3),
  ('Croissant', 55, 15, 'Pečivo', true, 4),
  ('Sendvič', 85, 15, 'Jídlo', true, 5),
  ('Salát', 95, 15, 'Jídlo', true, 6),
  ('Zákusek', 65, 15, 'Dezerty', true, 7),
  ('Zmrzlina', 50, 15, 'Dezerty', true, 8),
  ('Voda', 25, 21, 'Nápoje', true, 9),
  ('Džus', 45, 21, 'Nápoje', true, 10),
  ('Espresso', 40, 21, 'Nápoje', false, 11),
  ('Cappuccino', 55, 21, 'Nápoje', false, 12),
  ('Latte', 60, 21, 'Nápoje', false, 13),
  ('Horká čokoláda', 50, 21, 'Nápoje', false, 14),
  ('Smoothie', 75, 21, 'Nápoje', false, 15),
  ('Bageta', 75, 15, 'Jídlo', false, 16),
  ('Panini', 90, 15, 'Jídlo', false, 17),
  ('Polévka', 65, 15, 'Jídlo', false, 18),
  ('Tiramisu', 80, 15, 'Dezerty', false, 19),
  ('Cheesecake', 85, 15, 'Dezerty', false, 20),
  ('Brownie', 60, 15, 'Dezerty', false, 21),
  ('Muffin', 45, 15, 'Pečivo', false, 22),
  ('Rohlík', 8, 15, 'Pečivo', false, 23),
  ('Koláč', 35, 15, 'Pečivo', false, 24);