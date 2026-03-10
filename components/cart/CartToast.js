"use client";

import { useCart } from "@/context/CartContext";

export default function CartToast() {
  const { toast } = useCart();

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] transition-all duration-300 ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2.5 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-lg shadow-xl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="line-clamp-1">{toast}</span>
      </div>
    </div>
  );
}
