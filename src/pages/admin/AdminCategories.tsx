import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";
import { Plus, Trash2 } from "lucide-react";
import type { Category } from "@/types";
import { slugify } from "@/utils/format";

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", image_url: "" });
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCats((data as Category[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const { error } = await supabase.from("categories").insert({
      name: form.name,
      slug: form.slug || slugify(form.name),
      image_url: form.image_url || null,
      sort_order: cats.length + 1,
    });
    if (error) { notify("Failed to add category.", "error"); return; }
    notify("Category added.");
    setForm({ name: "", slug: "", image_url: "" });
    setShowForm(false);
    load();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await supabase.from("categories").delete().eq("id", id);
    notify("Category deleted.", "info");
    load();
  };

  return (
    <>
      <SEO title="Manage Categories" />
      <div className="p-6 lg:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-light text-ink-primary">Categories</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold"><Plus size={16} /> Add Category</button>
        </div>

        {showForm && (
          <form onSubmit={add} className="mb-8 max-w-xl border border-gold/40 bg-bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label-luxe">Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="input-luxe" /></div>
              <div><label className="label-luxe">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-luxe" /></div>
              <div className="sm:col-span-2"><label className="label-luxe">Image URL</label><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-luxe" /></div>
            </div>
            <button type="submit" className="btn-gold mt-4">Save Category</button>
          </form>
        )}

        {loading ? (
          <div className="skeleton h-48 w-full" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => (
              <div key={c.id} className="flex items-center gap-4 border border-line bg-bg-card p-4">
                {c.image_url && <img src={c.image_url} alt={c.name} className="h-16 w-16 object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-primary">{c.name}</p>
                  <p className="text-xs text-ink-secondary">/{c.slug}</p>
                </div>
                <button onClick={() => remove(c.id, c.name)} className="text-ink-secondary hover:text-red-400" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
