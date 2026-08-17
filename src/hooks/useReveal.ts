import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-reveal]"), {
        opacity: 0,
        y: 40,
        duration: 0.9,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
}
