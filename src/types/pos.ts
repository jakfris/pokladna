import { Product } from "./product";

export type { Product };

export type PaymentType = "hotovost" | "karta";
export type TransactionType = "prodej" | "refund";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Receipt {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  paymentType: PaymentType;
  transactionType: TransactionType;
}
