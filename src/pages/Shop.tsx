import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import EmptyState from "@/components/EmptyState";
import { fetchProducts, fetchCategories, type ProductQuery } from "@/services/product.service";
import type { Category, Product } from "@/types";
import { formatINR } from "@/utils/format";

const SIZES = ["S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "38", "Free Size", "2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"];
const COLORS = ["Black", "White", "Navy", "Maroon", "Red", "Blue", "Green", "Cream", "Grey", "Gold", "Sky Blue", "Pink", "Yellow", "Teal", "Olive", "Khaki", "Indigo", "Wine", "Coral", "Mustard", "Multi"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular" },
  { value: "best", label: "Best Selling" },
] as const;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = (params.get("sort") as ProductQuery["sort"]) || "newest";
  const minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : undefined;
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const size = params.get("size") || "";
  const color = params.get("color") || "";
  const availability = (params.get("availability") as "in" | "out" | "all") || "all";

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const q: ProductQuery = {
      search: search || undefined,
      category: category || undefined,
      sort,
      minPrice,
      maxPrice,
      size: size || undefined,
      color: color || undefined,
      availability: availability === "all" ? undefined : availability,
    };
    fetchProducts(q)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category, sort, minPrice, maxPrice, size, color, availability]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const activeFilterCount = useMemo(() => {
    return [category, size, color, minPrice, maxPrice, availability !== "all" ? availability : ""].filter(Boolean).length;
  }, [category, size, color, minPrice, maxPrice, availability]);

  return (
    <>
      <SEO title="Shop All" description="Browse the full SWAMY TEX collection — men's, women's, kids wear, group shirts and more." canonical="/shop" />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Collection</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">
              {search ? `Results for "${search}"` : "Shop All"}
            </h1>
          </div>
        </div>

        <div className="container-edge py-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-line px-4 py-2 text-xs uppercase tracking-wider2 text-ink-primary hover:border-gold hover:text-gold"
            >
              <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && <span className="text-gold">({activeFilterCount})</span>}
            </button>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="border border-line bg-bg-card px-4 py-2 text-xs uppercase tracking-wider2 text-ink-primary focus:border-gold focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Filters sidebar */}
            <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="space-y-8 border border-line bg-bg-card p-6">
                <div className="flex items-center justify-between lg:hidden">
                  <span className="text-xs uppercase tracking-wider2 text-gold">Filters</span>
                  <button onClick={() => setShowFilters(false)}><X size={18} /></button>
                </div>

                <FilterGroup title="Category">
                  <button onClick={() => setParam("category", "")} className={!category ? "text-gold" : "text-ink-secondary hover:text-gold"}>All</button>
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => setParam("category", c.id)} className={category === c.id ? "text-gold" : "text-ink-secondary hover:text-gold"}>
                      {c.name}
                    </button>
                  ))}
                </FilterGroup>

                <FilterGroup title="Price">
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={minPrice ?? ""} onChange={(e) => setParam("minPrice", e.target.value)} className="w-full bg-bg-secondary px-2 py-1.5 text-xs text-ink-primary focus:border-gold focus:outline-none border border-line" />
                    <span className="text-ink-secondary">—</span>
                    <input type="number" placeholder="Max" value={maxPrice ?? ""} onChange={(e) => setParam("maxPrice", e.target.value)} className="w-full bg-bg-secondary px-2 py-1.5 text-xs text-ink-primary focus:border-gold focus:outline-none border border-line" />
                  </div>
                </FilterGroup>

                <FilterGroup title="Size">
                  <div className="flex flex-wrap gap-1.5">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setParam("size", size === s ? "" : s)}
                        className={`border px-2.5 py-1.5 text-xs transition-colors ${
                          size === s ? "border-gold bg-gold text-bg-primary" : "border-line text-ink-secondary hover:border-gold hover:text-gold"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Color">
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setParam("color", color === c ? "" : c)}
                        className={`border px-2.5 py-1.5 text-xs transition-colors ${
                          color === c ? "border-gold bg-gold text-bg-primary" : "border-line text-ink-secondary hover:border-gold hover:text-gold"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Availability">
                  {(["all", "in", "out"] as const).map((a) => (
                    <button key={a} onClick={() => setParam("availability", a === "all" ? "" : a)} className={availability === a ? "text-gold" : "text-ink-secondary hover:text-gold"}>
                      {a === "all" ? "All" : a === "in" ? "In Stock" : "Out of Stock"}
                    </button>
                  ))}
                </FilterGroup>

                {activeFilterCount > 0 && (
                  <button onClick={() => setParams(new URLSearchParams())} className="text-xs uppercase tracking-wider2 text-red-400 hover:text-red-300">
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Products grid */}
            <div>
              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                  {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <EmptyState title="No Products Found" message="Try adjusting your filters or search terms to find what you're looking for." actionLabel="Browse All" actionTo="/shop" />
              ) : (
                <>
                  <p className="mb-4 text-xs text-ink-secondary">{products.length} products</p>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                    {products.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider2 text-gold">{title}</h3>
      <div className="flex flex-col gap-2 text-sm">{children}</div>
    </div>
  );
}
