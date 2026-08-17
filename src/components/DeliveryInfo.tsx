import { Truck, MapPin, Clock, Package } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

export default function DeliveryInfo() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="py-16 lg:py-24 bg-bg-secondary" ref={ref}>
      <div className="container-edge">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div data-reveal>
            <p className="section-eyebrow mb-3">Delivery & Shipping</p>
            <h2 className="font-display text-3xl font-light text-ink-primary sm:text-4xl lg:text-5xl">
              Delivered with Care, <br /> Tracked with Precision
            </h2>
            <p className="mt-6 max-w-md text-sm text-ink-secondary">
              We partner exclusively with Delhivery to bring your orders safely across India.
              Enter your PIN code at checkout to see real-time serviceability, delivery charges,
              and estimated delivery days — calculated dynamically based on your order.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 border border-line bg-bg-card px-5 py-3">
                <Truck size={18} className="text-gold" />
                <span className="text-xs uppercase tracking-wider2 text-ink-secondary">Delhivery Partner</span>
              </div>
              <div className="flex items-center gap-3 border border-line bg-bg-card px-5 py-3">
                <MapPin size={18} className="text-gold" />
                <span className="text-xs uppercase tracking-wider2 text-ink-secondary">Pan-India Coverage</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4" data-reveal>
            {[
              { icon: Package, title: "Order Placed", desc: "Your order is confirmed and prepared for dispatch." },
              { icon: Clock, title: "Dynamic Calculation", desc: "Delivery charges computed by weight, dimensions & PIN code." },
              { icon: Truck, title: "Shipped & Tracked", desc: "Receive an AWB number and track every step in real time." },
              { icon: MapPin, title: "Delivered", desc: "Arrives at your doorstep within the estimated window." },
            ].map((s, i) => (
              <div key={s.title} className="flex items-start gap-4 border border-line bg-bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/30 text-gold">
                  <s.icon size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gold">0{i + 1}</span>
                    <h3 className="font-display text-base text-ink-primary">{s.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
