import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PaymentType } from "@/types/pos";

export interface ReceiptItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface ReceiptWithItems {
  id: string;
  total: number;
  created_at: string;
  user_id: string | null;
  payment_type: PaymentType;
  is_refunded: boolean;
  refunded_at: string | null;
  refunded_by: string | null;
  items: ReceiptItem[];
}

export const useReceipts = (searchQuery?: string, dateFrom?: Date, dateTo?: Date) => {
  return useQuery({
    queryKey: ["receipts", searchQuery, dateFrom?.toISOString(), dateTo?.toISOString()],
    queryFn: async (): Promise<ReceiptWithItems[]> => {
      // First fetch receipts
      let receiptsQuery = supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (dateFrom) {
        receiptsQuery = receiptsQuery.gte("created_at", dateFrom.toISOString());
      }
      if (dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        receiptsQuery = receiptsQuery.lt("created_at", endDate.toISOString());
      }

      const { data: receipts, error: receiptsError } = await receiptsQuery;

      if (receiptsError) throw receiptsError;
      if (!receipts || receipts.length === 0) return [];

      // Fetch items for all receipts
      const receiptIds = receipts.map((r) => r.id);
      const { data: items, error: itemsError } = await supabase
        .from("receipt_items")
        .select("*")
        .in("receipt_id", receiptIds);

      if (itemsError) throw itemsError;

      // Group items by receipt
      const itemsByReceipt = (items || []).reduce((acc, item) => {
        if (!acc[item.receipt_id]) {
          acc[item.receipt_id] = [];
        }
        acc[item.receipt_id].push(item);
        return acc;
      }, {} as Record<string, ReceiptItem[]>);

      // Combine receipts with their items
      let result = receipts.map((receipt) => ({
        ...receipt,
        payment_type: receipt.payment_type as PaymentType,
        items: itemsByReceipt[receipt.id] || [],
      }));

      // Filter by search query (product names)
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter((receipt) =>
          receipt.items.some((item) => item.product_name.toLowerCase().includes(query))
        );
      }

      return result;
    },
  });
};

export const useRefundReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receipt: ReceiptWithItems) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Uživatel není přihlášen");
      }

      // Update receipt as refunded
      const { error: updateError } = await supabase
        .from("receipts")
        .update({
          is_refunded: true,
          refunded_at: new Date().toISOString(),
          refunded_by: user.id,
        })
        .eq("id", receipt.id);

      if (updateError) throw updateError;

      // Send webhook via edge function (secure server-side call)
      try {
        await supabase.functions.invoke("send-receipt-webhook", {
          body: { receiptId: receipt.id, transactionType: "refund" },
        });
      } catch (webhookError) {
        console.warn("Webhook failed, but refund was saved:", webhookError);
      }

      return receipt.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Účtenka byla stornována");
    },
    onError: (error: Error) => {
      toast.error("Chyba při stornování účtenky", {
        description: error.message,
      });
    },
  });
};
