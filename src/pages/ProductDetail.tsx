import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, ShoppingBag, Minus, Plus, Check, ChevronRight, Truck } from "lucide-react";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import EmptyState from "@/components/EmptyState";
import { fetchProductBySlug, fetchRelatedProducts } from "@/services/product.service";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/features/toast/ToastContext";
import type { Product } from "@/types";
import { formatINR, discountPercent } from "@/utils/format";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    fetchProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        if (p) {
          setSize(p.sizes[0] ?? undefined);
          setColor(p.colors[0] ?? undefined);
          fetchRelatedProducts(p.category_id, p.id, 4).then(setRelated);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-24">
        <div className="container-edge py-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="skeleton aspect-[3/4] w-full" />
            <div className="space-y-4"><div className="skeleton h-8 w-3/4" /><div className="skeleton h-4 w-1/2" /><div className="skeleton h-20 w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <EmptyState title="Product Not Found" message="This product may have been removed or is no longer available." actionLabel="Continue Shopping" actionTo="/shop" />;
  }

  const disc = discountPercent(product.price, product.original_price);
  const out = product.status === "OUT OF STOCK";
  const images = product.product_images ?? [];

  const requireLogin = () => {
    if (!user) {
      notify("Please sign in to purchase this product.", "info");
      navigate("/login", { state: { from: `/product/${product.slug}`, intent: "purchase" } });
      return false;
    }
    return true;
  };

  const handleAddCart = () => {
    if (!requireLogin()) return;
    addItem(product, qty, size, color);
  };

  const handleBuyNow = () => {
    if (!requireLogin()) return;
    addItem(product, qty, size, color);
    navigate("/checkout");
  };

  const checkPin = () => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryMsg("Please enter a valid 6-digit PIN code.");
      return;
    }
    setDeliveryLoading(true);
    setDeliveryMsg(null);
    setTimeout(() => {
      setDeliveryLoading(false);
      setDeliveryMsg(`✓ Delivery Available · Estimated: 3-5 days · Charge calculated at checkout`);
    }, 1200);
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.short_description || product.description || undefined}
        canonical={`/product/${product.slug}`}
        image={images[0]?.url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.short_description || product.description,
          sku: product.sku,
          brand: { "@type": "Brand", name: product.brand || "SWAMY TEX" },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "INR",
            availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          },
        }}
      />
      <div className="pt-20 lg:pt-24">
        {/* Breadcrumb */}
        <div className="container-edge py-4">
          <nav className="flex items-center gap-2 text-xs text-ink-secondary">
            <Link to="/" className="hover:text-gold">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-gold">Shop</Link>
            {product.category && (<><ChevronRight size={12} /><Link to={`/${product.category.slug}`} className="hover:text-gold">{product.category.name}</Link></>)}
            <ChevronRight size={12} />
            <span className="text-gold">{product.name}</span>
          </nav>
        </div>

        <div className="container-edge pb-16">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Gallery */}
            <div>
              <div className="relative aspect-[3/4] overflow-hidden border border-line bg-bg-card">
                {images[activeImg] && (
                  <img src={images[activeImg].url} alt={product.name} className="h-full w-full object-cover" />
                )}
                {disc > 0 && (
                  <span className="absolute left-4 top-4 bg-red-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider2 text-white">-{disc}%</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(i)}
                      className={`h-24 w-20 shrink-0 overflow-hidden border transition-all ${
                        i === activeImg ? "border-gold" : "border-line hover:border-gold/50"
                      }`}
                    >
                      <img src={img.url} alt={product.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {product.brand && <p className="section-eyebrow mb-2">{product.brand}</p>}
              <h1 className="font-display text-3xl font-light text-ink-primary lg:text-4xl">{product.name}</h1>
              {product.short_description && <p className="mt-2 text-sm text-ink-secondary">{product.short_description}</p>}

              <div className="mt-5 flex items-center gap-3">
                <span className="text-2xl font-semibold text-gold">{formatINR(product.price)}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-base text-ink-secondary line-through">{formatINR(product.original_price)}</span>
                )}
                {disc > 0 && <span className="text-sm font-semibold text-red-400">Save {disc}%</span>}
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1.5 ${out ? "text-red-400" : "text-emerald-400"}`}>
                  <span className={`h-2 w-2 rounded-full ${out ? "bg-red-400" : "bg-emerald-400"}`} />
                  {product.status}
                </span>
                {product.rating > 0 && <span className="text-ink-secondary">★ {product.rating} ({product.review_count} reviews)</span>}
              </div>

              {/* Sizes */}
              {product.sizes.length > 0 && (
                <div className="mt-6">
                  <p className="label-luxe">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`min-w-[3rem] border px-3 py-2.5 text-sm transition-all ${
                          size === s ? "border-gold bg-gold text-bg-primary" : "border-line text-ink-primary hover:border-gold"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mt-6">
                  <p className="label-luxe">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`border px-3 py-2 text-sm transition-all ${
                          color === c ? "border-gold bg-gold text-bg-primary" : "border-line text-ink-primary hover:border-gold"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6">
                <p className="label-luxe">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-line">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2.5 text-ink-primary hover:text-gold" aria-label="Decrease"><Minus size={16} /></button>
                    <span className="px-4 py-2.5 text-sm text-ink-primary">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2.5 text-ink-primary hover:text-gold" aria-label="Increase"><Plus size={16} /></button>
                  </div>
                  <span className="text-xs text-ink-secondary">{product.stock} in stock</span>
                </div>
              </div>

              {/* PIN check */}
              <div className="mt-6 border border-line bg-bg-card p-4">
                <p className="label-luxe flex items-center gap-2"><Truck size={14} /> Check Delivery</p>
                <div className="flex gap-2">
                  <input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit PIN code"
                    className="input-luxe flex-1"
                  />
                  <button onClick={checkPin} className="btn-ghost shrink-0" disabled={deliveryLoading}>
                    {deliveryLoading ? "Checking..." : "Check"}
                  </button>
                </div>
                {deliveryMsg && <p className="mt-3 text-xs text-emerald-400">{deliveryMsg}</p>}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={handleAddCart} disabled={out} className="btn-gold flex-1 disabled:cursor-not-allowed disabled:opacity-40">
                  <ShoppingBag size={16} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} disabled={out} className="btn-outline-gold flex-1 disabled:cursor-not-allowed disabled:opacity-40">
                  Buy Now
                </button>
                <button onClick={() => toggle(product)} className="flex h-12 w-12 items-center justify-center border border-line text-ink-primary hover:border-gold hover:text-gold" aria-label="Wishlist">
                  <Heart size={18} fill={has(product.id) ? "currentColor" : "none"} className={has(product.id) ? "text-gold" : ""} />
                </button>
              </div>

              {!user && <p className="mt-4 text-xs text-ink-secondary">Please <Link to="/login" className="text-gold underline">sign in</Link> to add items to your cart.</p>}

              {/* Details */}
              {product.description && (
                <div className="mt-8 border-t border-line pt-6">
                  <h3 className="mb-3 font-display text-lg text-ink-primary">Description</h3>
                  <p className="text-sm leading-relaxed text-ink-secondary">{product.description}</p>
                </div>
              )}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
                <Detail label="SKU" value={product.sku || "-"} />
                <Detail label="Brand" value={product.brand || "Swamy Tex"} />
                <Detail label="Weight" value={`${product.weight_grams}g`} />
                <Detail label="Dimensions" value={`${product.length_cm}×${product.width_cm}×${product.height_cm} cm`} />
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 font-display text-3xl font-light text-ink-primary">You May Also Like</h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider2 text-ink-secondary">{label}</p>
      <p className="mt-1 text-ink-primary">{value}</p>
    </div>
  );
}
