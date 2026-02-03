export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Receipt {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}
