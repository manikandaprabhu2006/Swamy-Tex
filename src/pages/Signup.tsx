import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/features/toast/ToastContext";
import { User, Mail, Lock, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";

type Method = "email" | "phone";

export default function Signup() {
  const [method, setMethod] = useState<Method>("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();
  const navigate = useNavigate();

  const validPassword = password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPassword) {
      notify("Use 10+ characters with uppercase, lowercase and a number.", "error");
      return;
    }
    setLoading(true);
    const credentials = method === "email"
      ? { email: email.trim().toLowerCase(), password }
      : { phone: phone.replace(/\s/g, ""), password };

    const { data, error } = await supabase.auth.signUp({
      ...credentials,
      options: { data: { full_name: fullName.trim(), signup_method: method } },
    });
    setLoading(false);
    if (error) {
      notify(error.message, "error");
      return;
    }

    // Do not create a public profile until the OTP is verified.
    if (data.user) {
      if (data.session) await supabase.auth.signOut();
      setPending(true);
      notify(`Verification code sent to your ${method === "email" ? "email" : "mobile number"}.`);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      notify("Enter the 6-digit OTP.", "error");
      return;
    }
    setLoading(true);
    const result = method === "email"
      ? await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otp, type: "signup" })
      : await supabase.auth.verifyOtp({ phone: phone.replace(/\s/g, ""), token: otp, type: "sms" });
    if (result.error || !result.data.user) {
      setLoading(false);
      notify(result.error?.message || "Verification failed.", "error");
      return;
    }

    const user = result.data.user;
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? email.trim().toLowerCase(),
      full_name: fullName.trim(),
      phone: user.phone ?? phone.replace(/\s/g, ""),
      role: "USER",
    });
    setLoading(false);

    if (profileError) {
      notify("Account verified, but profile setup failed. Please contact support.", "error");
      return;
    }

    notify("Account verified successfully. Welcome to SWAMY TEX!");
    navigate("/");
  };

  return (
    <>
      <SEO title="Create Account" canonical="/signup" />
      <div className="flex min-h-screen items-center justify-center px-5 pt-24 pb-12">
        <div className="w-full max-w-md">
          <div className="border border-line bg-bg-card p-6 sm:p-8">
            <p className="section-eyebrow mb-2 text-center">Join SWAMY TEX</p>
            <h1 className="mb-2 text-center font-display text-3xl font-light text-ink-primary">Create Account</h1>
            <p className="mb-7 text-center text-xs text-ink-secondary">Verification is required before your customer profile is activated.</p>

            {!pending ? (
              <>
                <div className="mb-6 grid grid-cols-2 border border-line">
                  <button type="button" onClick={() => setMethod("email")} className={`py-3 text-xs uppercase tracking-wider2 ${method === "email" ? "bg-gold text-bg-primary" : "text-ink-secondary"}`}><Mail size={14} className="mr-2 inline"/> Email OTP</button>
                  <button type="button" onClick={() => setMethod("phone")} className={`py-3 text-xs uppercase tracking-wider2 ${method === "phone" ? "bg-gold text-bg-primary" : "text-ink-secondary"}`}><Smartphone size={14} className="mr-2 inline"/> Mobile OTP</button>
                </div>
                <form onSubmit={submit} className="space-y-5">
                  <div><label className="label-luxe">Full Name</label><div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"/><input required value={fullName} onChange={e => setFullName(e.target.value)} className="input-luxe pl-10" placeholder="Your name"/></div></div>
                  {method === "email" ? (
                    <div><label className="label-luxe">Email</label><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"/><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-luxe pl-10" placeholder="you@example.com"/></div></div>
                  ) : (
                    <div><label className="label-luxe">Mobile Number</label><div className="relative"><Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"/><input type="tel" required value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d+]/g, "").slice(0, 13))} className="input-luxe pl-10" placeholder="+91 9876543210"/></div></div>
                  )}
                  <div><label className="label-luxe">Password</label><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary"/><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-luxe pl-10" placeholder="10+ characters"/></div><p className="mt-2 text-[10px] text-ink-secondary">Use uppercase, lowercase and a number.</p></div>
                  <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Sending OTP..." : "Continue to Verification"} <ArrowRight size={16}/></button>
                </form>
              </>
            ) : (
              <form onSubmit={verify} className="space-y-5">
                <div className="border border-gold/30 bg-gold/5 p-4 text-center"><ShieldCheck className="mx-auto mb-2 text-gold"/><p className="text-sm text-ink-primary">Enter the 6-digit code sent to your {method === "email" ? email : phone}.</p></div>
                <div><label className="label-luxe">Verification OTP</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="input-luxe text-center text-xl tracking-[0.5em]" placeholder="000000"/></div>
                <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? "Verifying..." : "Verify & Create Account"} <ShieldCheck size={16}/></button>
                <button type="button" onClick={() => setPending(false)} className="btn-ghost w-full">Change Details</button>
              </form>
            )}

            <p className="mt-6 text-center text-xs"><Link to="/login" className="text-gold hover:text-gold-soft">Already have an account? Sign in →</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
