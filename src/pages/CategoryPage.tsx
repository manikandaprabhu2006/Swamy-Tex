import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import EmptyState from "@/components/EmptyState";
import { fetchProducts, fetchCategories, type ProductQuery } from "@/services/product.service";
import type { Category, Product } from "@/types";

interface CategoryPageProps {
  categorySlug?: string;
  flag?: "new" | "offer";
  title: string;
}

export default function CategoryPage({ categorySlug, flag, title }: CategoryPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<ProductQuery["sort"]>("newest");
  const [params] = useSearchParams();

  useEffect(() => {
    setLoading(true);
    const q: ProductQuery = { sort, limit: 24 };
    if (categorySlug) {
      fetchCategories().then((cats: Category[]) => {
        const cat = cats.find((c) => c.slug === categorySlug);
        if (cat) {
          fetchProducts({ ...q, category: cat.id })
            .then(setProducts)
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
    } else if (flag === "new") {
      fetchProducts({ ...q, flags: ["new"] }).then(setProducts).finally(() => setLoading(false));
    } else if (flag === "offer") {
      fetchProducts({ ...q, flags: ["offer"] }).then(setProducts).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [categorySlug, flag, sort]);

  const search = params.get("search");

  return (
    <>
      <SEO title={title} description={`${title} from SWAMY TEX — premium fashion from Tirunelveli.`} canonical={`/${categorySlug || flag}`} />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Collection</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">{title}</h1>
          </div>
        </div>
        <div className="container-edge py-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs text-ink-secondary">{loading ? "Loading..." : `${products.length} products`}</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductQuery["sort"])}
              className="border border-line bg-bg-card px-4 py-2 text-xs uppercase tracking-wider2 text-ink-primary focus:border-gold focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Popular</option>
              <option value="best">Best Selling</option>
            </select>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState title="No Products Yet" message="We're adding new styles to this collection. Check back soon." actionLabel="Browse All" actionTo="/shop" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
