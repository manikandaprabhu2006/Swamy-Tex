import { useState } from "react";
import { useToast } from "@/features/toast/ToastContext";
import { useReveal } from "@/hooks/useReveal";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { notify } = useToast();
  const ref = useReveal<HTMLDivElement>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    notify("Thank you for subscribing to SWAMY TEX!");
    setEmail("");
  };

  return (
    <section className="py-16 lg:py-24 bg-bg-secondary" ref={ref}>
      <div className="container-edge">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <Mail size={32} className="mx-auto mb-5 text-gold" />
          <p className="section-eyebrow mb-3">Stay Connected</p>
          <h2 className="font-display text-3xl font-light text-ink-primary sm:text-4xl">
            Join the Swamy Tex Circle
          </h2>
          <p className="mt-4 text-sm text-ink-secondary">
            Be the first to know about new arrivals, exclusive offers, and styling inspiration from Tirunelveli.
          </p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-luxe flex-1"
            />
            <button type="submit" className="btn-gold shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
