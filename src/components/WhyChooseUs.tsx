import { Shield, Truck, Sparkles, Heart } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const FEATURES = [
  { icon: Shield, title: "Premium Quality", desc: "Handpicked fabrics and craftsmanship you can feel in every stitch." },
  { icon: Truck, title: "Pan-India Delivery", desc: "Reliable Delhivery shipping with real-time tracking to your doorstep." },
  { icon: Sparkles, title: "Curated Collections", desc: "Traditional and contemporary designs, thoughtfully selected for you." },
  { icon: Heart, title: "Made with Care", desc: "From Tirunelveli to your wardrobe — every piece tells a story." },
];

export default function WhyChooseUs() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="py-16 lg:py-24" ref={ref}>
      <div className="container-edge">
        <div className="mb-12 text-center" data-reveal>
          <p className="section-eyebrow mb-3">The Swamy Tex Promise</p>
          <h2 className="font-display text-3xl font-light text-ink-primary sm:text-4xl lg:text-5xl">
            Why Choose Swamy Tex
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              data-reveal
              className="border border-line bg-bg-card p-8 text-center transition-all duration-500 hover:border-gold/50"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-gold/30 text-gold">
                <f.icon size={24} />
              </div>
              <h3 className="mb-3 font-display text-lg text-ink-primary">{f.title}</h3>
              <p className="text-sm text-ink-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
