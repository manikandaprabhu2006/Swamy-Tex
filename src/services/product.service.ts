import { supabase } from "@/lib/supabase";
import type { Category, Product } from "@/types";

export interface ProductQuery {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  brand?: string;
  availability?: "in" | "out" | "all";
  flags?: ("new" | "best" | "group" | "offer")[];
  sort?: "newest" | "price-asc" | "price-desc" | "popular" | "best";
  limit?: number;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function fetchProducts(q: ProductQuery = {}): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*, product_images(*), category:categories(*)")
    .eq("is_active", true);

  if (q.category) query = query.eq("category_id", q.category);
  if (q.subcategory) query = query.eq("subcategory", q.subcategory);
  if (q.search) {
    query = query.or(`name.ilike.%${q.search}%,sku.ilike.%${q.search}%,short_description.ilike.%${q.search}%`);
  }
  if (q.minPrice != null) query = query.gte("price", q.minPrice);
  if (q.maxPrice != null) query = query.lte("price", q.maxPrice);
  if (q.brand) query = query.eq("brand", q.brand);
  if (q.size) query = query.contains("sizes", [q.size]);
  if (q.color) query = query.contains("colors", [q.color]);
  if (q.availability === "in") query = query.neq("status", "OUT OF STOCK");
  if (q.availability === "out") query = query.eq("status", "OUT OF STOCK");
  if (q.flags?.includes("new")) query = query.eq("new_arrival", true);
  if (q.flags?.includes("best")) query = query.eq("best_seller", true);
  if (q.flags?.includes("group")) query = query.eq("group_shirt", true);
  if (q.flags?.includes("offer")) query = query.eq("offer", true);

  switch (q.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "popular":
      query = query.order("rating", { ascending: false });
      break;
    case "best":
      query = query.order("best_seller", { ascending: false }).order("review_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (q.limit) query = query.limit(q.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data as Product[]) || [];
}

export async function fetchProductsByFlag(flag: "new_arrival" | "best_seller" | "group_shirt" | "offer" | "featured", limit = 8): Promise<Product[]> {
  const key = flag;
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), category:categories(*)")
    .eq("is_active", true)
    .eq(key as string, true)
    .order("rating", { ascending: false })
    .limit(limit);
  return (data as Product[]) || [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*), category:categories(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Product) || null;
}

export async function fetchRelatedProducts(categoryId: string | null, excludeId: string, limit = 4): Promise<Product[]> {
  if (!categoryId) return [];
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), category:categories(*)")
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(limit);
  return (data as Product[]) || [];
}

export async function searchSuggestions(term: string, limit = 6): Promise<Product[]> {
  if (!term.trim()) return [];
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
    .limit(limit);
  return (data as Product[]) || [];
}
