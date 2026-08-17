import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/features/toast/ToastContext";
import type { Product, WishlistItem } from "@/types";

interface WishlistContextValue {
  items: WishlistItem[];
  loading: boolean;
  ids: Set<string>;
  toggle: (product: Product) => Promise<void>;
  has: (productId: string) => boolean;
  remove: (productId: string) => Promise<void>;
  moveToCart: (productId: string, product: Product) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue>({
  items: [],
  loading: false,
  ids: new Set(),
  toggle: async () => {},
  has: () => false,
  remove: async () => {},
  moveToCart: async () => {},
  refresh: async () => {},
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("wishlist_items")
      .select("*, product:products(*, product_images(*), category:categories(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as unknown as WishlistItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const ids = new Set(items.map((i) => i.product_id));

  const toggle: WishlistContextValue["toggle"] = async (product) => {
    if (!user) {
      notify("Please sign in to use your wishlist.", "info");
      return;
    }
    if (ids.has(product.id)) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", product.id);
      notify(`${product.name} removed from wishlist`, "info");
    } else {
      await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: product.id });
      notify(`${product.name} added to wishlist`);
    }
    await load();
  };

  const remove: WishlistContextValue["remove"] = async (productId) => {
    if (!user) return;
    await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
    await load();
  };

  const moveToCart: WishlistContextValue["moveToCart"] = async (_productId, product) => {
    if (!user) return;
    await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 });
    await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", product.id);
    notify(`${product.name} moved to cart`);
    await load();
  };

  return (
    <WishlistContext.Provider
      value={{ items, loading, ids, toggle, has: (id) => ids.has(id), remove, moveToCart, refresh: load }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
