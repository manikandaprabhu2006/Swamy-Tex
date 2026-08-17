import { Link } from "react-router-dom";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2 ${className}`} aria-label="SWAMY TEX home">
      <span className="font-display text-2xl font-semibold tracking-wider2 text-ink-primary">
        SWAMY <span className="gold-gradient">TEX</span>
      </span>
    </Link>
  );
}
