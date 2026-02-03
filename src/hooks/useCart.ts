import { useState } from "react";
import { CartItem, Product, Receipt } from "@/types/pos";
import { toast } from "sonner";

const WEBHOOK_URL = "https://hook.eu1.make.celonis.com/u521kd500s1y1956s73kj6wak69xkb4o";

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = (product: Product, quantity: number) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      
      return [...prev, { product, quantity }];
    });
    
    toast.success(`${quantity}× ${product.name} přidáno`);
  };

  const removeItem = (index: number) => {
    const item = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info(`${item.product.name} odebráno`);
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Účtenka vymazána");
  };

  const submitReceipt = async () => {
    if (items.length === 0) return;

    const receipt: Receipt = {
      id: `REC-${Date.now()}`,
      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);

    try {
      if (WEBHOOK_URL) {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(receipt),
        });

        if (!response.ok) {
          throw new Error("Chyba při odesílání");
        }
      }

      // Log the receipt for demo purposes
      console.log("Receipt submitted:", JSON.stringify(receipt, null, 2));
      
      toast.success(`Účtenka ${receipt.id} uložena!`, {
        description: `Celkem: ${receipt.total} Kč`,
      });
      
      setItems([]);
    } catch (error) {
      console.error("Error submitting receipt:", error);
      toast.error("Chyba při ukládání účtenky", {
        description: "Zkuste to prosím znovu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items,
    isSubmitting,
    addItem,
    removeItem,
    clearCart,
    submitReceipt,
  };
};
