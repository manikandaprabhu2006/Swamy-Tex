import { useMemo, useState } from "react";
import { Bot, ChevronDown, Send, X, Sparkles } from "lucide-react";
import { fetchProducts } from "@/services/product.service";
import { formatINR } from "@/utils/format";
import type { Product } from "@/types";

type Message = { role: "user" | "assistant"; text: string };

const quick = ["Black shirt for a wedding", "Show new arrivals", "What is in stock?"];

function localAnswer(text: string, products: Product[]) {
  const q = text.toLowerCase();
  if (q.includes("new") || q.includes("arrival")) {
    return products.filter(p => p.new_arrival).slice(0, 3);
  }
  if (q.includes("group")) return products.filter(p => p.group_shirt).slice(0, 3);
  if (q.includes("best")) return products.filter(p => p.best_seller).slice(0, 3);
  if (q.includes("black")) return products.filter(p => p.colors?.some(c => c.toLowerCase().includes("black"))).slice(0, 3);
  return products.slice(0, 3);
}

export default function StyleAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Vanakkam! I'm SWAMY TEX AI. Tell me what you are looking for and I'll help you discover products and styles." }
  ]);
  const [suggested, setSuggested] = useState<Product[]>([]);

  const greeting = useMemo(() => "SWAMY STYLE ASSISTANT", []);

  const ask = async (value = input) => {
    const text = value.trim();
    if (!text || busy) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const products = await fetchProducts({ limit: 30, sort: "popular" });
      const matches = localAnswer(text, products);
      setSuggested(matches);
      const reply = matches.length
        ? `I found ${matches.length} options from the current catalog. Prices and availability below are live catalog values.`
        : "I couldn't find a matching item in the current catalog. Try a category such as shirts, group shirts, new arrivals, or best sellers.";
      setMessages(m => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "I'm having trouble reaching the catalog right now. Please try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[120]">
      {open && (
        <div className="mb-3 flex h-[min(600px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden border border-line bg-bg-primary shadow-2xl">
          <div className="flex items-center justify-between border-b border-line bg-bg-secondary px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50"><Sparkles size={17} className="text-gold" /></div>
              <div><p className="gold-gradient text-xs font-bold tracking-wider2">{greeting}</p><p className="text-[10px] text-ink-secondary">Catalog-aware fashion assistant</p></div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant"><X size={18}/></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[90%] p-3 text-sm ${m.role === "user" ? "ml-auto bg-gold text-bg-primary" : "border border-line bg-bg-card text-ink-primary"}`}>{m.text}</div>
            ))}
            {suggested.length > 0 && (
              <div className="grid gap-2">
                {suggested.map(p => (
                  <a key={p.id} href={`/product/${p.slug}`} className="flex gap-3 border border-line bg-bg-card p-2 hover:border-gold">
                    <img src={p.product_images?.[0]?.url} alt="" className="h-14 w-11 object-cover"/>
                    <span className="min-w-0"><span className="block truncate text-xs text-ink-primary">{p.name}</span><span className="text-xs text-gold">{formatINR(p.price)}</span></span>
                  </a>
                ))}
              </div>
            )}
            {busy && <div className="text-xs text-ink-secondary">SWAMY TEX AI is checking the catalog…</div>}
          </div>
          <div className="flex gap-2 overflow-x-auto border-t border-line p-3 no-scrollbar">
            {quick.map(q => <button key={q} onClick={() => ask(q)} className="shrink-0 border border-line px-3 py-2 text-[10px] uppercase tracking-wider2 hover:border-gold hover:text-gold">{q}</button>)}
          </div>
          <form onSubmit={e => { e.preventDefault(); ask(); }} className="flex border-t border-line p-3">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about styles or products…" className="input-luxe flex-1"/>
            <button disabled={busy} className="ml-2 flex w-12 items-center justify-center border border-gold text-gold disabled:opacity-50" aria-label="Send"><Send size={16}/></button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 border border-gold bg-bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-wider2 text-gold shadow-xl hover:bg-gold hover:text-bg-primary" aria-label="Open SWAMY TEX AI">
        <Bot size={18}/>{open ? <ChevronDown size={15}/> : "STYLE AI"}
      </button>
    </div>
  );
}
