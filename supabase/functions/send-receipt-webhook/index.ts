import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { receiptId, transactionType } = await req.json();

    if (!receiptId) {
      return new Response(JSON.stringify({ error: "Receipt ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch and validate receipt with items
    const { data: receipt, error: receiptError } = await supabaseClient
      .from("receipts")
      .select("*, receipt_items(*)")
      .eq("id", receiptId)
      .single();

    if (receiptError || !receipt) {
      return new Response(JSON.stringify({ error: "Receipt not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify access (owner or admin/manager)
    if (receipt.user_id !== user.id) {
      const { data: roles } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "manager"]);

      if (!roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Use service role to get webhook URL from system_settings (RLS protected)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: webhookSetting } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", "webhook_url")
      .single();

    const webhookUrl = webhookSetting?.value;

    if (!webhookUrl) {
      // Webhook not configured - silently succeed (no webhook to call)
      return new Response(
        JSON.stringify({ success: true, message: "Webhook not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format payload
    const webhookPayload = {
      id: receipt.id,
      items: receipt.receipt_items.map((item: any) => ({
        product: { name: item.product_name, price: item.product_price },
        quantity: item.quantity,
      })),
      total: receipt.total,
      createdAt: receipt.created_at,
      paymentType: receipt.payment_type,
      transactionType: transactionType || "prodej",
      ...(transactionType === "refund" && {
        refundedAt: receipt.refunded_at,
        refundedBy: receipt.refunded_by,
      }),
    };

    // Send to webhook from server-side
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });
    } catch (err) {
      console.error("Webhook failed:", err);
      // Don't fail the request if webhook fails - receipt is already saved
      return new Response(
        JSON.stringify({ success: true, webhookError: "Webhook call failed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-receipt-webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
