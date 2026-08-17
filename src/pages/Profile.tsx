import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/features/auth/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";
import { User, Package, MapPin, Heart, LogOut, Shield } from "lucide-react";

export default function Profile() {
  const { user, profile, isAdmin, refreshProfile } = useAuth();
  const { notify } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
  }, [profile]);

  if (!user) {
    return <div className="pt-24"><p className="text-center text-ink-secondary">Please sign in to view your profile.</p></div>;
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
    await refreshProfile();
    setSaving(false);
    notify("Profile updated.");
  };

  return (
    <>
      <SEO title="My Profile" canonical="/profile" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Account</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">My Profile</h1>
          </div>
        </div>
        <div className="container-edge py-10">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-2">
              <Link to="/profile" className="flex items-center gap-3 border border-gold bg-bg-card px-4 py-3 text-sm text-gold"><User size={16} /> Profile</Link>
              <Link to="/orders" className="flex items-center gap-3 border border-line bg-bg-card px-4 py-3 text-sm text-ink-secondary hover:text-gold"><Package size={16} /> Orders</Link>
              <Link to="/profile/addresses" className="flex items-center gap-3 border border-line bg-bg-card px-4 py-3 text-sm text-ink-secondary hover:text-gold"><MapPin size={16} /> Addresses</Link>
              <Link to="/wishlist" className="flex items-center gap-3 border border-line bg-bg-card px-4 py-3 text-sm text-ink-secondary hover:text-gold"><Heart size={16} /> Wishlist</Link>
              {isAdmin && <Link to="/admin" className="flex items-center gap-3 border border-gold/40 bg-bg-card px-4 py-3 text-sm text-gold"><Shield size={16} /> Admin Dashboard</Link>}
              <button onClick={() => supabase.auth.signOut()} className="flex w-full items-center gap-3 border border-line bg-bg-card px-4 py-3 text-sm text-red-400 hover:border-red-400/40">
                <LogOut size={16} /> Sign Out
              </button>
            </aside>

            {/* Form */}
            <div className="border border-line bg-bg-card p-6">
              <h2 className="mb-6 font-display text-xl text-ink-primary">Personal Information</h2>
              <form onSubmit={save} className="max-w-md space-y-5">
                <div>
                  <label className="label-luxe">Email</label>
                  <input type="email" value={user.email || ""} disabled className="input-luxe opacity-60" />
                </div>
                <div>
                  <label className="label-luxe">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-luxe" />
                </div>
                <div>
                  <label className="label-luxe">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-luxe" placeholder="10-digit mobile number" />
                </div>
                <button type="submit" disabled={saving} className="btn-gold disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
