import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, LogOut, Home } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: Tags },
];

export default function AdminLayout() {
  const { user, profile, isAdmin, loading } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-primary"><div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold" /></div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const logout = async () => {
    await supabase.auth.signOut();
    notify("Signed out.", "info");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg-primary lg:flex">
      {/* Sidebar */}
      <aside className="border-b border-line bg-bg-secondary lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-5 lg:block">
          <div className="font-display text-xl font-semibold tracking-wider2 text-ink-primary">
            SWAMY <span className="text-gold">TEX</span>
          </div>
          <span className="hidden lg:inline-block lg:mt-1 lg:text-[10px] lg:uppercase lg:tracking-luxe lg:text-gold">Admin Panel</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? "bg-gold/10 text-gold" : "text-ink-secondary hover:text-gold"}`
              }
            >
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
          <NavLink to="/" className="flex shrink-0 items-center gap-3 px-4 py-3 text-sm text-ink-secondary hover:text-gold">
            <Home size={18} /> View Store
          </NavLink>
          <button onClick={logout} className="flex w-full shrink-0 items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300">
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
