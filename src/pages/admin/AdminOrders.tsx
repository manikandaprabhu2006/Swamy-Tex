import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";
import { formatINR, formatDate, statusColor } from "@/utils/format";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["ORDER PLACED", "PAYMENT CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    notify("Order status updated.");
  };

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <>
      <SEO title="Manage Orders" />
      <div className="p-6 lg:p-10">
        <h1 className="mb-8 font-display text-3xl font-light text-ink-primary">Orders</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setFilter("")} className={`border px-3 py-1.5 text-xs uppercase tracking-wider2 ${!filter ? "border-gold text-gold" : "border-line text-ink-secondary hover:text-gold"}`}>All</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`border px-3 py-1.5 text-xs uppercase tracking-wider2 ${filter === s ? "border-gold text-gold" : "border-line text-ink-secondary hover:text-gold"}`}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton h-64 w-full" />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-ink-secondary">No orders found.</p>
        ) : (
          <div className="overflow-x-auto border border-line bg-bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider2 text-ink-secondary">
                  <th className="p-4">Order</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-line/50">
                    <td className="p-4 text-ink-primary">{o.order_number}</td>
                    <td className="p-4 text-ink-secondary">{formatDate(o.created_at)}</td>
                    <td className="p-4 text-ink-secondary">{o.shipping_name}</td>
                    <td className="p-4 font-semibold text-gold">{formatINR(Number(o.total))}</td>
                    <td className="p-4 text-ink-secondary">{o.payment_status}</td>
                    <td className={`p-4 ${statusColor(o.status)}`}>{o.status}</td>
                    <td className="p-4">
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)} className="border border-line bg-bg-secondary px-2 py-1 text-xs text-ink-primary focus:border-gold focus:outline-none">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
