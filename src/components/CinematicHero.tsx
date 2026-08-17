import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SOURCES = [
  { src: "https://cdn.coverr.co/videos/coverr-a-fashion-model-walking-on-a-runway-1080p.mp4", type: "video/mp4" },
];

const POSTER = "https://images.pexels.com/photos/1655843/pexels-photo-1655843.jpeg?auto=compress&cs=tinysrgb&w=1600";

const SEQUENCE = [
  { label: "SWAMY TEX", sub: "Premium Fashion · Tirunelveli", range: [0, 0.2] },
  { label: "WEAR YOUR STYLE.", sub: "Timeless Elegance, Modern Craft", range: [0.2, 0.4] },
  { label: "Premium Clothing", sub: "Handcrafted for the discerning", range: [0.4, 0.6] },
  { label: "New Collection", sub: "Discover the season's finest", range: [0.6, 0.8] },
  { label: "Shop the Look", sub: "Wear your story", range: [0.8, 1.01] },
];

export default function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          if (video.duration && !video.seeking) {
            video.currentTime = Math.min(p * video.duration, video.duration - 0.001);
          }
          const idx = SEQUENCE.findIndex((s) => p >= s.range[0] && p < s.range[1]);
          setActiveIdx(idx === -1 ? SEQUENCE.length - 1 : idx);

          gsap.to("[data-hero-title]", { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, overwrite: true });
          gsap.to("[data-hero-sub]", { opacity: 1, duration: 0.4, overwrite: true });
          gsap.to("[data-hero-cta]", { opacity: p > 0.78 ? 1 : 0, y: p > 0.78 ? 0 : 20, duration: 0.4, overwrite: true });
          gsap.to("[data-hero-scroll]", { opacity: p < 0.05 ? 1 : 0, duration: 0.3, overwrite: true });
        },
      });

      return () => st.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const active = SEQUENCE[activeIdx];

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-bg-primary">
      {/* Video / Poster */}
      <div className="absolute inset-0">
        {reducedMotion ? (
          <img src={POSTER} alt="SWAMY TEX premium fashion" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="auto"
            poster={POSTER}
            crossOrigin="anonymous"
          >
            {VIDEO_SOURCES.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/70 via-bg-primary/40 to-bg-primary/90" />
        <div className="absolute inset-0 bg-bg-primary/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p data-hero-eyebrow className="section-eyebrow mb-6 opacity-0" style={{ opacity: 1 }}>
          Tirunelveli · Tamil Nadu · India
        </p>

        <h1
          data-hero-title
          className="gold-shine font-display text-5xl font-light leading-none tracking-wider2 sm:text-7xl lg:text-8xl"
        >
          {active.label}
        </h1>

        <p data-hero-sub className="mt-6 text-sm uppercase tracking-luxe text-ink-secondary sm:text-base">
          {active.sub}
        </p>

        <div data-hero-cta className="mt-10 flex flex-col items-center gap-4 opacity-0 sm:flex-row sm:gap-5">
          <Link to="/men" className="btn-gold">
            Shop Men
          </Link>
          <Link to="/women" className="btn-outline-gold">
            Shop Women
          </Link>
          <Link to="/shop" className="btn-ghost">
            Explore Collection
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        data-hero-scroll
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-secondary"
      >
        <span className="text-[10px] uppercase tracking-luxe">Scroll to explore</span>
        <ChevronDown size={18} className="animate-bounce text-gold" />
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 z-10 h-px w-full bg-line">
        <div className="h-px w-0 bg-gold" id="hero-progress" />
      </div>
    </section>
  );
}
