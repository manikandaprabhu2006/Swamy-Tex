import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Category } from "@/types";
import { fetchCategories } from "@/services/product.service";
import { useReveal } from "@/hooks/useReveal";

export default function FeaturedCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const ref = useReveal<HTMLDivElement>();

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => {});
  }, []);

  const featured = cats.slice(0, 6);

  return (
    <section className="py-16 lg:py-24 bg-bg-secondary" ref={ref}>
      <div className="container-edge">
        <div className="mb-10 text-center" data-reveal>
          <p className="section-eyebrow mb-3">Curated</p>
          <h2 className="font-display text-3xl font-light text-ink-primary sm:text-4xl lg:text-5xl">
            Featured Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {featured.map((c) => (
            <Link
              key={c.id}
              to={`/${c.slug}`}
              data-reveal
              className="group relative aspect-[4/5] overflow-hidden border border-line bg-bg-card transition-all duration-500 hover:border-gold/50"
            >
              {c.image_url && (
                <img
                  src={c.image_url}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-xl text-ivory transition-colors group-hover:text-gold lg:text-2xl">
                  {c.name}
                </h3>
                <span className="mt-1 block text-[10px] uppercase tracking-luxe text-ink-secondary group-hover:text-gold">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
