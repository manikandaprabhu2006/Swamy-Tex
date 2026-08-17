import { lazy, Suspense } from "react";
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
    <>
      <SEO
        title="SWAMY TEX — Premium Fashion · Tirunelveli"
        description="SWAMY TEX — premium clothing store in Tirunelveli, Tamil Nadu. Shop men's, women's, kids wear, group shirts, veshti, kurtis, sarees & more. Wear your style."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: "SWAMY TEX",
          description: "Premium clothing and fashion store in Tirunelveli, Tamil Nadu.",
          address: { "@type": "PostalAddress", addressLocality: "Tirunelveli", addressRegion: "Tamil Nadu", addressCountry: "IN" },
        }}
      />
      <CinematicHero />
      <FeaturedCategories />
      <ProductRow
        eyebrow="Just In"
        title="New Arrivals"
        link={{ to: "/new-arrivals", label: "View All" }}
        query={{ flags: ["new"], sort: "newest" }}
      />
      <ProductRow
        eyebrow="Coordinated"
        title="Group Shirts"
        link={{ to: "/group-shirts", label: "View All" }}
        query={{ flags: ["group"], sort: "best" }}
      />
      <ProductRow
        eyebrow="Most Loved"
        title="Best Sellers"
        link={{ to: "/shop?sort=best", label: "View All" }}
        query={{ flags: ["best"], sort: "best" }}
      />
      <CollectionBanner
        title="Men's Collection"
        subtitle="Refined Essentials"
        image="https://images.pexels.com/photos/13624148/pexels-photo-13624148.jpeg?auto=compress&cs=tinysrgb&w=1400"
        to="/men"
      />
      <CollectionBanner
        title="Women's Collection"
        subtitle="Timeless Grace"
        image="https://images.pexels.com/photos/31450180/pexels-photo-31450180.jpeg?auto=compress&cs=tinysrgb&w=1400"
        to="/women"
        align="right"
      />
      <CollectionBanner
        title="Kids Collection"
        subtitle="Little Style Icons"
        image="https://images.pexels.com/photos/30690921/pexels-photo-30690921.jpeg?auto=compress&cs=tinysrgb&w=1400"
        to="/kids"
      />
      <ProductRow
        eyebrow="Limited Time"
        title="Offers"
        link={{ to: "/offers", label: "View All" }}
        query={{ flags: ["offer"], sort: "best" }}
      />
      <PremiumQuality />
      <WhyChooseUs />
      <DeliveryInfo />
      <CustomerReviews />
      <Newsletter />
    </>
  );
}
