import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE = "SWAMY TEX";
const BASE = "https://swamytex.in";

export default function SEO({ title, description, canonical, image, jsonLd }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE) ? title : `${title} · ${SITE}`;
    document.title = fullTitle;
    setMeta("description", description || "");
    setMeta("canonical", canonical ? `${BASE}${canonical}` : `${BASE}${window.location.pathname}`);
    setProp("og:title", fullTitle);
    setProp("og:description", description || "");
    setProp("og:url", canonical ? `${BASE}${canonical}` : `${BASE}${window.location.pathname}`);
    setProp("og:image", image || "");
    setProp("og:type", "website");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description || "");

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => {
      if (script) document.head.removeChild(script);
    };
  }, [title, description, canonical, image, jsonLd]);

  return null;
}

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setProp(prop: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
