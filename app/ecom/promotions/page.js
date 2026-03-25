"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPublicPromotionsPageData,
  shopHrefForCategory,
  getProductPromotionShopHref,
  getPromotionCategoryLabel,
  formatPromotionDate,
  isCategoryDiscountPromotion,
  isProductBasedPromotion,
} from "@/lib/promotionsApi";

/** Navy aligned with site header */
const TEXT_PRIMARY = "text-[#0D1B3E]";

const CARD_GRID_CLASS =
  "mx-auto grid w-max max-w-full grid-cols-[repeat(2,max-content)] gap-x-2 gap-y-2 sm:grid-cols-[repeat(3,max-content)] sm:gap-x-2 sm:gap-y-2";

const CARD_LINK_CLASS =
  "group flex h-full w-[168px] flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/30 focus-visible:ring-offset-2 sm:w-[200px] cursor-pointer text-left no-underline text-inherit";

function PromotionOfferCard({
  href,
  imageUrl,
  title,
  discountLabel,
  endDate,
  caption,
  ariaLabel,
  scroll = true,
  prefetch = false,
}) {
  const foot = caption?.trim() || null;
  return (
    <li className="min-w-0">
      <Link
        href={href}
        scroll={scroll}
        prefetch={prefetch}
        className={CARD_LINK_CLASS}
        aria-label={ariaLabel}
      >
        <div className="relative h-24 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-28 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element -- CDN / placeholder URLs */}
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02] select-none"
            loading="lazy"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-0.5 px-2 py-2 sm:px-2.5 sm:py-2.5">
          <p className={`text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 ${TEXT_PRIMARY}`}>
            {title}
          </p>
          <p className={`text-sm sm:text-base font-bold tabular-nums leading-tight ${TEXT_PRIMARY}`}>
            {discountLabel}
          </p>
          {endDate ? (
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 leading-tight">
              Until {formatPromotionDate(endDate)}
            </p>
          ) : null}
          {foot ? (
            <p className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1 leading-tight">{foot}</p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

export default function EcomPromotionsPage() {
  const [categoryCards, setCategoryCards] = useState([]);
  const [productCards, setProductCards] = useState([]);
  const [otherPromotions, setOtherPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPublicPromotionsPageData()
      .then(({ categoryCards: cat, productCards: prod, promotions }) => {
        setCategoryCards(cat);
        setProductCards(prod);
        const catPromoIds = new Set(cat.map((c) => c.promotionId));
        const prodPromoIds = new Set(prod.map((c) => c.promotionId));
        const others = promotions.filter((p) => {
          if (isCategoryDiscountPromotion(p) && catPromoIds.has(p.id)) return false;
          if (isProductBasedPromotion(p) && prodPromoIds.has(p.id)) return false;
          return true;
        });
        setOtherPromotions(others);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const hasAnyCards = categoryCards.length > 0 || productCards.length > 0;

  return (
    <main className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10 font-poppins">
        <nav className="text-xs text-slate-500 mb-5">
          <Link href="/" className="hover:text-slate-700 transition-colors">
            Home
          </Link>
          <span className="mx-1.5 text-slate-300">/</span>
          <span className="text-slate-700">Promotions</span>
        </nav>

        <h1 className={`text-2xl sm:text-3xl font-bold ${TEXT_PRIMARY} tracking-tight mb-2`}>
          Promotions
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-2xl">
          Category-wide and product-specific offers use the same discounts in cart and checkout. Tap a card to shop that
          range or find the product; other active offers are listed at the bottom when applicable.
        </p>

        {loading && (
          <div className="flex justify-center py-16">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D1B3E]"
              aria-hidden
            />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 text-amber-950 text-sm px-4 py-3 mb-5">
            Could not load promotions. ({error})
          </div>
        )}

        {!loading && !error && !hasAnyCards && otherPromotions.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-10 rounded-2xl bg-slate-50 border border-slate-100 px-4">
            No promotions at the moment. Browse the shop or check back later.
          </p>
        )}

        {!loading && !error && !hasAnyCards && otherPromotions.length > 0 && (
          <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-2xl">
            No offer cards right now. Active promotions are listed below.
          </p>
        )}

        {!loading && !error && categoryCards.length > 0 && (
          <section className="mb-10 sm:mb-12" aria-labelledby="category-promotions-heading">
            <h2
              id="category-promotions-heading"
              className={`text-base sm:text-lg font-semibold ${TEXT_PRIMARY} mb-4 tracking-tight`}
            >
              Category promotions
            </h2>
            <ul className={CARD_GRID_CLASS}>
              {categoryCards.map((c) => (
                <PromotionOfferCard
                  key={c.key}
                  href={shopHrefForCategory(c.categoryId)}
                  imageUrl={c.imageUrl}
                  title={c.categoryName}
                  discountLabel={c.discountLabel}
                  endDate={c.endDate}
                  caption={c.description || c.promotionName}
                  ariaLabel={`Shop ${c.categoryName}, ${c.discountLabel}`}
                />
              ))}
            </ul>
          </section>
        )}

        {!loading && !error && productCards.length > 0 && (
          <section
            className={categoryCards.length > 0 ? "pt-8 sm:pt-10 border-t border-slate-100" : ""}
            aria-labelledby="product-promotions-heading"
          >
            <h2
              id="product-promotions-heading"
              className={`text-base sm:text-lg font-semibold ${TEXT_PRIMARY} mb-4 tracking-tight`}
            >
              Product promotions
            </h2>
            <ul className={CARD_GRID_CLASS}>
              {productCards.map((c) => {
                const href = getProductPromotionShopHref(c);
                const aria =
                  c.href != null
                    ? `${c.promotionName || c.itemName || "Promotion"}: ${c.discountLabel}`
                    : `Open ${c.itemName} in shop — ${c.discountLabel}`;
                return (
                  <PromotionOfferCard
                    key={c.key}
                    href={href}
                    imageUrl={c.imageUrl}
                    title={c.itemName}
                    discountLabel={c.discountLabel}
                    endDate={c.endDate}
                    caption={c.description || c.promotionName}
                    ariaLabel={aria}
                  />
                );
              })}
            </ul>
          </section>
        )}

        {!loading && !error && otherPromotions.length > 0 && (
          <section
            className={hasAnyCards ? "mt-12 pt-8 border-t border-slate-100" : ""}
            aria-labelledby="other-promos-heading"
          >
            <h2 id="other-promos-heading" className={`text-sm font-semibold ${TEXT_PRIMARY} mb-3`}>
              {hasAnyCards ? "Other promotions" : "Current promotions"}
            </h2>
            <ul className="space-y-2">
              {otherPromotions.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/ecom/promotions/${p.id}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm hover:bg-slate-100/80 transition-colors"
                  >
                    <span className={`font-medium ${TEXT_PRIMARY}`}>{p.name || "Promotion"}</span>
                    <span className="text-xs text-slate-500">
                      {getPromotionCategoryLabel(p.promotionCategory)}
                      {p.couponCode ? ` · ${p.couponCode}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
