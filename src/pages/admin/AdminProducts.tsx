import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { formatINR } from "@/utils/format";
import type { Product } from "@/types";
import { useToast } from "@/features/toast/ToastContext";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*, category:categories(*)").order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await supabase.from("products").delete().eq("id", id);
    notify("Product deleted.", "info");
    load();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <SEO title="Manage Products" />
      <div className="p-6 lg:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-light text-ink-primary">Products</h1>
          <Link to="/admin/products/new" className="btn-gold"><Plus size={16} /> Add Product</Link>
        </div>

        <div className="mb-6 relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-luxe pl-10" />
        </div>

        {loading ? (
          <div className="skeleton h-64 w-full" />
        ) : (
          <div className="overflow-x-auto border border-line bg-bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider2 text-ink-secondary">
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-line/50 hover:bg-bg-secondary/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.product_images?.[0]?.url && <img src={p.product_images[0].url} alt={p.name} className="h-12 w-10 object-cover" />}
                        <span className="text-ink-primary">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-ink-secondary">{p.sku || "-"}</td>
                    <td className="p-4 text-gold">{formatINR(p.price)}</td>
                    <td className="p-4 text-ink-secondary">{p.stock}</td>
                    <td className="p-4">
                      <span className={p.status === "OUT OF STOCK" ? "text-red-400" : p.status === "LOW STOCK" ? "text-yellow-400" : "text-emerald-400"}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3">
                        <Link to={`/admin/products/${p.id}`} className="text-ink-secondary hover:text-gold" aria-label="Edit"><Pencil size={16} /></Link>
                        <button onClick={() => remove(p.id, p.name)} className="text-ink-secondary hover:text-red-400" aria-label="Delete"><Trash2 size={16} /></button>
                      </div>
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
