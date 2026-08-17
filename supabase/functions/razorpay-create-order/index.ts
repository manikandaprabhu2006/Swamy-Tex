import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return new Response(JSON.stringify({ error: "Valid amount (in paise) is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      // Demo mode — return a mock order ID so the flow can be tested
      const mockId = `order_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
      return new Response(JSON.stringify({
        orderId: mockId, amount, currency: "INR", keyId: "rzp_test_DEMOSWAMYTEX", demo: true,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, currency: "INR", receipt: `swamy_${Date.now()}` }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: "Razorpay error", detail: err }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await res.json();
    return new Response(JSON.stringify({
      orderId: order.id, amount: order.amount, currency: order.currency, keyId,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
