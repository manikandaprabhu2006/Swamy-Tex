import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";
import { Mail, Lock, ArrowRight, LogIn, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from || "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (error) {
      notify("Sign in failed. Check your credentials or verify your account first.", "error");
      return;
    }
    notify("Welcome back to SWAMY TEX!");
    navigate(destination, { replace: true });
  };

  const google = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setLoading(false);
      notify(error.message, "error");
    }
  };

  return (
    <>
      <SEO title="Sign In" canonical="/login" />
      <div className="flex min-h-screen items-center justify-center px-5 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="border border-line bg-bg-card p-6 sm:p-8">
            <p className="section-eyebrow mb-2 text-center">Welcome Back</p>
            <h1 className="mb-2 text-center font-display text-3xl font-light text-ink-primary">Sign In</h1>
            <p className="mb-7 text-center text-xs text-ink-secondary">Login is only needed when you purchase or access your account.</p>

            <button onClick={google} disabled={loading} className="btn-ghost w-full disabled:opacity-50"><LogIn size={17}/> Continue with Google</button>
            <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-wider2 text-ink-secondary"><span className="h-px flex-1 bg-line"/><span>or email</span><span className="h-px flex-1 bg-line"/></div>

            <form onSubmit={submit} className="space-y-5">
              <div><label className="label-luxe">Email</label><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"/><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-luxe pl-10" placeholder="you@example.com"/></div></div>
              <div><label className="label-luxe">Password</label><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"/><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-luxe pl-10" placeholder="Your password"/></div></div>
              <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Signing in..." : "Sign In"} <ArrowRight size={16}/></button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs">
              <Link to="/forgot-password" className="text-ink-secondary hover:text-gold">Forgot password?</Link>
              <Link to="/signup" className="text-gold hover:text-gold-soft">Create account →</Link>
            </div>
            <div className="mt-6 flex gap-2 border-t border-line pt-5 text-[10px] text-ink-secondary"><ShieldCheck size={14} className="shrink-0 text-gold"/> Your password is never stored in plain text. Authentication is handled securely by Supabase.</div>
          </div>
        </div>
      </div>
    </>
  );
}
