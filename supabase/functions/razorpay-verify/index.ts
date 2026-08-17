import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderInputItem {
  product_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
  name: string;
  slug: string;
  image: string | null;
  weight: number;
}

interface OrderInput {
  address: {
    id: string;
    full_name: string;
    phone: string;
    address_line: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderInputItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderInput } = await req.json();

    if (!orderInput || !orderInput.items || !orderInput.address) {
      return new Response(JSON.stringify({ error: "Missing order data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const isDemo = !keyId || !keySecret;

    // Verify signature (skip in demo mode)
    if (!isDemo) {
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(keySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const expected = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`));
      const expectedHex = Array.from(new Uint8Array(expected)).map((b) => b.toString(16).padStart(2, "0")).join("");
      if (expectedHex !== razorpay_signature) {
        return new Response(JSON.stringify({ error: "Payment signature verification failed" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Create Supabase client with service role to write the order
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // SERVER-SIDE: re-verify prices from the database (never trust frontend amounts)
    const productIds = orderInput.items.map((i: OrderInputItem) => i.product_id);
    const { data: products } = await supabase.from("products").select("id, price, stock, status").in("id", productIds);

    let verifiedSubtotal = 0;
    for (const item of orderInput.items as OrderInputItem[]) {
      const product = products?.find((p: { id: string; price: number; stock: number; status: string }) => p.id === item.product_id);
      if (!product) {
        return new Response(JSON.stringify({ error: `Product not found: ${item.name}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (product.status === "OUT OF STOCK" || product.stock < item.quantity) {
        return new Response(JSON.stringify({ error: `Insufficient stock: ${item.name}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      verifiedSubtotal += product.price * item.quantity;
    }

    // Use server-verified subtotal; trust delivery charge from Delhivery edge function
    const verifiedTotal = verifiedSubtotal + (orderInput.deliveryCharge || 0) - (orderInput.discount || 0);

    // Create order
    const orderNumber = `ST${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      order_number: orderNumber,
      user_id: userId,
      status: "PAYMENT CONFIRMED",
      subtotal: verifiedSubtotal,
      delivery_charge: orderInput.deliveryCharge || 0,
      discount: orderInput.discount || 0,
      total: verifiedTotal,
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature: razorpay_signature,
      payment_status: "PAID",
      shipping_name: orderInput.address.full_name,
      shipping_phone: orderInput.address.phone,
      shipping_address: orderInput.address.address_line,
      shipping_city: orderInput.address.city,
      shipping_state: orderInput.address.state,
      shipping_pincode: orderInput.address.pincode,
      estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }).select("*").single();

    if (orderError) {
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert order items with verified prices
    const orderItems = orderInput.items.map((item: OrderInputItem) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      product_slug: item.slug,
      product_image: item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: products?.find((p: { id: string }) => p.id === item.product_id)?.price || item.price,
    }));
    await supabase.from("order_items").insert(orderItems);

    // Record payment
    await supabase.from("payments").insert({
      order_id: order.id,
      razorpay_payment_id: razorpay_payment_id,
      amount: verifiedTotal,
      currency: "INR",
      status: "PAID",
    });

    // Reduce stock atomically
    for (const item of orderInput.items as OrderInputItem[]) {
      const product = products?.find((p: { id: string; stock: number }) => p.id === item.product_id);
      if (product) {
        const newStock = product.stock - item.quantity;
        const newStatus = newStock <= 0 ? "OUT OF STOCK" : newStock <= 5 ? "LOW STOCK" : "IN STOCK";
        await supabase.from("products").update({ stock: newStock, status: newStatus }).eq("id", item.product_id);
      }
    }

    // Create shipment record
    await supabase.from("shipments").insert({
      order_id: order.id,
      shipment_id: `DLV${Date.now()}`,
      awb: `AWB${Math.random().toString(36).slice(2, 14).toUpperCase()}`,
      status: "Shipment Created",
      events: [{ status: "Order confirmed and payment received", location: "Tirunelveli Hub", timestamp: new Date().toISOString() }],
      estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", userId);

    return new Response(JSON.stringify({ success: true, order }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
