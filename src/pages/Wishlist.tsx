import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import SEO from "@/components/SEO";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useAuth } from "@/features/auth/AuthContext";

export default function Wishlist() {
  const { items, loading } = useWishlist();
  const { user } = useAuth();

  if (!user) {
    return <div className="pt-24"><EmptyState title="Please Sign In" message="You need to be signed in to view your wishlist." actionLabel="Sign In" actionTo="/login" /></div>;
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="pt-24">
        <SEO title="Wishlist" canonical="/wishlist" />
        <EmptyState icon={<Heart size={48} />} title="Your Wishlist is Empty" message="Save the pieces you love by tapping the heart icon on any product." actionLabel="Discover Products" actionTo="/shop" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Wishlist" canonical="/wishlist" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Saved For Later</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">Your Wishlist</h1>
          </div>
        </div>
        <div className="container-edge py-10">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {items.map((item) => item.product && <ProductCard key={item.id} product={item.product} />)}
          </div>
        </div>
      </div>
    </>
  );
}
