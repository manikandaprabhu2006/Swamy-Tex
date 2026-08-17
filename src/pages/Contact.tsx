import { useState } from "react";
import SEO from "@/components/SEO";
import { useToast } from "@/features/toast/ToastContext";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const { notify } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      notify("Thank you for reaching out! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    }, 800);
  };

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with SWAMY TEX — premium fashion store in Tirunelveli, Tamil Nadu." canonical="/contact" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">We're Here to Help</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">Contact Us</h1>
          </div>
        </div>

        <div className="container-edge py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 font-display text-2xl text-ink-primary">Visit Our Store</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="mt-1 text-gold" />
                    <div>
                      <p className="text-sm text-ink-primary">SWAMY TEX</p>
                      <p className="text-sm text-ink-secondary">Tirunelveli, Tamil Nadu, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="mt-1 text-gold" />
                    <div>
                      <p className="text-sm text-ink-primary">Email</p>
                      <p className="text-sm text-ink-secondary">care@swamytex.in</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={20} className="mt-1 text-gold" />
                    <div>
                      <p className="text-sm text-ink-primary">Phone</p>
                      <p className="text-sm text-ink-secondary">+91 462 000 0000</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-line bg-bg-card p-6">
                <h3 className="mb-2 font-display text-lg text-gold">Customer Support</h3>
                <p className="text-sm text-ink-secondary">For order inquiries, returns, or product questions, reach out and our team will assist you within 24 hours.</p>
              </div>
            </div>

            {/* Form */}
            <div className="border border-line bg-bg-card p-8">
              <h2 className="mb-6 font-display text-2xl text-ink-primary">Send a Message</h2>
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="label-luxe">Your Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-luxe" />
                </div>
                <div>
                  <label className="label-luxe">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-luxe" />
                </div>
                <div>
                  <label className="label-luxe">Message</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-luxe resize-none" />
                </div>
                <button type="submit" disabled={sending} className="btn-gold w-full disabled:opacity-50">
                  {sending ? "Sending..." : <>Send Message <Send size={16} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
