import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useCart } from "@/features/cart/CartContext";
import { formatINR, discountPercent } from "@/utils/format";
import { useAuth } from "@/features/auth/AuthContext";

export default function ProductCard({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const img = product.product_images?.[0]?.url;
  const img2 = product.product_images?.[1]?.url;
  const disc = discountPercent(product.price, product.original_price);
  const out = product.status === "OUT OF STOCK";

  return (
    <div className="card-product group">
      <div className="relative aspect-[3/4] overflow-hidden bg-bg-secondary">
        <Link to={`/product/${product.slug}`}>
          {img && (
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          {img2 && (
            <img
              src={img2}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.new_arrival && (
            <span className="bg-gold px-2 py-1 text-[9px] font-bold uppercase tracking-wider2 text-bg-primary">New</span>
          )}
          {product.best_seller && (
            <span className="border border-gold bg-bg-primary/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider2 text-gold backdrop-blur-sm">Bestseller</span>
          )}
          {disc > 0 && (
            <span className="bg-red-500/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider2 text-white">-{disc}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggle(product)}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-bg-primary/70 text-ink-primary backdrop-blur-sm transition-all hover:bg-gold hover:text-bg-primary"
        >
          <Heart size={16} fill={has(product.id) ? "currentColor" : "none"} className={has(product.id) ? "text-gold" : ""} />
        </button>

        {/* Add to cart reveal */}
        {!out && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            <button
              onClick={() => addItem(product, 1, product.sizes[0] ?? undefined, product.colors[0] ?? undefined)}
              className="flex w-full items-center justify-center gap-2 bg-gold py-3 text-xs font-semibold uppercase tracking-wider2 text-bg-primary transition-colors hover:bg-gold-soft"
            >
              <ShoppingBag size={14} /> Add to Cart
            </button>
          </div>
        )}

        {out && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50">
            <span className="border border-line bg-bg-primary/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider2 text-ink-secondary">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="truncate font-display text-base text-ink-primary transition-colors group-hover:text-gold">
            {product.name}
          </h3>
        </Link>
        {product.short_description && (
          <p className="mt-1 line-clamp-1 text-xs text-ink-secondary">{product.short_description}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-gold">{formatINR(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-ink-secondary line-through">{formatINR(product.original_price)}</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="mt-1 text-xs text-ink-secondary">
            {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))} ({product.review_count})
          </div>
        )}
      </div>
    </div>
  );
}
