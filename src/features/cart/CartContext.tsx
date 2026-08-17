import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthContext";
import { useToast } from "@/features/toast/ToastContext";
import type { CartItem, Product } from "@/types";

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  count: number;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateQty: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  moveToWishlist: (id: string, product: Product) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  loading: false,
  count: 0,
  addItem: async () => {},
  updateQty: async () => {},
  removeItem: async () => {},
  moveToWishlist: async () => {},
  clear: async () => {},
  refresh: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(*, product_images(*), category:categories(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as unknown as CartItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const addItem: CartContextValue["addItem"] = async (product, quantity = 1, size, color) => {
    if (!user) {
      notify("Please sign in to add items to your cart.", "info");
      return;
    }
    const existing = items.find((i) => i.product_id === product.id && i.size === size && i.color === color);
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: product.id, quantity, size, color });
    }
    notify(`${product.name} added to cart`);
    await load();
  };

  const updateQty: CartContextValue["updateQty"] = async (id, quantity) => {
    if (quantity < 1) return;
    await supabase.from("cart_items").update({ quantity }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const removeItem: CartContextValue["removeItem"] = async (id) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    notify("Item removed from cart", "info");
  };

  const moveToWishlist: CartContextValue["moveToWishlist"] = async (id, product) => {
    await supabase.from("wishlist_items").upsert({ user_id: user!.id, product_id: product.id });
    await supabase.from("cart_items").delete().eq("id", id);
    notify(`${product.name} moved to wishlist`);
    await load();
  };

  const clear: CartContextValue["clear"] = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        count: items.reduce((s, i) => s + i.quantity, 0),
        addItem,
        updateQty,
        removeItem,
        moveToWishlist,
        clear,
        refresh: load,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
