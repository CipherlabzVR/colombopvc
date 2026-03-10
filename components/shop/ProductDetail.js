"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatRs } from "@/components/shop/shopData";

export default function ProductDetail({ product }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  function handleAddToCart() {
    addToCart(product, qty);
    setQty(1);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-600 mb-4">
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link
            href={`/shop?category=${product.categorySlug}`}
            className="hover:underline"
          >
            {product.category}
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-800 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-h-[420px] object-contain"
              loading="lazy"
            />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center bg-[#FACC15]/20 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                {product.subcategory}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Product Code: <span className="font-medium text-slate-600">{product.productCode}</span>
            </p>

            <p className="text-slate-600 mt-2">
              <span className="font-medium text-slate-800">{product.category}</span>
              <span className="text-slate-400 mx-2">&bull;</span>
              <span>{product.subcategory}</span>
            </p>

            <p className="mt-5 text-3xl font-extrabold text-rose-600">
              {formatRs(product.price)}
            </p>

            {product.description && (
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-800 mb-1">Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                </button>
                <span className="w-14 h-11 flex items-center justify-center text-base font-semibold text-slate-800 border-x border-slate-300 bg-white">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-lg transition-all flex-1 sm:flex-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </button>
            </div>

            {/* Product details */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-800 mb-3">
                Product Details
              </p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <span className="text-slate-500">Brand/Type:</span>
                  <span className="font-medium text-slate-800">{product.subcategory}</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-800">{product.category}</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                  <span className="text-slate-500">Availability:</span>
                  <span className="font-medium text-emerald-600">In Stock</span>
                </li>
              </ul>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-lg py-3 px-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-emerald-600 mb-1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <p className="text-xs font-medium text-slate-700">Secure Order</p>
              </div>
              <div className="bg-slate-50 rounded-lg py-3 px-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-emerald-600 mb-1"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                <p className="text-xs font-medium text-slate-700">Fast Delivery</p>
              </div>
              <div className="bg-slate-50 rounded-lg py-3 px-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-emerald-600 mb-1"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <p className="text-xs font-medium text-slate-700">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
