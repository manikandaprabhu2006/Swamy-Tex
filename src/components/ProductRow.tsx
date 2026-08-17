import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { fetchProducts } from "@/services/product.service";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import SectionHeader from "@/components/SectionHeader";
import { useReveal } from "@/hooks/useReveal";

interface ProductRowProps {
  eyebrow?: string;
  title: string;
  link?: { to: string; label: string };
  query: Parameters<typeof fetchProducts>[0];
}

export default function ProductRow({ eyebrow, title, link, query }: ProductRowProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useReveal<HTMLDivElement>();

  useEffect(() => {
    fetchProducts({ ...query, limit: query?.limit ?? 8 })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [JSON.stringify(query)]);

  return (
    <section className="py-16 lg:py-24" ref={ref}>
      <div className="container-edge">
        <SectionHeader eyebrow={eyebrow} title={title} link={link} />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
