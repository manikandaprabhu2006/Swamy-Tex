import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useToast } from "@/features/toast/ToastContext";
import { fetchOrderByNumber } from "@/services/order.service";
import type { Order } from "@/types";
import { Search, Package, Truck, Check, Clock, MapPin } from "lucide-react";
import { formatINR, formatDate, statusColor } from "@/utils/format";

const STATUS_STEPS = ["ORDER PLACED", "PAYMENT CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"];

export default function TrackOrder() {
  const [orderNum, setOrderNum] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { notify } = useToast();

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNum.trim()) return;
    setLoading(true);
    setSearched(true);
    const o = await fetchOrderByNumber(orderNum.trim().toUpperCase());
    setOrder(o);
    setLoading(false);
    if (!o) notify("Order not found. Please check your order number.", "error");
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <>
      <SEO title="Track Your Order" description="Track your SWAMY TEX order with real-time Delhivery shipping updates." canonical="/track-order" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Order Status</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">Track Your Order</h1>
          </div>
        </div>
        <div className="container-edge py-10">
          <form onSubmit={track} className="mx-auto max-w-xl">
            <label className="label-luxe">Order Number</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
                <input
                  type="text"
                  value={orderNum}
                  onChange={(e) => setOrderNum(e.target.value)}
                  placeholder="e.g. ST250815AB12C"
                  className="input-luxe pl-10"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-gold shrink-0 disabled:opacity-50">
                {loading ? "Tracking..." : "Track"}
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-secondary">Enter your order number to see real-time shipping and delivery updates.</p>
          </form>

          {searched && !loading && order && (
            <div className="mx-auto mt-10 max-w-2xl border border-line bg-bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider2 text-ink-secondary">Order</p>
                  <p className="font-display text-lg text-ink-primary">{order.order_number}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${statusColor(order.status)}`}>{order.status}</p>
                  <p className="text-sm font-semibold text-gold">{formatINR(order.total)}</p>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${i <= currentStep ? "border-gold bg-gold text-bg-primary" : "border-line text-ink-secondary"}`}>
                      {i < currentStep ? <Check size={14} /> : i === currentStep ? <Clock size={14} /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <span className={`text-sm ${i <= currentStep ? "text-ink-primary" : "text-ink-secondary"}`}>{step}</span>
                  </div>
                ))}
              </div>

              {order.estimated_delivery && (
                <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-sm">
                  <Truck size={16} className="text-gold" />
                  <span className="text-ink-secondary">Estimated Delivery: <span className="text-gold">{formatDate(order.estimated_delivery)}</span></span>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-sm">
                <MapPin size={16} className="mt-0.5 text-gold" />
                <div>
                  <p className="text-ink-primary">{order.shipping_name}</p>
                  <p className="text-ink-secondary">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                </div>
              </div>

              <Link to={`/orders/${order.id}`} className="btn-outline-gold mt-6 w-full">View Full Order</Link>
            </div>
          )}

          {searched && !loading && !order && (
            <div className="mx-auto mt-10 max-w-xl border border-line bg-bg-card p-10 text-center">
              <Package size={40} className="mx-auto mb-4 text-gold/60" />
              <p className="text-sm text-ink-secondary">We couldn't find an order with that number. Please double-check and try again.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
