"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCategoryPromotions } from "@/context/CategoryPromotionContext";
import { formatRs } from "@/components/shop/shopData";
import {
  getCartLinePromoPricing,
  summarizeCartPromotions,
} from "@/lib/categoryPromotionPricing";

export default function CartPage() {
  const { items, totalItems, setQty, removeFromCart, clearCart } = useCart();
  const { rules, productRules, totalAmountRules } = useCategoryPromotions();
  const {
    gross: cartGross,
    net: cartNet,
    lineDiscount: cartLinePromo,
    orderDiscount: cartOrderPromo,
  } = summarizeCartPromotions(items, rules, productRules, totalAmountRules);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-600 mb-4">
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-800 font-medium">Cart</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Shopping Cart</h1>
            <p className="text-sm text-slate-500 mt-1">{totalItems} {totalItems === 1 ? "item" : "items"} in your cart</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-12 text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 mx-auto mb-4">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className="text-slate-700 font-semibold text-lg">Your cart is empty</p>
            <p className="text-slate-500 text-sm mt-1">Browse our products and add items to your cart.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center justify-center bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 font-semibold px-6 py-2.5 rounded-md transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Table header (desktop) */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_120px_120px_100px_40px] gap-4 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
                <span />
              </div>

              {items.map((item) => {
                const pr = getCartLinePromoPricing(item, rules, productRules);
                return (
                <div key={item.slug} className="bg-white border border-slate-200 rounded-lg p-4">
                  {/* Mobile layout */}
                  <div className="sm:hidden flex gap-3">
                    <div className="w-20 h-20 shrink-0 bg-slate-50 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.baseSlug ?? item.slug}`} className="text-sm font-medium text-slate-800 hover:text-emerald-700 line-clamp-2 transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{item.category} &bull; {item.subcategory}</p>
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
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-rose-600 mt-1 tabular-nums">{formatRs(item.price)}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="inline-flex items-center border border-slate-300 rounded-md overflow-hidden">
                          <button onClick={() => setQty(item.slug, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Decrease">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-slate-800 border-x border-slate-300 bg-white">{item.qty}</span>
                          <button onClick={() => setQty(item.slug, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Increase">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-900">
                            {pr.hasPromo ? (
                              <span className="inline-flex flex-col items-end">
                                <span className="text-xs text-slate-400 line-through font-medium tabular-nums">
                                  {formatRs(pr.lineGross)}
                                </span>
                                <span className="tabular-nums">{formatRs(pr.lineNet)}</span>
                              </span>
                            ) : (
                              <span className="tabular-nums">{formatRs(pr.lineGross)}</span>
                            )}
                          </span>
                          <button onClick={() => removeFromCart(item.slug)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" aria-label="Remove">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_120px_120px_100px_40px] gap-4 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 shrink-0 bg-slate-50 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/shop/${item.baseSlug ?? item.slug}`} className="text-sm font-medium text-slate-800 hover:text-emerald-700 line-clamp-1 transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">{item.category} &bull; {item.subcategory}</p>
                      </div>
                    </div>
                    {pr.hasPromo ? (
                      <div className="text-sm text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs text-slate-400 line-through tabular-nums">{formatRs(pr.unitList)}</span>
                          <span className="font-bold text-emerald-700 tabular-nums">{formatRs(pr.unitSale)}</span>
                          <span className="text-[10px] font-semibold uppercase text-emerald-600">Promo</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-rose-600 text-center block tabular-nums">
                        {formatRs(item.price)}
                      </span>
                    )}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center border border-slate-300 rounded-md overflow-hidden">
                        <button onClick={() => setQty(item.slug, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Decrease">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-slate-800 border-x border-slate-300 bg-white">{item.qty}</span>
                        <button onClick={() => setQty(item.slug, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Increase">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 text-right">
                      {pr.hasPromo ? (
                        <span className="inline-flex flex-col items-end">
                          <span className="text-xs text-slate-400 line-through font-medium tabular-nums">
                            {formatRs(pr.lineGross)}
                          </span>
                          <span className="tabular-nums">{formatRs(pr.lineNet)}</span>
                        </span>
                      ) : (
                        <span className="tabular-nums">{formatRs(pr.lineGross)}</span>
                      )}
                    </span>
                    <button onClick={() => removeFromCart(item.slug)} className="p-1 text-slate-400 hover:text-red-500 transition-colors justify-self-center" aria-label="Remove">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white border border-slate-200 rounded-lg p-5 lg:sticky lg:top-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  {(cartLinePromo > 0 || cartOrderPromo > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>Merchandise</span>
                      <span className="font-medium text-slate-800">{formatRs(cartGross)}</span>
                    </div>
                  )}
                  {cartLinePromo > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Item promotion savings</span>
                      <span className="font-semibold">−{formatRs(cartLinePromo)}</span>
                    </div>
                  )}
                  {cartOrderPromo > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>Total amount based discount</span>
                      <span className="font-semibold">−{formatRs(cartOrderPromo)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-slate-800">{formatRs(cartNet)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-medium text-emerald-600">Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold text-slate-900">{formatRs(cartNet)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold px-5 py-3 rounded-md transition-all text-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className="mt-2 w-full inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-md transition-colors text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
