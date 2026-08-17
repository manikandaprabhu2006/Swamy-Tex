import { createContext, useContext, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}
interface ToastContextValue {
  toasts: Toast[];
  notify: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: number) => void;
}
const ToastContext = createContext<ToastContextValue>({ toasts: [], notify: () => {}, dismiss: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const notify = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  };

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`cursor-pointer border px-5 py-3 text-sm backdrop-blur-md transition-all ${
              t.type === "success"
                ? "border-gold/40 bg-bg-card/90 text-gold"
                : t.type === "error"
                ? "border-red-500/40 bg-bg-card/90 text-red-400"
                : "border-line bg-bg-card/90 text-ink-primary"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
