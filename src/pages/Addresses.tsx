import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/features/toast/ToastContext";
import { Plus, Pencil, Trash2, MapPin, Check } from "lucide-react";
import type { Address } from "@/types";

export default function Addresses() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setAddresses((data as Address[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      await supabase.from("addresses").update(form).eq("id", editing.id);
      notify("Address updated.");
    } else {
      await supabase.from("addresses").insert({ ...form, user_id: user.id });
      notify("Address added.");
    }
    setShowForm(false);
    setEditing(null);
    setForm({ full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    notify("Address removed.", "info");
    load();
  };

  const edit = (a: Address) => {
    setEditing(a);
    setForm({ full_name: a.full_name, phone: a.phone, address_line: a.address_line, city: a.city, state: a.state, pincode: a.pincode });
    setShowForm(true);
  };

  return (
    <>
      <SEO title="My Addresses" canonical="/profile/addresses" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Account</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">Saved Addresses</h1>
          </div>
        </div>
        <div className="container-edge py-10">
          <div className="mb-6">
            <button onClick={() => { setEditing(null); setForm({ full_name: "", phone: "", address_line: "", city: "", state: "", pincode: "" }); setShowForm(true); }} className="btn-outline-gold">
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {showForm && (
            <form onSubmit={save} className="mb-8 max-w-2xl border border-gold/40 bg-bg-card p-6">
              <h2 className="mb-5 font-display text-lg text-ink-primary">{editing ? "Edit Address" : "New Address"}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label-luxe">Full Name</label><input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input-luxe" /></div>
                <div><label className="label-luxe">Phone</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-luxe" /></div>
                <div className="sm:col-span-2"><label className="label-luxe">Address</label><input required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className="input-luxe" /></div>
                <div><label className="label-luxe">City</label><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-luxe" /></div>
                <div><label className="label-luxe">State</label><input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-luxe" /></div>
                <div><label className="label-luxe">PIN Code</label><input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className="input-luxe" /></div>
              </div>
              <div className="mt-5 flex gap-3">
                <button type="submit" className="btn-gold">{editing ? "Update" : "Save Address"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          )}

          {addresses.length === 0 && !showForm ? (
            <div className="border border-line bg-bg-card p-12 text-center">
              <MapPin size={32} className="mx-auto mb-4 text-gold/60" />
              <p className="text-sm text-ink-secondary">No saved addresses yet. Add one to speed up checkout.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {addresses.map((a) => (
                <div key={a.id} className="border border-line bg-bg-card p-5">
                  <div className="flex justify-between">
                    <span className="text-xs uppercase tracking-wider2 text-gold">{a.label || "Address"}</span>
                    <div className="flex gap-2">
                      <button onClick={() => edit(a)} className="text-ink-secondary hover:text-gold" aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => remove(a.id)} className="text-ink-secondary hover:text-red-400" aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink-primary">{a.full_name}</p>
                  <p className="text-sm text-ink-secondary">{a.address_line}</p>
                  <p className="text-sm text-ink-secondary">{a.city}, {a.state} - {a.pincode}</p>
                  <p className="mt-1 text-sm text-ink-secondary">Phone: {a.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
