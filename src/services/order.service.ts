import { supabase, FUNCTIONS_URL } from "@/lib/supabase";
import type { Address, DeliveryQuote, Order } from "@/types";
import { orderNumber } from "@/utils/format";

export interface CreateOrderInput {
  address: Address;
  items: Array<{
    product_id: string;
    quantity: number;
    size: string | null;
    color: string | null;
    price: number;
    name: string;
    slug: string;
    image: string | null;
    weight: number;
  }>;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
}

export async function calculateDelivery(
  pincode: string,
  items: Array<{ product_id: string; quantity: number; weight: number }>,
  token: string
): Promise<DeliveryQuote> {
  const res = await fetch(`${FUNCTIONS_URL}/delivery-calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ deliveryPincode: pincode, items }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      serviceable: false,
      deliveryCharge: 0,
      currency: "INR",
      estimatedDeliveryDays: 0,
      courier: "Delhivery",
      error: err.error || "Unable to calculate delivery.",
    };
  }
  return res.json();
}

export async function createRazorpayOrder(amount: number, token: string): Promise<{ orderId: string; amount: number; currency: string; keyId: string; demo?: boolean }> {
  const res = await fetch(`${FUNCTIONS_URL}/razorpay-create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error("Failed to create payment order");
  return res.json();
}

export async function verifyRazorpayPayment(
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; orderInput: CreateOrderInput },
  token: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const res = await fetch(`${FUNCTIONS_URL}/razorpay-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: data.error || "Payment verification failed" };
  return { success: true, order: data.order };
}

export async function placeOrder(input: CreateOrderInput, token: string): Promise<Order | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const oNum = orderNumber();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: oNum,
      user_id: userData.user.id,
      status: "ORDER PLACED",
      subtotal: input.subtotal,
      delivery_charge: input.deliveryCharge,
      discount: input.discount,
      total: input.total,
      payment_status: "PENDING",
      shipping_name: input.address.full_name,
      shipping_phone: input.address.phone,
      shipping_address: input.address.address_line,
      shipping_city: input.address.city,
      shipping_state: input.address.state,
      shipping_pincode: input.address.pincode,
    })
    .select("*")
    .single();
  if (error) throw error;

  const orderItems = input.items.map((it) => ({
    order_id: (order as Order).id,
    product_id: it.product_id,
    product_name: it.name,
    product_slug: it.slug,
    product_image: it.image,
    size: it.size,
    color: it.color,
    quantity: it.quantity,
    price: it.price,
  }));
  await supabase.from("order_items").insert(orderItems);

  return order as Order;
}

export { useAuth } from "@/features/auth/AuthContext";

export async function fetchUserOrders(): Promise<Order[]> {
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  return (data as Order[]) || [];
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();
  return (data as Order) || null;
}

export async function fetchOrderByNumber(num: string): Promise<Order | null> {
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", num)
    .maybeSingle();
  return (data as Order) || null;
}

export async function fetchShipment(orderId: string) {
  const { data } = await supabase.from("shipments").select("*").eq("order_id", orderId).maybeSingle();
  return data;
}
