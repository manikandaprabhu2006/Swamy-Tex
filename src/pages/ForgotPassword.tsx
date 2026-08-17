import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { notify } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      notify(error.message, "error");
      return;
    }
    setSent(true);
    notify("Password reset link sent to your email.");
  };

  return (
    <>
      <SEO title="Forgot Password" canonical="/forgot-password" />
      <div className="flex min-h-screen items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="border border-line bg-bg-card p-8">
            <p className="section-eyebrow mb-2 text-center">Reset Password</p>
            <h1 className="mb-8 text-center font-display text-3xl font-light text-ink-primary">Forgot Password</h1>
            {sent ? (
              <div className="text-center">
                <p className="text-sm text-ink-secondary">We've sent a password reset link to <span className="text-gold">{email}</span>. Check your inbox.</p>
                <Link to="/login" className="btn-outline-gold mt-6">Back to Sign In</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="label-luxe">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxe pl-10" placeholder="you@example.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
                  {loading ? "Sending..." : "Send Reset Link"} <ArrowRight size={16} />
                </button>
              </form>
            )}
            <p className="mt-6 text-center text-xs">
              <Link to="/login" className="text-gold hover:text-gold-soft">Back to Sign In →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
