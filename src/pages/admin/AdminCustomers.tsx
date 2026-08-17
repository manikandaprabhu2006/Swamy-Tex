import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { formatINR, formatDate } from "@/utils/format";
import type { Profile, Order } from "@/types";

export default function AdminCustomers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "USER").order("created_at", { ascending: false }),
        supabase.from("orders").select("*"),
      ]);
      setProfiles((p as Profile[]) || []);
      setOrders((o as Order[]) || []);
      setLoading(false);
    })();
  }, []);

  const customerOrders = (uid: string) => orders.filter((o) => o.user_id === uid);
  const customerSpend = (uid: string) => customerOrders(uid).filter((o) => o.payment_status === "PAID").reduce((s, o) => s + Number(o.total), 0);

  return (
    <>
      <SEO title="Customers" />
      <div className="p-6 lg:p-10">
        <h1 className="mb-8 font-display text-3xl font-light text-ink-primary">Customers</h1>

        {loading ? (
          <div className="skeleton h-64 w-full" />
        ) : profiles.length === 0 ? (
          <p className="text-sm text-ink-secondary">No customers yet.</p>
        ) : (
          <div className="overflow-x-auto border border-line bg-bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider2 text-ink-secondary">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-line/50">
                    <td className="p-4 text-ink-primary">{p.full_name || "-"}</td>
                    <td className="p-4 text-ink-secondary">{p.email}</td>
                    <td className="p-4 text-ink-secondary">{p.phone || "-"}</td>
                    <td className="p-4 text-ink-secondary">{formatDate(p.created_at)}</td>
                    <td className="p-4 text-ink-secondary">{customerOrders(p.id).length}</td>
                    <td className="p-4 text-right font-semibold text-gold">{formatINR(customerSpend(p.id))}</td>
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
