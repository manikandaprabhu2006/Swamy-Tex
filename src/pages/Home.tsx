import SEO from "@/components/SEO";
import CinematicHero from "@/components/CinematicHero";
import FeaturedCategories from "@/components/FeaturedCategories";
import ProductRow from "@/components/ProductRow";
import CollectionBanner from "@/components/CollectionBanner";
import PremiumQuality from "@/components/PremiumQuality";
import WhyChooseUs from "@/components/WhyChooseUs";
import DeliveryInfo from "@/components/DeliveryInfo";
import CustomerReviews from "@/components/CustomerReviews";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden bg-bg-primary">
      {/* =====================================
          SEO
      ====================================== */}

      <SEO
        title="SWAMY TEX — Premium Fashion · Tirunelveli"
        description="SWAMY TEX — premium clothing store in Tirunelveli, Tamil Nadu. Shop men's, women's, kids wear, group shirts, veshti, kurtis, sarees & more. Wear your style."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: "SWAMY TEX",
          description:
            "Premium clothing and fashion store in Tirunelveli, Tamil Nadu.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Tirunelveli",
            addressRegion: "Tamil Nadu",
            addressCountry: "IN",
          },
        }}
      />

      {/* =====================================
          CINEMATIC HERO
      ====================================== */}

      <CinematicHero />

      {/* =====================================
          FEATURED CATEGORIES
      ====================================== */}

      <section className="relative z-10">
        <FeaturedCategories />
      </section>

      {/* =====================================
          NEW ARRIVALS
      ====================================== */}

      <section className="relative z-10">
        <ProductRow
          eyebrow="Just In"
          title="New Arrivals"
          link={{
            to: "/new-arrivals",
            label: "View All",
          }}
          query={{
            flags: ["new"],
            sort: "newest",
          }}
        />
      </section>

      {/* =====================================
          GROUP SHIRTS
      ====================================== */}

      <section className="relative z-10">
        <ProductRow
          eyebrow="Coordinated"
          title="Group Shirts"
          link={{
            to: "/group-shirts",
            label: "View All",
          }}
          query={{
            flags: ["group"],
            sort: "best",
          }}
        />
      </section>

      {/* =====================================
          BEST SELLERS
      ====================================== */}

      <section className="relative z-10">
        <ProductRow
          eyebrow="Most Loved"
          title="Best Sellers"
          link={{
            to: "/shop?sort=best",
            label: "View All",
          }}
          query={{
            flags: ["best"],
            sort: "best",
          }}
        />
      </section>

      {/* =====================================
          MEN'S COLLECTION
      ====================================== */}

      <section className="relative z-10">
        <CollectionBanner
          title="Men's Collection"
          subtitle="Refined Essentials"
          image="https://images.pexels.com/photos/13624148/pexels-photo-13624148.jpeg?auto=compress&cs=tinysrgb&w=1400"
          to="/men"
        />
      </section>

      {/* =====================================
          WOMEN'S COLLECTION
      ====================================== */}

      <section className="relative z-10">
        <CollectionBanner
          title="Women's Collection"
          subtitle="Timeless Grace"
          image="https://images.pexels.com/photos/31450180/pexels-photo-31450180.jpeg?auto=compress&cs=tinysrgb&w=1400"
          to="/women"
          align="right"
        />
      </section>

      {/* =====================================
          KIDS COLLECTION
      ====================================== */}

      <section className="relative z-10">
        <CollectionBanner
          title="Kids Collection"
          subtitle="Little Style Icons"
          image="https://images.pexels.com/photos/30690921/pexels-photo-30690921.jpeg?auto=compress&cs=tinysrgb&w=1400"
          to="/kids"
        />
      </section>

      {/* =====================================
          OFFERS
      ====================================== */}

      <section className="relative z-10">
        <ProductRow
          eyebrow="Limited Time"
          title="Offers"
          link={{
            to: "/offers",
            label: "View All",
          }}
          query={{
            flags: ["offer"],
            sort: "best",
          }}
        />
      </section>

      {/* =====================================
          PREMIUM QUALITY
      ====================================== */}

      <section className="relative z-10">
        <PremiumQuality />
      </section>

      {/* =====================================
          WHY CHOOSE US
      ====================================== */}

      <section className="relative z-10">
        <WhyChooseUs />
      </section>

      {/* =====================================
          DELIVERY INFORMATION
      ====================================== */}

      <section className="relative z-10">
        <DeliveryInfo />
      </section>

      {/* =====================================
          CUSTOMER REVIEWS
      ====================================== */}

      <section className="relative z-10">
        <CustomerReviews />
      </section>

      {/* =====================================
          NEWSLETTER
      ====================================== */}

      <section className="relative z-10">
        <Newsletter />
      </section>
    </main>
  );
}