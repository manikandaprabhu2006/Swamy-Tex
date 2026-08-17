import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().finally(() => navigate("/", { replace: true }));
  }, [navigate]);
  return <div className="flex min-h-screen items-center justify-center"><div className="text-center"><div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold"/><p className="gold-gradient font-display text-xl">SWAMY TEX</p><p className="mt-2 text-xs text-ink-secondary">Completing secure sign in…</p></div></div>;
}
