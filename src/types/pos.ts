import { Product } from "./product";

export type { Product };

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
