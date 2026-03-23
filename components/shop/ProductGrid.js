"use client";

import { formatRs, getPreferredInStockOffer, productToCartLine } from "@/components/shop/shopData";
import { useCart } from "@/context/CartContext";
import { OutOfStockOverlay } from "@/components/shop/OutOfStockOverlay";

export default function ProductGrid({ products, onProductClick }) {
  const { addToCart } = useCart();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => {
        const offer = getPreferredInStockOffer(product);
        return (
        <div
          key={product.slug}
          className="bg-white border border-slate-200 rounded-md overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
        >
          <div
            className="block"
            onClick={() => onProductClick?.(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onProductClick?.(product); }}
          >
            <div className="relative bg-white">
              <img
                src={offer.image || product.image}
                alt={product.name}
                className={`w-full h-40 sm:h-44 md:h-48 object-contain p-4 bg-white group-hover:scale-[1.03] transition-transform duration-200 ${
                  offer.isEntirelyOutOfStock ? "opacity-55" : ""
                }`}
                loading="lazy"
              />
              {offer.isEntirelyOutOfStock && <OutOfStockOverlay label="Out of Stock" />}
              {product.badge && (
                <span className="absolute top-2 right-2 z-20 bg-[#FACC15] text-slate-900 text-[10px] font-extrabold px-2 py-1 rounded">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="px-3 sm:px-4 pt-3 pb-2">
              <p className="text-sm text-slate-800 font-medium line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </p>
            </div>
          </div>

          <div className="px-3 sm:px-4 pb-4 mt-auto flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-rose-600">
              {formatRs(offer.price)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const line = productToCartLine(product);
                if (!line) return;
                addToCart(line);
              }}
              disabled={offer.isEntirelyOutOfStock}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.96] text-white text-xs font-bold px-3 py-2 rounded-md transition-all min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
              aria-label={
                offer.isEntirelyOutOfStock
                  ? `${product.name} is out of stock`
                  : `Add ${product.name} to cart`
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="hidden sm:inline">{offer.isEntirelyOutOfStock ? "OOS" : "ADD"}</span>
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}
