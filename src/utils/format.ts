export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPercent(price: number, original?: number | null): number {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function orderNumber(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ST${y}${m}${day}${rand}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    "ORDER PLACED": "text-ink-secondary",
    "PAYMENT CONFIRMED": "text-gold",
    PROCESSING: "text-gold-soft",
    PACKED: "text-gold-soft",
    SHIPPED: "text-gold",
    "OUT FOR DELIVERY": "text-gold",
    DELIVERED: "text-emerald-400",
    CANCELLED: "text-red-400",
    RETURNED: "text-red-400",
  };
  return map[status] ?? "text-ink-secondary";
}
