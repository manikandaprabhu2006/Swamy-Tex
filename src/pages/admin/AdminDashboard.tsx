import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, XCircle, Clock, Truck, CheckCircle } from "lucide-react";
import { formatINR, formatDate } from "@/utils/format";

interface Stats {
  totalOrders: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [orders, products, customers] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("products").select("*"),
        supabase.from("profiles").select("*").eq("role", "USER"),
      ]);

      const allOrders = orders.data || [];
      const allProducts = products.data || [];
      const totalSales = allOrders.filter((o) => o.payment_status === "PAID").reduce((s, o) => s + Number(o.total), 0);

      setStats({
        totalOrders: allOrders.length,
        totalSales,
        totalCustomers: customers.data?.length || 0,
        totalProducts: allProducts.length,
        lowStock: allProducts.filter((p) => p.status === "LOW STOCK").length,
        outOfStock: allProducts.filter((p) => p.status === "OUT OF STOCK").length,
        pending: allOrders.filter((o) => o.status === "ORDER PLACED" || o.status === "PAYMENT CONFIRMED").length,
        processing: allOrders.filter((o) => o.status === "PROCESSING" || o.status === "PACKED").length,
        shipped: allOrders.filter((o) => o.status === "SHIPPED" || o.status === "OUT FOR DELIVERY").length,
        delivered: allOrders.filter((o) => o.status === "DELIVERED").length,
      });

      setRecentOrders(allOrders.slice(0, 5));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="p-10"><div className="skeleton h-64 w-full" /></div>;
  }

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart },
    { label: "Total Sales", value: formatINR(stats?.totalSales ?? 0), icon: TrendingUp },
    { label: "Total Customers", value: stats?.totalCustomers ?? 0, icon: Users },
    { label: "Total Products", value: stats?.totalProducts ?? 0, icon: Package },
  ];

  const statusCards = [
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, color: "text-gold" },
    { label: "Processing", value: stats?.processing ?? 0, icon: Package, color: "text-gold-soft" },
    { label: "Shipped", value: stats?.shipped ?? 0, icon: Truck, color: "text-gold" },
    { label: "Delivered", value: stats?.delivered ?? 0, icon: CheckCircle, color: "text-emerald-400" },
    { label: "Low Stock", value: stats?.lowStock ?? 0, icon: AlertTriangle, color: "text-yellow-400" },
    { label: "Out of Stock", value: stats?.outOfStock ?? 0, icon: XCircle, color: "text-red-400" },
  ];

  return (
    <>
      <SEO title="Admin Dashboard" />
      <div className="p-6 lg:p-10">
        <h1 className="mb-8 font-display text-3xl font-light text-ink-primary">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="border border-line bg-bg-card p-6">
              <div className="flex items-center justify-between">
                <c.icon size={24} className="text-gold" />
                <span className="text-xs uppercase tracking-wider2 text-ink-secondary">{c.label}</span>
              </div>
              <p className="mt-4 font-display text-3xl text-ink-primary">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Status cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {statusCards.map((c) => (
            <div key={c.label} className="border border-line bg-bg-card p-4 text-center">
              <c.icon size={20} className={`mx-auto mb-2 ${c.color}`} />
              <p className="font-display text-2xl text-ink-primary">{c.value}</p>
              <p className="text-xs uppercase tracking-wider2 text-ink-secondary">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div className="mt-8 border border-line bg-bg-card p-6">
          <h2 className="mb-5 font-display text-xl text-ink-primary">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-ink-secondary">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wider2 text-ink-secondary">
                    <th className="pb-3 pr-4">Order</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Payment</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-line/50">
                      <td className="py-3 pr-4 text-ink-primary">{o.order_number}</td>
                      <td className="py-3 pr-4 text-ink-secondary">{formatDate(o.created_at)}</td>
                      <td className="py-3 pr-4 text-gold">{o.status}</td>
                      <td className="py-3 pr-4 text-ink-secondary">{o.payment_status}</td>
                      <td className="py-3 text-right font-semibold text-gold">{formatINR(Number(o.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
