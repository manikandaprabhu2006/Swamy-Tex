import SEO from "@/components/SEO";
import { useReveal } from "@/hooks/useReveal";
import { Link } from "react-router-dom";

export default function About() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <>
      <SEO title="About Swamy Tex" description="The story of SWAMY TEX — premium fashion from Tirunelveli, Tamil Nadu. Traditional craftsmanship meets contemporary elegance." canonical="/about" />
      <div className="pt-20 lg:pt-24" ref={ref}>
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[300px] overflow-hidden">
          <img
            src="https://images.pexels.com/photos/1655843/pexels-photo-1655843.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Swamy Tex fashion"
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
          <div className="container-edge absolute bottom-0 left-0 right-0 pb-10" data-reveal>
            <p className="section-eyebrow mb-3">Our Story</p>
            <h1 className="font-display text-4xl font-light text-ivory sm:text-5xl lg:text-6xl">Premium Fashion,<br />Rooted in Tirunelveli</h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24">
          <div className="container-edge max-w-3xl">
            <div className="space-y-6 text-sm leading-relaxed text-ink-secondary" data-reveal>
              <p>
                SWAMY TEX was born in the heart of Tirunelveli, Tamil Nadu — a city with a rich heritage of handloom weaving
                and textile craftsmanship. We set out to bridge the gap between traditional Indian attire and modern
                fashion sensibilities, creating pieces that honor our roots while fitting seamlessly into contemporary life.
              </p>
              <p>
                From handloom cotton veshtis to silk sherwanis, from everyday kurtis to festive sarees, every garment in our
                collection is selected for its fabric quality, drape, and durability. We work closely with local artisans
                who bring decades of expertise to each piece — blending time-honored techniques with a modern silhouette.
              </p>
              <p>
                Our mission is simple: to make premium fashion accessible. We believe luxury shouldn't be out of reach.
                That's why we offer affordable elegance — the same quality you'd expect from international brands, at
                a price that respects your budget. Every order is delivered across India via Delhivery, with secure
                payments powered by Razorpay.
              </p>
              <p>
                Whether you're dressing for a wedding, a festival, the office, or everyday life, SWAMY TEX has something
                for you. We invite you to explore our collections and discover the difference that thoughtful
                craftsmanship makes.
              </p>
            </div>

            {/* Values */}
            <div className="mt-12 grid gap-6 sm:grid-cols-3" data-reveal>
              {[
                { title: "Craftsmanship", desc: "Handpicked fabrics and expert tailoring in every garment." },
                { title: "Accessibility", desc: "Premium quality at prices that make luxury attainable." },
                { title: "Trust", desc: "Secure payments, reliable delivery, and honest service." },
              ].map((v) => (
                <div key={v.title} className="border border-line bg-bg-card p-6 text-center">
                  <h3 className="mb-2 font-display text-lg text-gold">{v.title}</h3>
                  <p className="text-xs text-ink-secondary">{v.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center" data-reveal>
              <Link to="/shop" className="btn-gold">Explore Our Collection</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
