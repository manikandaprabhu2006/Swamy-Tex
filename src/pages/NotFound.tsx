import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
      <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-12 text-center">
        <p className="font-display text-8xl font-light text-gold">404</p>
        <h1 className="mt-4 font-display text-3xl font-light text-ink-primary">Page Not Found</h1>
        <p className="mt-3 max-w-md text-sm text-ink-secondary">
          The page you're looking for may have been moved, deleted, or never existed. Let's get you back on track.
        </p>
        <Link to="/" className="btn-gold mt-8">Return Home</Link>
      </div>
    </>
  );
}
