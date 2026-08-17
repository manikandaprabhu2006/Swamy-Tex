import { Link } from "react-router-dom";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  link?: { to: string; label: string };
  align?: "left" | "center";
}

export default function SectionHeader({ eyebrow, title, link, align = "left" }: SectionHeaderProps) {
  return (
    <div className={`mb-10 flex items-end justify-between gap-4 ${align === "center" ? "flex-col items-center text-center" : ""}`}>
      <div data-reveal>
        {eyebrow && <p className="section-eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-light text-ink-primary sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      {link && (
        <Link to={link.to} className="link-underline shrink-0 text-xs font-semibold uppercase tracking-wider2 text-gold" data-reveal>
          {link.label}
        </Link>
      )}
    </div>
  );
}
