import { useState } from "react";
import { CartItem, Product, Receipt, PaymentType } from "@/types/pos";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("hotovost");
  const queryClient = useQueryClient();

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
    setPaymentType("hotovost");
    toast.info("Účtenka vymazána");
  };

  const submitReceipt = async () => {
    if (items.length === 0) return;

    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const receipt: Receipt = {
      id: `REC-${Date.now()}`,
      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      total,
      createdAt: new Date().toISOString(),
      paymentType,
      transactionType: "prodej",
    };

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save to database
      const { data: savedReceipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({
          user_id: user?.id || null,
          total,
          payment_type: paymentType,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Save receipt items
      const receiptItems = items.map((item) => ({
        receipt_id: savedReceipt.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("receipt_items")
        .insert(receiptItems);

      if (itemsError) throw itemsError;

      // Send to webhook via edge function (secure server-side call)
      try {
        await supabase.functions.invoke("send-receipt-webhook", {
          body: { receiptId: savedReceipt.id, transactionType: "prodej" },
        });
      } catch (webhookError) {
        console.warn("Webhook failed, but receipt was saved:", webhookError);
      }

      // Invalidate receipts query to refresh history
      queryClient.invalidateQueries({ queryKey: ["receipts"] });

      // Log the receipt for demo purposes
      console.log("Receipt submitted:", JSON.stringify(receipt, null, 2));
      
      toast.success(`Účtenka uložena!`, {
        description: `Celkem: ${total} Kč (${paymentType === "hotovost" ? "Hotovost" : "Karta"})`,
      });
      
      setItems([]);
      setPaymentType("hotovost");
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
    paymentType,
    setPaymentType,
    addItem,
    removeItem,
    clearCart,
    submitReceipt,
  };
};
