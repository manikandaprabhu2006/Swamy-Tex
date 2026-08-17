import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/features/auth/AuthContext";
import { fetchOrderById, fetchShipment } from "@/services/order.service";
import type { Order } from "@/types";
import { formatINR, formatDate, statusColor } from "@/utils/format";
import { Check, Truck, Package, Clock, MapPin, ArrowLeft } from "lucide-react";

const STATUS_STEPS = ["ORDER PLACED", "PAYMENT CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"];

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchOrderById(id), fetchShipment(id)])
      .then(([o, s]) => { setOrder(o); setShipment(s); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="pt-24"><div className="container-edge"><div className="skeleton h-64 w-full" /></div></div>;
  }
  if (!order) {
    return <div className="pt-24"><EmptyState title="Order Not Found" message="This order may not exist or you don't have access." actionLabel="My Orders" actionTo="/orders" /></div>;
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "RETURNED";

  return (
    <>
      <SEO title={`Order ${order.order_number}`} canonical={`/orders/${order.id}`} />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <Link to="/orders" className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider2 text-ink-secondary hover:text-gold"><ArrowLeft size={14} /> Back to Orders</Link>
            <p className="section-eyebrow mb-2">Order Details</p>
            <h1 className="font-display text-3xl font-light text-ink-primary lg:text-4xl">{order.order_number}</h1>
            <p className="mt-2 text-sm text-ink-secondary">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="container-edge py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Left: tracking + items */}
            <div className="space-y-8">
              {/* Tracking */}
              <section className="border border-line bg-bg-card p-6">
                <h2 className="mb-5 font-display text-xl text-ink-primary">Order Tracking</h2>
                {isCancelled ? (
                  <p className={`text-sm font-semibold ${statusColor(order.status)}`}>{order.status}</p>
                ) : (
                  <div className="space-y-1">
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${i <= currentStep ? "border-gold bg-gold text-bg-primary" : "border-line text-ink-secondary"}`}>
                          {i < currentStep ? <Check size={14} /> : i === currentStep ? <Clock size={14} /> : <span className="text-xs">{i + 1}</span>}
                        </div>
                        <span className={`text-sm ${i <= currentStep ? "text-ink-primary" : "text-ink-secondary"}`}>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
                {shipment && (
                  <div className="mt-6 border-t border-line pt-4 text-sm">
                    <p className="text-ink-secondary">AWB: <span className="text-ink-primary">{shipment.awb}</span></p>
                    <p className="text-ink-secondary">Courier: <span className="text-ink-primary">Delhivery</span></p>
                    {shipment.estimated_delivery && <p className="text-ink-secondary">Est. Delivery: <span className="text-gold">{formatDate(shipment.estimated_delivery)}</span></p>}
                    {shipment.events?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {shipment.events.map((ev: any, i: number) => (
                          <div key={i} className="flex gap-2 text-xs">
                            <Truck size={12} className="mt-0.5 text-gold" />
                            <div>
                              <p className="text-ink-primary">{ev.status}</p>
                              <p className="text-ink-secondary">{ev.location} · {new Date(ev.timestamp).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Items */}
              <section>
                <h2 className="mb-4 font-display text-xl text-ink-primary">Items in Order</h2>
                <div className="space-y-3">
                  {order.order_items?.map((it) => (
                    <div key={it.id} className="flex gap-4 border border-line bg-bg-card p-4">
                      {it.product_image && <img src={it.product_image} alt={it.product_name} className="h-20 w-16 object-cover" />}
                      <div className="flex-1">
                        {it.product_slug ? <Link to={`/product/${it.product_slug}`} className="text-sm text-ink-primary hover:text-gold">{it.product_name}</Link> : <p className="text-sm text-ink-primary">{it.product_name}</p>}
                        <p className="text-xs text-ink-secondary">{it.size && `Size: ${it.size}`} {it.color && `· ${it.color}`} · Qty: {it.quantity}</p>
                        <p className="mt-1 text-sm font-semibold text-gold">{formatINR(it.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: summary */}
            <aside className="h-fit border border-line bg-bg-card p-6">
              <h2 className="mb-5 font-display text-xl text-ink-primary">Payment Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ink-secondary">Subtotal</span><span className="text-ink-primary">{formatINR(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Delivery</span><span className="text-ink-primary">{formatINR(order.delivery_charge)}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Discount</span><span className="text-ink-secondary">-{formatINR(order.discount)}</span></div>
                <div className="gold-divider" />
                <div className="flex justify-between text-base"><span className="font-semibold text-ink-primary">Total Paid</span><span className="font-semibold text-gold">{formatINR(order.total)}</span></div>
                <p className="pt-2 text-xs text-ink-secondary">Payment: <span className="text-emerald-400">{order.payment_status}</span></p>
                {order.razorpay_payment_id && <p className="text-xs text-ink-secondary">Txn: {order.razorpay_payment_id}</p>}
              </div>

              <div className="mt-6 border-t border-line pt-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider2 text-gold"><MapPin size={14} /> Shipping Address</h3>
                <p className="text-sm text-ink-primary">{order.shipping_name}</p>
                <p className="text-sm text-ink-secondary">{order.shipping_address}</p>
                <p className="text-sm text-ink-secondary">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                <p className="mt-1 text-sm text-ink-secondary">Phone: {order.shipping_phone}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
