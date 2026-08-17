import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Heart, ShoppingBag } from "lucide-react";
import SEO from "@/components/SEO";
import EmptyState from "@/components/EmptyState";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useAuth } from "@/features/auth/AuthContext";
import { formatINR } from "@/utils/format";

export default function Cart() {
  const { items, loading, updateQty, removeItem, moveToWishlist } = useCart();
  const { moveToCart } = useWishlist();
  const { user } = useAuth();
  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);

  if (!user) {
    return (
      <div className="pt-24">
        <EmptyState title="Please Sign In" message="You need to be signed in to view your cart." actionLabel="Sign In" actionTo="/login" />
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="pt-24">
        <SEO title="Cart" canonical="/cart" />
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Your Cart is Empty"
          message="Looks like you haven't added anything yet. Let's find something you'll love."
          actionLabel="Start Shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  return (
    <>
      <SEO title="Shopping Cart" canonical="/cart" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Shopping Bag</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">Your Cart</h1>
          </div>
        </div>
        <div className="container-edge py-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border border-line bg-bg-card p-4">
                  <Link to={`/product/${item.product?.slug}`} className="shrink-0">
                    <img src={item.product?.product_images?.[0]?.url} alt={item.product?.name} className="h-32 w-24 object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <Link to={`/product/${item.product?.slug}`} className="font-display text-base text-ink-primary hover:text-gold">{item.product?.name}</Link>
                      <button onClick={() => removeItem(item.id)} className="text-ink-secondary hover:text-red-400" aria-label="Remove"><Trash2 size={16} /></button>
                    </div>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gold">{formatINR(item.product?.price ?? 0)}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:text-gold" aria-label="Decrease"><Minus size={14} /></button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2.5 py-1.5 hover:text-gold" aria-label="Increase"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => item.product && moveToWishlist(item.id, item.product)} className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-gold">
                        <Heart size={14} /> Move to Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="h-fit border border-line bg-bg-card p-6">
              <h2 className="mb-5 font-display text-xl text-ink-primary">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-ink-secondary">Subtotal</span><span className="text-ink-primary">{formatINR(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Delivery</span><span className="text-ink-secondary">Calculated at checkout</span></div>
                <div className="gold-divider" />
                <div className="flex justify-between text-base"><span className="font-semibold text-ink-primary">Estimated Total</span><span className="font-semibold text-gold">{formatINR(subtotal)}</span></div>
              </div>
              <Link to="/checkout" className="btn-gold mt-6 w-full">Proceed to Checkout</Link>
              <Link to="/shop" className="mt-3 block text-center text-xs uppercase tracking-wider2 text-ink-secondary hover:text-gold">Continue Shopping</Link>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
