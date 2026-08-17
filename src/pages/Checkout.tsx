import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import EmptyState from "@/components/EmptyState";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/features/toast/ToastContext";
import { supabase, FUNCTIONS_URL } from "@/lib/supabase";
import { calculateDelivery, createRazorpayOrder, verifyRazorpayPayment, type CreateOrderInput } from "@/services/order.service";
import type { Address, DeliveryQuote } from "@/types";
import { formatINR } from "@/utils/format";
import { Check, Truck, Loader2, MapPin, Plus, Shield } from "lucide-react";

export default function Checkout() {
  const { items, clear } = useCart();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "" });
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const total = subtotal + (quote?.deliveryCharge || 0);

  useEffect(() => {
    if (!user) return;
    supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => {
        setAddresses((data as Address[]) || []);
        if (data && data.length > 0) setSelectedAddr(data[0].id);
        else setShowNewForm(true);
      });
  }, [user]);

  const currentAddr = addresses.find((a) => a.id === selectedAddr) || null;
  const pincode = currentAddr?.pincode || newAddr.pincode;

  useEffect(() => {
    if (!pincode || pincode.length !== 6 || items.length === 0) {
      setQuote(null);
      return;
    }
    setDeliveryLoading(true);
    const payload = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, weight: i.product?.weight_grams ?? 500 }));
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token || "";
      calculateDelivery(pincode, payload, token).then((q) => {
        setQuote(q);
        setDeliveryLoading(false);
      });
    });
  }, [pincode, items.length]);

  if (!user) {
    return <div className="pt-24"><EmptyState title="Please Sign In" message="You need to be signed in to checkout." actionLabel="Sign In" actionTo="/login" /></div>;
  }

  if (items.length === 0) {
    return <div className="pt-24"><EmptyState title="Your Cart is Empty" message="Add products to your cart before checking out." actionLabel="Shop Now" actionTo="/shop" /></div>;
  }

  const saveNewAddr = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await supabase.from("addresses").insert({ ...newAddr, user_id: user.id }).select("*").single();
    if (data) {
      const updated = [data as Address, ...addresses];
      setAddresses(updated);
      setSelectedAddr(data.id);
      setShowNewForm(false);
      setNewAddr({ full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "" });
      notify("Address saved.");
    }
  };

  const loadRazorpay = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById("razorpay-checkout")) return resolve();
      const script = document.createElement("script");
      script.id = "razorpay-checkout";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load payment gateway"));
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (!currentAddr && !showNewForm) {
      notify("Please select or add a delivery address.", "error");
      return;
    }
    if (showNewForm && !newAddr.pincode) {
      notify("Please complete your address first.", "error");
      return;
    }
    if (quote && !quote.serviceable) {
      notify("Delivery is not available for this PIN code.", "error");
      return;
    }

    setPaying(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token || "";
      const { orderId, keyId, demo } = await createRazorpayOrder(Math.round(total * 100), token);

      const orderInput: CreateOrderInput = {
        address: currentAddr || (newAddr as Address),
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          price: i.product?.price ?? 0,
          name: i.product?.name ?? "",
          slug: i.product?.slug ?? "",
          image: i.product?.product_images?.[0]?.url ?? null,
          weight: i.product?.weight_grams ?? 500,
        })),
        subtotal,
        deliveryCharge: quote?.deliveryCharge ?? 0,
        discount: 0,
        total,
      };

      if (demo) {
        // Demo mode: skip Razorpay checkout, verify directly
        const result = await verifyRazorpayPayment({
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: "demo",
          orderInput,
        }, token);
        if (result.success && result.order) {
          await clear();
          notify("Order placed successfully! (Demo mode)");
          navigate(`/orders/${result.order.id}`);
        } else {
          notify(result.error || "Payment failed.", "error");
        }
        setPaying(false);
        return;
      }

      await loadRazorpay();
      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "SWAMY TEX",
        description: "Premium Fashion Order",
        order_id: orderId,
        prefill: { email: user.email, name: currentAddr?.full_name || newAddr.full_name },
        theme: { color: "#C9A227" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const result = await verifyRazorpayPayment({
            ...response,
            orderInput,
          }, token);
          if (result.success && result.order) {
            await clear();
            notify("Order placed successfully!");
            navigate(`/orders/${result.order.id}`);
          } else {
            notify(result.error || "Payment verification failed.", "error");
          }
          setPaying(false);
        },
        modal: {
          ondismiss: () => { setPaying(false); notify("Payment cancelled.", "info"); },
        },
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      notify("Payment failed. Please try again.", "error");
    }
  };

  return (
    <>
      <SEO title="Checkout" canonical="/checkout" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Final Step</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">Checkout</h1>
          </div>
        </div>

        <div className="container-edge py-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            {/* Left: Address + Delivery */}
            <div className="space-y-8">
              {/* Addresses */}
              <section>
                <h2 className="mb-4 font-display text-xl text-ink-primary">Delivery Address</h2>
                {addresses.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAddr(a.id)}
                        className={`border p-4 text-left transition-all ${selectedAddr === a.id ? "border-gold bg-bg-card" : "border-line bg-bg-card hover:border-gold/50"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-ink-primary">{a.full_name}</span>
                          {selectedAddr === a.id && <Check size={16} className="text-gold" />}
                        </div>
                        <p className="mt-1 text-xs text-ink-secondary">{a.address_line}</p>
                        <p className="text-xs text-ink-secondary">{a.city}, {a.state} - {a.pincode}</p>
                        <p className="mt-1 text-xs text-ink-secondary">Phone: {a.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
                {!showNewForm && (
                  <button onClick={() => setShowNewForm(true)} className="mt-3 flex items-center gap-2 text-xs uppercase tracking-wider2 text-gold hover:text-gold-soft">
                    <Plus size={14} /> Add New Address
                  </button>
                )}
                {showNewForm && (
                  <form onSubmit={saveNewAddr} className="mt-4 border border-gold/40 bg-bg-card p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label className="label-luxe">Full Name</label><input required value={newAddr.full_name} onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })} className="input-luxe" /></div>
                      <div><label className="label-luxe">Phone</label><input required value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} className="input-luxe" /></div>
                      <div className="sm:col-span-2"><label className="label-luxe">Address</label><input required value={newAddr.address_line} onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })} className="input-luxe" /></div>
                      <div><label className="label-luxe">City</label><input required value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className="input-luxe" /></div>
                      <div><label className="label-luxe">State</label><input required value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className="input-luxe" /></div>
                      <div><label className="label-luxe">PIN Code</label><input required value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="input-luxe" /></div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button type="submit" className="btn-gold">Save Address</button>
                      {addresses.length > 0 && <button type="button" onClick={() => setShowNewForm(false)} className="btn-ghost">Cancel</button>}
                    </div>
                  </form>
                )}
              </section>

              {/* Delivery check */}
              {pincode && pincode.length === 6 && (
                <section className="border border-line bg-bg-card p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-primary"><Truck size={16} className="text-gold" /> Delivery Details</h3>
                  {deliveryLoading ? (
                    <p className="flex items-center gap-2 text-xs text-ink-secondary"><Loader2 size={14} className="animate-spin text-gold" /> Calculating delivery charge via Delhivery...</p>
                  ) : quote?.serviceable ? (
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-emerald-400"><Check size={16} /> Delivery Available</p>
                      <p className="text-ink-secondary">Courier: <span className="text-ink-primary">{quote.courier}</span></p>
                      <p className="text-ink-secondary">Estimated Delivery: <span className="text-ink-primary">{quote.estimatedDeliveryDays} days</span></p>
                      <p className="text-ink-secondary">Delivery Charge: <span className="text-gold font-semibold">{formatINR(quote.deliveryCharge)}</span></p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-400">✕ Delivery unavailable for PIN code {pincode}. Please try another address.</p>
                  )}
                </section>
              )}

              {/* Items review */}
              <section>
                <h2 className="mb-4 font-display text-xl text-ink-primary">Order Items</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 border border-line bg-bg-card p-3">
                      <img src={item.product?.product_images?.[0]?.url} alt={item.product?.name} className="h-20 w-16 object-cover" />
                      <div className="flex-1">
                        <p className="text-sm text-ink-primary">{item.product?.name}</p>
                        <p className="text-xs text-ink-secondary">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}</p>
                        <p className="mt-1 text-sm font-semibold text-gold">{formatINR(item.product?.price ?? 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Summary */}
            <aside className="h-fit border border-line bg-bg-card p-6">
              <h2 className="mb-5 font-display text-xl text-ink-primary">Payment Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ink-secondary">Product Subtotal</span><span className="text-ink-primary">{formatINR(subtotal)}</span></div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Delivery Charge</span>
                  {deliveryLoading ? <span className="text-ink-secondary">Calculating...</span> : quote?.serviceable ? <span className="text-ink-primary">{formatINR(quote.deliveryCharge)}</span> : <span className="text-ink-secondary">—</span>}
                </div>
                <div className="flex justify-between"><span className="text-ink-secondary">Discount</span><span className="text-ink-secondary">₹0</span></div>
                <div className="gold-divider" />
                <div className="flex justify-between text-base"><span className="font-semibold text-ink-primary">Final Payable</span><span className="font-semibold text-gold">{formatINR(total)}</span></div>
              </div>

              <button onClick={handlePay} disabled={paying || (quote !== null && !quote.serviceable)} className="btn-gold mt-6 w-full disabled:opacity-40 disabled:cursor-not-allowed">
                {paying ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Pay {formatINR(total)}</>}
              </button>

              <div className="mt-5 space-y-2 text-xs text-ink-secondary">
                <p className="flex items-center gap-2"><Shield size={12} className="text-gold" /> Secure payment via Razorpay</p>
                <p className="flex items-center gap-2"><Truck size={12} className="text-gold" /> Delivered by Delhivery</p>
                <p className="flex items-center gap-2"><MapPin size={12} className="text-gold" /> Dynamic delivery calculation</p>
              </div>
              <Link to="/cart" className="mt-4 block text-center text-xs uppercase tracking-wider2 text-ink-secondary hover:text-gold">Back to Cart</Link>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
