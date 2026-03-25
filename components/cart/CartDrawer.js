"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCategoryPromotions } from "@/context/CategoryPromotionContext";
import { formatRs } from "@/components/shop/shopData";
import { getCartLinePromoPricing, summarizeCartPromotions } from "@/lib/categoryPromotionPricing";

export default function CartDrawer() {
  const router = useRouter();
  const { items, totalItems, setQty, removeFromCart, setCheckoutSelection, drawerOpen, closeDrawer } = useCart();
  const { rules, productRules } = useCategoryPromotions();
  const [selectedSlugs, setSelectedSlugs] = useState(() => new Set());

  // When drawer opens or items change, default to all selected
  useEffect(() => {
    if (items.length > 0) {
      setSelectedSlugs((prev) => {
        const next = new Set(prev);
        items.forEach((i) => next.add(i.slug));
        return next;
      });
    } else {
      setSelectedSlugs(new Set());
    }
  }, [drawerOpen, items.length]);

  const toggleSelect = (slug) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = () => setSelectedSlugs(new Set(items.map((i) => i.slug)));
  const deselectAll = () => setSelectedSlugs(new Set());

  const { selectedCount, selectedSubtotal, selectedDiscount } = useMemo(() => {
    let count = 0;
    const selectedItems = [];
    items.forEach((item) => {
      if (selectedSlugs.has(item.slug)) {
        count += item.qty;
        selectedItems.push(item);
      }
    });
    const { discount, net } = summarizeCartPromotions(selectedItems, rules, productRules);
    return {
      selectedCount: count,
      selectedSubtotal: net,
      selectedDiscount: discount,
    };
  }, [items, selectedSlugs, rules, productRules]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-60 bg-black/40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closeDrawer}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-70 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Your Cart
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-medium text-slate-500">({totalItems} items)</span>
              )}
            </h2>
            <button
              onClick={closeDrawer}
              className="p-2 -m-2 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close cart"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Deselect all
              </button>
              {selectedCount > 0 && (
                <span className="text-xs text-slate-500">{selectedCount} selected</span>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 mb-4">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-slate-600 font-medium">Your cart is empty</p>
              <p className="text-sm text-slate-400 mt-1">Browse our products and add items to your cart.</p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="mt-5 inline-flex items-center justify-center bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 font-semibold px-5 py-2.5 rounded-md transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const isSelected = selectedSlugs.has(item.slug);
                const pr = getCartLinePromoPricing(item, rules, productRules);
                return (
                <li key={item.slug} className={`flex gap-3 bg-slate-50 border rounded-lg p-3 ${isSelected ? "border-slate-200" : "border-slate-200 opacity-75"}`}>
                  <div className="flex items-start pt-0.5">
                    <span
                      role="checkbox"
                      tabIndex={0}
                      aria-label={isSelected ? `Deselect ${item.name}` : `Select ${item.name}`}
                      aria-checked={isSelected}
                      onClick={() => toggleSelect(item.slug)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSelect(item.slug); } }}
                      className="mt-1 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center cursor-pointer select-none transition-colors border-slate-300 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="w-20 h-20 shrink-0 bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.baseSlug ?? item.slug}`}
                      onClick={closeDrawer}
                      className="text-sm font-medium text-slate-800 hover:text-emerald-700 line-clamp-2 transition-colors"
                    >
                      {item.name}
                    </Link>
                    {pr.hasPromo ? (
                      <div className="mt-1">
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                          <span className="text-xs font-semibold text-slate-400 line-through tabular-nums">
                            {formatRs(pr.unitList)}
                          </span>
                          <span className="text-sm font-bold text-emerald-700 tabular-nums">
                            {formatRs(pr.unitSale)}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600/90">
                          Promo price
                        </span>
                        <p className="text-xs text-slate-600 mt-1 tabular-nums">
                          Line:{" "}
                          <span className="text-slate-400 line-through mr-1">{formatRs(pr.lineGross)}</span>
                          <span className="font-semibold text-slate-800">{formatRs(pr.lineNet)}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-rose-600 mt-1 tabular-nums">{formatRs(item.price)}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="inline-flex items-center border border-slate-300 rounded-md overflow-hidden">
                        <button
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="w-9 h-8 flex items-center justify-center text-sm font-semibold text-slate-800 border-x border-slate-300 bg-white">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.slug)}
                        className="ml-auto p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ); })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Subtotal{selectedCount < totalItems && selectedCount > 0 && ` (${selectedCount} selected)`}
              </span>
              <span className="text-lg font-bold text-slate-900">{formatRs(selectedSubtotal)}</span>
            </div>
            {selectedDiscount > 0 && (
              <p className="text-xs text-emerald-700 font-medium text-right">
                Includes {formatRs(selectedDiscount)} promotion savings
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-md text-sm transition-colors"
              >
                View Cart
              </Link>
              {selectedCount > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutSelection(Array.from(selectedSlugs));
                    closeDrawer();
                    router.push("/checkout");
                  }}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-md text-sm transition-colors"
                >
                  Checkout
                </button>
              ) : (
                <span className="inline-flex items-center justify-center bg-slate-200 text-slate-500 font-semibold px-4 py-2.5 rounded-md text-sm cursor-not-allowed">
                  Checkout
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
