"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAllWebItems } from "@/lib/shopApi";
import { fetchCategoryDiscountRules, fetchProductDiscountRules } from "@/lib/promotionsApi";
import { computeBestCombinedLinePromotion, formatPromotionDiscountLabel } from "@/lib/categoryPromotionPricing";
import {
  mapApiItemToProduct,
  formatRs,
  getPreferredInStockOffer,
  effectiveUnitPriceForCartLine,
} from "@/components/shop/shopData";

const SKELETON_PLACEHOLDERS = 12;

function PromoBadge({ label }) {
  return (
    <span className="absolute top-3 left-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-md bg-linear-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md ring-1 ring-amber-400/30">
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
}

/**
 * All in-stock web items (paged catalog). Unit basis uses wholesale-at-qty-1 when applicable.
 * @returns {Promise<Array<{ product: object, image: string, lineGross: number, saleTotal: number, pct: number, hasLinePromo: boolean, discountLabel: string }>>}
 */
async function loadShowcaseItems() {
  const [categoryRules, productRules, { items: allRaw }] = await Promise.all([
    fetchCategoryDiscountRules(),
    fetchProductDiscountRules(),
    fetchAllWebItems(),
  ]);

  const enriched = [];

  for (const raw of allRaw || []) {
    const product = mapApiItemToProduct(raw);
    if (!product) continue;
    const offer = getPreferredInStockOffer(product);
    if (offer.isEntirelyOutOfStock) continue;

    const retailUnit = offer.price;
    if (!Number.isFinite(retailUnit) || retailUnit <= 0) continue;

    const basisUnit = effectiveUnitPriceForCartLine({
      ...product,
      price: retailUnit,
      qty: 1,
    });
    const lineGross = basisUnit;
    const row = computeBestCombinedLinePromotion(
      lineGross,
      1,
      product.categoryId,
      product.id,
      categoryRules,
      productRules,
    );
    const saleTotal = row.subTotal;
    const hasLinePromo = row.totalDiscount > 0 && saleTotal < lineGross - 0.005;
    const pct = lineGross > 0 ? Math.round((row.totalDiscount / lineGross) * 100) : 0;
    let discountLabel = "";
    if (hasLinePromo) {
      discountLabel =
        formatPromotionDiscountLabel(row.discountKind, row.ruleValue, row.totalDiscount) ||
        (pct >= 1 ? `${pct}% off` : `Save ${formatRs(row.totalDiscount)}`);
    }

    enriched.push({
      product: { ...product, image: offer.image || product.image },
      image: offer.image || product.image,
      lineGross,
      saleTotal,
      pct,
      hasLinePromo,
      discountLabel,
    });
  }

  return enriched;
}

export default function ShopByProduct() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadShowcaseItems()
      .then((list) => {
        if (!cancelled) setRows(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="shop-by-product" className="py-12 md:py-16 bg-white" aria-labelledby="product-heading">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2
          id="product-heading"
          className="text-2xl sm:text-3xl font-semibold text-[#0D1B3E] text-center mb-2 font-poppins"
        >
          All products
        </h2>
        <p className="text-slate-600 mb-8 sm:mb-10 font-poppins text-center text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Full catalog online — promotion prices and wholesale rates match cart and checkout.
        </p>

        {error && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm text-center">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-12 text-center">
            <p className="text-slate-600 text-sm font-poppins max-w-md mx-auto">
              No products are available to show right now. Try the shop or check back later.
            </p>
            <Link
              href="/shop"
              className="inline-flex mt-5 font-poppins font-semibold text-[#0D1B3E] hover:underline underline-offset-2"
            >
              Go to shop
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 font-poppins">
          {loading
            ? Array.from({ length: SKELETON_PLACEHOLDERS }, (_, i) => <SkeletonCard key={i} />)
            : rows.map(({ product, image, lineGross, saleTotal, hasLinePromo, discountLabel }) => {
                const badgeText = discountLabel || "Offer";
                return (
                <Link
                  key={product.id}
                  href={`/shop?item=${product.id}`}
                  className="group flex flex-col bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-amber-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.99] transition-all duration-300"
                  aria-label={
                    hasLinePromo
                      ? `${product.name}, was ${formatRs(lineGross)}, now ${formatRs(saleTotal)}`
                      : `${product.name}, ${formatRs(saleTotal)}`
                  }
                >
                  <div className="relative aspect-square overflow-hidden bg-white">
                    {image ? (
                      <img
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        src={image}
                        alt=""
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] font-medium text-slate-400">
                        No image
                      </div>
                    )}
                    {hasLinePromo && <PromoBadge label={badgeText} />}
                    <span className="absolute bottom-2 left-2 right-2 py-1.5 text-center text-xs font-medium text-white bg-slate-900/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View in shop
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-amber-800 transition-colors flex-1 leading-snug">
                      {product.name}
                    </p>
                    <div className="mt-2 flex flex-col gap-0.5">
                      {hasLinePromo ? (
                        <>
                          <span className="text-xs text-slate-400 line-through tabular-nums">{formatRs(lineGross)}</span>
                          <span className="text-base font-bold text-[#0D1B3E] tabular-nums">{formatRs(saleTotal)}</span>
                        </>
                      ) : (
                        <span className="text-base font-bold text-[#0D1B3E] tabular-nums">{formatRs(saleTotal)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                );
              })}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 font-poppins font-semibold bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 sm:px-8 rounded-lg shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.98] transition-all duration-200 touch-manipulation"
          >
            View all products
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
