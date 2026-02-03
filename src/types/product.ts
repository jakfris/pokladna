export interface Product {
  id: string;
  name: string;
  price: number;
  vat_rate: number;
  category: string | null;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  name: string;
  price: number;
  vat_rate?: number;
  category?: string | null;
  is_favorite?: boolean;
  sort_order?: number;
}

export interface ProductUpdate {
  id: string;
  name?: string;
  price?: number;
  vat_rate?: number;
  category?: string | null;
  is_favorite?: boolean;
  sort_order?: number;
}
