import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGES = [
  "https://images.pexels.com/photos/1655843/pexels-photo-1655843.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "https://images.pexels.com/photos/13624148/pexels-photo-13624148.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "https://images.pexels.com/photos/31450180/pexels-photo-31450180.jpeg?auto=compress&cs=tinysrgb&w=1800",
];

const SEQUENCE = [
  {
    label: "SWAMY TEX",
    sub: "Premium Fashion · Tirunelveli",
    image: HERO_IMAGES[0],
  },
  {
    label: "WEAR YOUR STYLE.",
    sub: "Timeless Elegance · Modern Craft",
    image: HERO_IMAGES[1],
  },
  {
    label: "PREMIUM CLOTHING",
    sub: "Crafted for the discerning",
    image: HERO_IMAGES[2],
  },
  {
    label: "NEW COLLECTION",
    sub: "Discover the season's finest",
    image: HERO_IMAGES[0],
  },
  {
    label: "SHOP THE LOOK",
    sub: "Wear your story",
    image: HERO_IMAGES[1],
  },
];

export default function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);

  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      /* =========================================================
         INITIAL STATE
      ========================================================== */

      gsap.set(imageRefs.current, {
        scale: 1.12,
        opacity: 0,
      });

      gsap.set(imageRefs.current[0], {
        opacity: 1,
        scale: 1,
      });

      gsap.set(titleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(subRef.current, {
        opacity: 1,
        y: 0,
      });

      gsap.set(eyebrowRef.current, {
        opacity: 1,
        y: 0,
      });

      /* =========================================================
         HERO ENTRANCE
      ========================================================== */

      const intro = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      intro
        .fromTo(
          eyebrowRef.current,
          {
            opacity: 0,
            y: 25,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          }
        )
        .fromTo(
          titleRef.current,
          {
            opacity: 0,
            y: 80,
            scale: 0.92,
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.2,
          },
          "-=0.55"
        )
        .fromTo(
          subRef.current,
          {
            opacity: 0,
            y: 25,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          "-=0.65"
        )
        .fromTo(
          scrollRef.current,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
          },
          "-=0.3"
        );

      /* =========================================================
         CINEMATIC SCROLL
      ========================================================== */

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=350%",
        pin: true,
        scrub: 1.2,

        onUpdate: (self) => {
          const progress = self.progress;

          const index = Math.min(
            SEQUENCE.length - 1,
            Math.floor(progress * SEQUENCE.length)
          );

          setActiveIdx((previous) =>
            previous === index ? previous : index
          );

          /* =====================================================
             PROGRESS
          ====================================================== */

          if (progressRef.current) {
            gsap.set(progressRef.current, {
              width: `${progress * 100}%`,
            });
          }

          /* =====================================================
             BACKGROUND CINEMATIC TRANSITION
          ====================================================== */

          imageRefs.current.forEach((image, i) => {
            if (!image) return;

            gsap.to(image, {
              scale: i === index ? 1 : 1.12,
              opacity: i === index ? 1 : 0,
              duration: 0.8,
              ease: "power2.out",
              overwrite: "auto",
            });

            if (i === index) {
              gsap.to(image, {
                backgroundPosition: `${50 + progress * 8}% center`,
                duration: 1,
                overwrite: "auto",
              });
            }
          });

          /* =====================================================
             TEXT MOVEMENT
          ====================================================== */

          const textProgress = progress * 100;

          gsap.to(titleRef.current, {
            y: Math.sin(textProgress * 0.04) * 4,
            scale: 1 + progress * 0.025,
            duration: 0.4,
            overwrite: "auto",
          });

          gsap.to(subRef.current, {
            y: progress * -8,
            duration: 0.5,
            overwrite: "auto",
          });

          /* =====================================================
             CTA
          ====================================================== */

          gsap.to(ctaRef.current, {
            opacity: progress > 0.72 ? 1 : 0,
            y: progress > 0.72 ? 0 : 30,
            duration: 0.5,
            overwrite: "auto",
          });

          /* =====================================================
             SCROLL INDICATOR
          ====================================================== */

          gsap.to(scrollRef.current, {
            opacity: progress < 0.08 ? 1 : 0,
            duration: 0.3,
            overwrite: "auto",
          });
        },
      });

      /* =========================================================
         PARALLAX LIGHTS
      ========================================================== */

      gsap.to(".hero-orb-one", {
        yPercent: -30,
        xPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=350%",
          scrub: 2,
        },
      });

      gsap.to(".hero-orb-two", {
        yPercent: 25,
        xPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=350%",
          scrub: 2,
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const active = SEQUENCE[activeIdx];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-bg-primary"
    >
      {/* =========================================================
          BACKGROUND IMAGES
      ========================================================== */}

      <div className="absolute inset-0">
        {SEQUENCE.map((item, index) => (
          <div
            key={item.label}
            ref={(el) => {
              imageRefs.current[index] = el;
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("${item.image}")`,
              opacity: index === 0 ? 1 : 0,
            }}
          />
        ))}

        {/* Dark luxury overlay */}
        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/50" />

        {/* Cinematic grain */}
        <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
            }}
          />
        </div>
      </div>

      {/* =========================================================
          FLOATING LIGHTS
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="hero-orb-one absolute -left-32 top-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,.65), transparent 65%)",
          }}
        />

        <div
          className="hero-orb-two absolute -right-32 bottom-10 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,.5), transparent 65%)",
          }}
        />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">

        {/* =======================================================
            TOP META
        ======================================================== */}

        <div
          className="
            mb-7
            flex
            items-center
            justify-center
            gap-4
            sm:mb-9
            sm:gap-5
          "
        >
          <p
            ref={eyebrowRef}
            className="
              text-[9px]
              uppercase
              tracking-[0.3em]
              text-white/70
              sm:text-[11px]
              sm:tracking-[0.35em]
            "
          >
            Tirunelveli · Tamil Nadu · India
          </p>

          <span className="h-3 w-px bg-white/20 sm:h-4" />

          <p
            className="
              text-[9px]
              uppercase
              tracking-[0.25em]
              text-white/50
              sm:text-[11px]
              sm:tracking-[0.3em]
            "
          >
            Est. 2026
          </p>
        </div>

        {/* =======================================================
            SEQUENCE NUMBER
        ======================================================== */}

        <div className="mb-5 overflow-hidden">
          <span className="inline-block text-[10px] uppercase tracking-[0.45em] text-gold">
            {String(activeIdx + 1).padStart(2, "0")} /{" "}
            {String(SEQUENCE.length).padStart(2, "0")}
          </span>
        </div>

        {/* =======================================================
            TITLE
        ======================================================== */}

        <div className="overflow-hidden">
          <h1
            ref={titleRef}
            className="
              gold-shine
              max-w-6xl
              font-display
              text-5xl
              font-light
              leading-[0.95]
              tracking-wider2
              sm:text-7xl
              md:text-8xl
              lg:text-9xl
            "
          >
            {active.label}
          </h1>
        </div>

        {/* =======================================================
            SUBTITLE
        ======================================================== */}

        <p
          ref={subRef}
          className="
            mt-7
            max-w-xl
            text-xs
            uppercase
            tracking-[0.28em]
            text-white/65
            sm:text-sm
          "
        >
          {active.sub}
        </p>

        {/* =======================================================
            CTA
        ======================================================== */}

        <div
          ref={ctaRef}
          className="
            mt-10
            flex
            flex-col
            items-center
            gap-3
            opacity-0
            sm:flex-row
          "
        >
          <Link
            to="/men"
            className="
              group
              flex
              min-w-[150px]
              items-center
              justify-center
              gap-3
              bg-gold
              px-7
              py-3.5
              text-xs
              font-medium
              uppercase
              tracking-[0.2em]
              text-black
              transition-all
              duration-300
              hover:scale-105
            "
          >
            Shop Men

            <ArrowRight
              size={15}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>

          <Link
            to="/women"
            className="
              flex
              min-w-[150px]
              items-center
              justify-center
              border
              border-gold/60
              px-7
              py-3.5
              text-xs
              uppercase
              tracking-[0.2em]
              text-gold
              transition-all
              duration-300
              hover:bg-gold
              hover:text-black
            "
          >
            Shop Women
          </Link>

          <Link
            to="/shop"
            className="
              flex
              min-w-[150px]
              items-center
              justify-center
              px-7
              py-3.5
              text-xs
              uppercase
              tracking-[0.2em]
              text-white/80
              transition-all
              duration-300
              hover:text-gold
            "
          >
            Explore
          </Link>
        </div>
      </div>

      {/* =========================================================
          SCROLL INDICATOR
      ========================================================== */}

      <div
        ref={scrollRef}
        className="
          absolute
          bottom-10
          left-1/2
          z-20
          flex
          -translate-x-1/2
          flex-col
          items-center
          gap-3
        "
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-white/55">
          Scroll to explore
        </span>

        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-gold" />
        </div>

        <ChevronDown
          size={15}
          className="text-gold/80"
        />
      </div>

      {/* =========================================================
          SIDE PROGRESS
      ========================================================== */}

      <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
        {SEQUENCE.map((item, index) => (
          <div
            key={item.label}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-[9px] tracking-widest transition-all duration-500 ${
                index === activeIdx
                  ? "text-gold opacity-100"
                  : "text-white/30 opacity-0 group-hover:opacity-100"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                index === activeIdx
                  ? "w-8 bg-gold"
                  : "w-2 bg-white/30"
              }`}
            />
          </div>
        ))}
      </div>

      {/* =========================================================
          BOTTOM PROGRESS
      ========================================================== */}

      <div className="absolute bottom-0 left-0 z-30 h-px w-full bg-white/10">
        <div
          ref={progressRef}
          className="h-full bg-gold"
          style={{ width: "0%" }}
        />
      </div>
    </section>
  );
}