import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import type { Category } from "@/types";
import { slugify } from "@/utils/format";

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const isNew = !id || id === "new";
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    category_id: "",
    subcategory: "",
    brand: "Swamy Tex",
    description: "",
    short_description: "",
    price: "",
    original_price: "",
    weight_grams: "500",
    sizes: "",
    colors: "",
    stock: "0",
    status: "IN STOCK",
    featured: false,
    new_arrival: false,
    best_seller: false,
    group_shirt: false,
    offer: false,
  });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    if (!isNew) loadProduct();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    return (data as Category[]) || [];
  };

  const loadProduct = async () => {
    const { data } = await supabase.from("products").select("*, product_images(*)").eq("id", id).maybeSingle();
    if (data) {
      const p = data as any;
      setForm({
        name: p.name || "",
        slug: p.slug || "",
        sku: p.sku || "",
        category_id: p.category_id || "",
        subcategory: p.subcategory || "",
        brand: p.brand || "Swamy Tex",
        description: p.description || "",
        short_description: p.short_description || "",
        price: String(p.price || ""),
        original_price: String(p.original_price || ""),
        weight_grams: String(p.weight_grams || "500"),
        sizes: (p.sizes || []).join(", "),
        colors: (p.colors || []).join(", "),
        stock: String(p.stock || "0"),
        status: p.status || "IN STOCK",
        featured: p.featured || false,
        new_arrival: p.new_arrival || false,
        best_seller: p.best_seller || false,
        group_shirt: p.group_shirt || false,
        offer: p.offer || false,
      });
      setImageUrls((p.product_images || []).sort((a: any, b: any) => a.position - b.position).map((img: any) => img.url));
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      notify("Name and price are required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      sku: form.sku || null,
      category_id: form.category_id || null,
      subcategory: form.subcategory || null,
      brand: form.brand || "Swamy Tex",
      description: form.description || null,
      short_description: form.short_description || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      weight_grams: Number(form.weight_grams) || 500,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      status: form.status,
      featured: form.featured,
      new_arrival: form.new_arrival,
      best_seller: form.best_seller,
      group_shirt: form.group_shirt,
      offer: form.offer,
      is_active: true,
    };

    let productId = id;
    if (isNew) {
      const { data, error } = await supabase.from("products").insert(payload).select("*").single();
      if (error) { notify("Failed to create product.", "error"); setSaving(false); return; }
      productId = (data as any).id;
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) { notify("Failed to update product.", "error"); setSaving(false); return; }
    }

    // Update images
    await supabase.from("product_images").delete().eq("product_id", productId);
    if (imageUrls.length > 0) {
      const imgInserts = imageUrls.map((url, i) => ({ product_id: productId, url, alt: form.name, position: i, is_main: i === 0 }));
      await supabase.from("product_images").insert(imgInserts);
    }

    setSaving(false);
    notify(isNew ? "Product created!" : "Product updated!");
    navigate("/admin/products");
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  return (
    <>
      <SEO title={isNew ? "Add Product" : "Edit Product"} />
      <div className="p-6 lg:p-10">
        <button onClick={() => navigate("/admin/products")} className="mb-6 flex items-center gap-2 text-xs uppercase tracking-wider2 text-ink-secondary hover:text-gold">
          <ArrowLeft size={14} /> Back to Products
        </button>
        <h1 className="mb-8 font-display text-3xl font-light text-ink-primary">{isNew ? "Add Product" : "Edit Product"}</h1>

        <form onSubmit={save} className="max-w-3xl space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="input-luxe" /></Field>
            <Field label="Slug"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-luxe" /></Field>
            <Field label="SKU"><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input-luxe" /></Field>
            <Field label="Category">
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-luxe">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Subcategory"><input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="input-luxe" /></Field>
            <Field label="Brand"><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-luxe" /></Field>
            <Field label="Price (₹)"><input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-luxe" /></Field>
            <Field label="Original Price (₹)"><input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="input-luxe" /></Field>
            <Field label="Weight (grams)"><input type="number" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: e.target.value })} className="input-luxe" /></Field>
            <Field label="Stock"><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-luxe" /></Field>
            <Field label="Sizes (comma separated)"><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="input-luxe" /></Field>
            <Field label="Colors (comma separated)"><input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, White" className="input-luxe" /></Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-luxe">
                <option value="IN STOCK">In Stock</option>
                <option value="LOW STOCK">Low Stock</option>
                <option value="OUT OF STOCK">Out of Stock</option>
              </select>
            </Field>
          </div>

          <Field label="Short Description"><input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="input-luxe" /></Field>
          <Field label="Description"><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-luxe resize-none" /></Field>

          {/* Images */}
          <div>
            <label className="label-luxe">Product Images (URLs)</label>
            <div className="flex gap-2">
              <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." className="input-luxe flex-1" />
              <button type="button" onClick={addImage} className="btn-ghost shrink-0"><Plus size={16} /> Add</button>
            </div>
            {imageUrls.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt={`Image ${i + 1}`} className="h-24 w-20 object-cover border border-line" />
                    <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-red-500 text-white" aria-label="Remove image">
                      <X size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-gold py-0.5 text-center text-[8px] uppercase text-bg-primary">Main</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(["featured", "new_arrival", "best_seller", "group_shirt", "offer"] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 border border-line px-3 py-2.5 text-xs uppercase tracking-wider2 text-ink-secondary cursor-pointer hover:border-gold/50">
                <input type="checkbox" checked={form[f] as boolean} onChange={(e) => setForm({ ...form, [f]: e.target.checked })} className="accent-gold" />
                {f.replace("_", " ")}
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-gold disabled:opacity-50"><Save size={16} /> {saving ? "Saving..." : "Save Product"}</button>
        </form>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-luxe">{label}</label>
      {children}
    </div>
  );
}
