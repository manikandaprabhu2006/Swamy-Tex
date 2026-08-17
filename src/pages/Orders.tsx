import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/features/auth/AuthContext";
import { fetchUserOrders } from "@/services/order.service";
import type { Order } from "@/types";
import { formatINR, formatDate, statusColor } from "@/utils/format";
import { Package, ChevronRight } from "lucide-react";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchUserOrders().then(setOrders).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <div className="pt-24"><EmptyState title="Please Sign In" message="Sign in to view your orders." actionLabel="Sign In" actionTo="/login" /></div>;
  }

  if (!loading && orders.length === 0) {
    return <div className="pt-24"><EmptyState icon={<Package size={48} />} title="No Orders Yet" message="When you place an order, it will appear here." actionLabel="Start Shopping" actionTo="/shop" /></div>;
  }

  return (
    <>
      <SEO title="My Orders" canonical="/orders" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Account</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">My Orders</h1>
          </div>
        </div>
        <div className="container-edge py-10">
          <div className="space-y-4">
            {orders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="block border border-line bg-bg-card p-5 transition-all hover:border-gold/50">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider2 text-ink-secondary">Order</p>
                    <p className="font-display text-lg text-ink-primary">{o.order_number}</p>
                    <p className="mt-1 text-xs text-ink-secondary">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${statusColor(o.status)}`}>{o.status}</p>
                    <p className="mt-1 text-lg font-semibold text-gold">{formatINR(o.total)}</p>
                  </div>
                  <ChevronRight size={20} className="text-ink-secondary" />
                </div>
                <div className="mt-3 flex gap-2">
                  {o.order_items?.slice(0, 4).map((it) => (
                    it.product_image && <img key={it.id} src={it.product_image} alt={it.product_name} className="h-14 w-12 object-cover border border-line" />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
