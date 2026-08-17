import { Star, Quote } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const REVIEWS = [
  { name: "Priya S.", city: "Chennai", rating: 5, text: "The Banarasi silk saree exceeded my expectations. The zari work is exquisite and delivery was prompt. Swamy Tex is my go-to for festive wear." },
  { name: "Karthik R.", city: "Madurai", rating: 5, text: "Ordered the Royal Silk Sherwani for my wedding. Premium quality and perfect fit. The group shirts for my family were a hit too!" },
  { name: "Lakshmi D.", city: "Coimbatore", rating: 4, text: "Beautiful cotton kurtis at a fair price. The fabric is breathable and the prints are lovely. Will definitely order again." },
  { name: "Arun V.", city: "Tirunelveli", rating: 5, text: "Local store with international quality. The veshti and shirt combo is my daily wear now. Highly recommend Swamy Tex to everyone in Tirunelveli." },
];

export default function CustomerReviews() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="py-16 lg:py-24" ref={ref}>
      <div className="container-edge">
        <div className="mb-12 text-center" data-reveal>
          <p className="section-eyebrow mb-3">Loved by Customers</p>
          <h2 className="font-display text-3xl font-light text-ink-primary sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <div key={r.name} data-reveal className="border border-line bg-bg-card p-6 transition-all duration-500 hover:border-gold/40">
              <Quote size={28} className="mb-4 text-gold/40" />
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < r.rating ? "text-gold" : "text-ink-secondary/30"} fill={i < r.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="mb-5 text-sm text-ink-secondary leading-relaxed">{r.text}</p>
              <div>
                <p className="text-sm font-semibold text-ink-primary">{r.name}</p>
                <p className="text-xs text-ink-secondary">{r.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
