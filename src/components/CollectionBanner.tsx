import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";

export default function CollectionBanner({
  title,
  subtitle,
  image,
  to,
  align = "left",
}: {
  title: string;
  subtitle: string;
  image: string;
  to: string;
  align?: "left" | "right";
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="py-8 lg:py-12" ref={ref}>
      <div className="container-edge">
        <Link
          to={to}
          data-reveal
          className="group relative block h-[60vh] min-h-[400px] overflow-hidden border border-line"
        >
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent ${
              align === "right" ? "text-right" : ""
            }`}
          />
          <div className={`absolute bottom-0 p-8 lg:p-12 ${align === "right" ? "right-0" : "left-0"}`}>
            <p className="section-eyebrow mb-2">{subtitle}</p>
            <h2 className="font-display text-3xl text-ivory transition-colors group-hover:text-gold sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <span className="mt-4 block text-xs uppercase tracking-luxe text-gold opacity-0 transition-opacity group-hover:opacity-100">
              Discover Collection →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
