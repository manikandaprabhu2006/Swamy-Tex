import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useTheme } from "@/features/theme/ThemeContext";
import { searchSuggestions } from "@/services/product.service";
import type { Product } from "@/types";
import { formatINR } from "@/utils/format";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/men", label: "Men" },
  { to: "/women", label: "Women" },
  { to: "/kids", label: "Kids" },
  { to: "/group-shirts", label: "Group Shirts" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/offers", label: "Offers" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const { count } = useCart();
  const { items: wishItems } = useWishlist();
  const { user, profile } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let active = true;
    if (term.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      const r = await searchSuggestions(term, 6);
      if (active) setSuggestions(r);
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [term]);

  const solid = scrolled || !location.pathname.startsWith("/");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          scrolled ? "bg-bg-primary/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(201,162,39,0.15)]" : "bg-transparent"
        }`}
      >
        <div className="container-edge flex h-16 items-center justify-between gap-4 lg:h-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-ink-primary"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <Logo />
          </div>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  `text-xs font-semibold uppercase tracking-wider2 transition-colors duration-300 link-underline ${
                    isActive ? "text-gold" : "text-ink-primary/80 hover:text-gold"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            <button onClick={() => setSearchOpen(v => !v)} aria-label={searchOpen ? "Close search" : "Search"} className="text-ink-primary hover:text-gold transition-colors">
              <Search size={20} />
            </button>
            <button onClick={toggle} aria-label="Toggle theme" className="text-ink-primary hover:text-gold transition-colors">
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/wishlist" aria-label="Wishlist" className="relative text-ink-primary hover:text-gold transition-colors">
              <Heart size={20} />
              {wishItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center text-[9px] font-bold text-bg-primary bg-gold rounded-full">
                  {wishItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative text-ink-primary hover:text-gold transition-colors">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center text-[9px] font-bold text-bg-primary bg-gold rounded-full">
                  {count}
                </span>
              )}
            </Link>
            <Link to={user ? (profile?.role === "ADMIN" ? "/admin" : "/profile") : "/login"} aria-label="Account" className="text-ink-primary hover:text-gold transition-colors">
              <User size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[150] bg-bg-primary/98 backdrop-blur-md flex flex-col">
          <div className="container-edge pt-8">
            <div className="flex items-center justify-between">
              <span className="section-eyebrow">Search</span>
              <button onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={24} />
              </button>
            </div>
            <div className="mt-6 flex items-center gap-3 border-b border-line pb-4">
              <Search size={22} className="text-gold" />
              <input
                ref={searchRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && term.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(term)}`);
                    setSearchOpen(false);
                  }
                }}
                placeholder="Search for shirts, sarees, kurtis, veshti..."
                className="flex-1 bg-transparent text-2xl font-display text-ink-primary placeholder:text-ink-secondary/50 focus:outline-none"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="mt-4 grid gap-2">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-4 border border-line bg-bg-card p-3 hover:border-gold/50 transition-colors"
                  >
                    <img src={p.product_images?.[0]?.url} alt={p.name} className="h-16 w-16 object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-ink-primary">{p.name}</p>
                      <p className="text-xs text-gold">{formatINR(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[150] bg-bg-primary/98 backdrop-blur-md lg:hidden">
          <div className="container-edge pt-8">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-line py-4 font-display text-2xl transition-colors ${
                      isActive ? "text-gold" : "text-ink-primary"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
