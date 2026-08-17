import { useReveal } from "@/hooks/useReveal";
import { Link } from "react-router-dom";

export default function PremiumQuality() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="relative overflow-hidden py-20 lg:py-32" ref={ref}>
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/36656824/pexels-photo-36656824.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Premium fabric detail"
          loading="lazy"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-bg-primary/30" />
      </div>
      <div className="container-edge relative z-10">
        <div className="max-w-xl" data-reveal>
          <p className="section-eyebrow mb-3">Craftsmanship</p>
          <h2 className="font-display text-4xl font-light leading-tight text-ivory sm:text-5xl lg:text-6xl">
            Premium Quality, <br /> Woven into Every Thread
          </h2>
          <p className="mt-6 text-sm text-ink-secondary sm:text-base">
            From handloom cotton to silk zari, every fabric is chosen for its feel, durability, and drape.
            Our artisans in Tirunelveli bring decades of expertise to each garment — blending tradition
            with a modern silhouette that fits the way you live today.
          </p>
          <Link to="/about" className="btn-outline-gold mt-8">
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
