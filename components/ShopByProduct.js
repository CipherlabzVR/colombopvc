"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllItemsForWeb, getWebItemsByIds } from "@/lib/shopApi";
import { fetchCategoryDiscountRules, fetchProductDiscountRules } from "@/lib/promotionsApi";
import { computeBestCombinedLinePromotion } from "@/lib/categoryPromotionPricing";
import { mapApiItemToProduct, formatRs, getPreferredInStockOffer } from "@/components/shop/shopData";

const FEATURED_COUNT = 6;

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
 * @returns {Promise<Array<{ product: object, image: string, lineGross: number, saleTotal: number, pct: number, label: string }>>}
 */
async function loadPromotedShowcaseItems() {
  const [categoryRules, productRules] = await Promise.all([
    fetchCategoryDiscountRules(),
    fetchProductDiscountRules(),
  ]);

  const productItemIds = [
    ...new Set(productRules.map((r) => Number(r.itemId)).filter((n) => Number.isFinite(n) && n > 0)),
  ];
  const categoryIds = [
    ...new Set(categoryRules.map((r) => Number(r.categoryId)).filter((n) => Number.isFinite(n) && n > 0)),
  ];

  const rawById = new Map();

  const [{ items: pageItems }, prodFetch] = await Promise.all([
    getAllItemsForWeb({ pageNumber: 1, pageSize: 150 }),
    productItemIds.length > 0 ? getWebItemsByIds(productItemIds) : Promise.resolve({ items: [] }),
  ]);

  for (const it of pageItems || []) rawById.set(it.id, it);
  for (const it of prodFetch.items || []) rawById.set(it.id, it);

  await Promise.all(
    categoryIds.map(async (cid) => {
      try {
        const { items } = await getAllItemsForWeb({ categoryId: cid, pageNumber: 1, pageSize: 24 });
        for (const it of items || []) rawById.set(it.id, it);
      } catch {
        /* skip category */
      }
    }),
  );

  const enriched = [];

  for (const raw of rawById.values()) {
    const product = mapApiItemToProduct(raw);
    if (!product) continue;
    const offer = getPreferredInStockOffer(product);
    if (offer.isEntirelyOutOfStock) continue;

    const unitPrice = offer.price;
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) continue;

    const lineGross = unitPrice * 1;
    const row = computeBestCombinedLinePromotion(
      lineGross,
      1,
      product.categoryId,
      product.id,
      categoryRules,
      productRules,
    );
    if (!row.totalDiscount || row.totalDiscount <= 0) continue;

    const saleTotal = row.subTotal;
    const pct = lineGross > 0 ? Math.round((row.totalDiscount / lineGross) * 100) : 0;

    enriched.push({
      product: { ...product, image: offer.image || product.image },
      image: offer.image || product.image,
      lineGross,
      saleTotal,
      pct,
    });
  }

  enriched.sort((a, b) => b.lineGross - b.saleTotal - (a.lineGross - a.saleTotal));
  return enriched.slice(0, FEATURED_COUNT);
}

export default function ShopByProduct() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadPromotedShowcaseItems()
      .then((list) => {
        if (!cancelled) setRows(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load promotions");
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
          Items with promotions
        </h2>
        <p className="text-slate-600 mb-8 sm:mb-10 font-poppins text-center text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Same discounts as cart and checkout — save on selected tools and materials while stocks last.
        </p>

        {error && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm text-center">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-12 text-center">
            <p className="text-slate-600 text-sm font-poppins max-w-md mx-auto">
              There are no promotional items to show right now. Browse the shop for the full range.
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
            ? Array.from({ length: FEATURED_COUNT }, (_, i) => <SkeletonCard key={i} />)
            : rows.map(({ product, image, lineGross, saleTotal, pct }) => {
                const saved = lineGross - saleTotal;
                const badgeText =
                  pct >= 1 ? `${pct}% off` : saved > 0 ? `Save ${formatRs(saved)}` : "Offer";
                return (
                <Link
                  key={product.id}
                  href={`/shop?item=${product.id}`}
                  className="group flex flex-col bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-amber-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.99] transition-all duration-300"
                  aria-label={`${product.name}, was ${formatRs(lineGross)}, now ${formatRs(saleTotal)}`}
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
                    <PromoBadge label={badgeText} />
                    <span className="absolute bottom-2 left-2 right-2 py-1.5 text-center text-xs font-medium text-white bg-slate-900/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View in shop
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-amber-800 transition-colors flex-1 leading-snug">
                      {product.name}
                    </p>
                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className="text-xs text-slate-400 line-through tabular-nums">{formatRs(lineGross)}</span>
                      <span className="text-base font-bold text-[#0D1B3E] tabular-nums">{formatRs(saleTotal)}</span>
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
