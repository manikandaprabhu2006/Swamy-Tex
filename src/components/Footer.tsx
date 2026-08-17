import { Link } from "react-router-dom";
import Logo from "./Logo";

const SHOP_LINKS = [
  { to: "/men", label: "Men" },
  { to: "/women", label: "Women" },
  { to: "/kids", label: "Kids" },
  { to: "/group-shirts", label: "Group Shirts" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/offers", label: "Offers" },
];

const CARE_LINKS = [
  { to: "/contact", label: "Contact" },
  { to: "/shipping-policy", label: "Shipping" },
  { to: "/refund-policy", label: "Returns" },
  { to: "/privacy-policy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg-secondary">
      <div className="container-edge py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-ink-secondary">
              Premium fashion from Tirunelveli, Tamil Nadu. Traditional craftsmanship meets contemporary elegance.
            </p>
            <p className="text-xs text-ink-secondary/70">Tirunelveli, Tamil Nadu, India</p>
          </div>

          <div>
            <h3 className="section-eyebrow mb-5">Shop</h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ink-secondary hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="section-eyebrow mb-5">Customer Care</h3>
            <ul className="space-y-3">
              {CARE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-ink-secondary hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/track-order" className="text-sm text-ink-secondary hover:text-gold transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="section-eyebrow mb-5">About Swamy Tex</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-ink-secondary hover:text-gold transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-ink-secondary hover:text-gold transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
            <p className="mt-6 text-xs text-ink-secondary/70">
              Delivered across India via Delhivery. Secure payments by Razorpay.
            </p>
          </div>
        </div>

        <div className="gold-divider my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-ink-secondary/70">
            © {new Date().getFullYear()} SWAMY TEX. All rights reserved.
          </p>
          <p className="text-xs text-ink-secondary/70">
            Wear Your Style · Premium Fashion · Tirunelveli
          </p>
        </div>
      </div>
    </footer>
  );
}
