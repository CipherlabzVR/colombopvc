"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPublicPromotionsPageData,
  shopHrefForCategory,
  getProductPromotionShopHref,
  getPromotionCategoryLabel,
  formatPromotionDate,
  formatDiscountBadgeText,
  normalizePromotionCategoryKey,
  isCategoryDiscountPromotion,
  isProductBasedPromotion,
  isTotalAmountCouponPromotion,
  isTotalAmountDiscountPromotion,
} from "@/lib/promotionsApi";

/** Navy aligned with site header */
const TEXT_PRIMARY = "text-[#0D1B3E]";

const CARD_GRID_CLASS =
  "mx-auto grid w-max max-w-full grid-cols-[repeat(2,max-content)] gap-x-2 gap-y-2 sm:grid-cols-[repeat(3,max-content)] sm:gap-x-2 sm:gap-y-2";

const CARD_LINK_CLASS =
  "group flex h-full w-[168px] flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/30 focus-visible:ring-offset-2 sm:w-[200px] cursor-pointer text-left no-underline text-inherit";

/** Inline SVG — cart / order total (no extra deps). */
function IconOrderTotal({ className = "h-9 w-9" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 7h16l-1.2 9.04A2 2 0 0116.82 18H7.18a2 2 0 01-1.98-1.96L4 7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9 11V5a3 3 0 116 0v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M7 21h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function promotionCardShowsImageBadge({ discountKind, discountValue, discountLabel }) {
  if (formatDiscountBadgeText(discountKind, discountValue, discountLabel)) return true;
  return String(discountLabel ?? "").trim() === "View offer";
}

/** Overlay on product/category promo card images — distinct styles for % vs Rs. */
function PromotionImageDiscountBadge({ discountKind, discountValue, discountLabel }) {
  let text = formatDiscountBadgeText(discountKind, discountValue, discountLabel);
  if (!text && String(discountLabel ?? "").trim() === "View offer") text = "Special offer";
  if (!text) return null;

  const isPct = discountKind === "percentage";
  const isVal = discountKind === "value";

  return (
    <span
      className={`absolute top-2 left-2 z-10 max-w-[calc(100%-0.75rem)] truncate rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_4px_14px_-2px_rgba(15,23,42,0.45)] ring-2 ring-white/35 ${
        isPct
          ? "bg-linear-to-br from-emerald-500 to-teal-700"
          : isVal
            ? "bg-linear-to-br from-violet-600 to-indigo-800"
            : "bg-linear-to-br from-slate-600 to-slate-900"
      }`}
    >
      {text}
    </span>
  );
}

function PromotionOfferCard({
  href,
  imageUrl,
  title,
  discountKind,
  discountValue,
  discountLabel,
  endDate,
  caption,
  ariaLabel,
  scroll = true,
  prefetch = false,
}) {
  const foot = caption?.trim() || null;
  const showImageBadge = promotionCardShowsImageBadge({ discountKind, discountValue, discountLabel });
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
          <PromotionImageDiscountBadge
            discountKind={discountKind}
            discountValue={discountValue}
            discountLabel={discountLabel}
          />
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
          <p
            className={
              showImageBadge
                ? "text-xs sm:text-sm font-semibold tabular-nums leading-tight text-slate-600"
                : `text-sm sm:text-base font-bold tabular-nums leading-tight ${TEXT_PRIMARY}`
            }
          >
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

/** Compact list row for promotions without a storefront card (same style as former “other” simple rows). */
function SimplePromotionRow({ p }) {
  const title = p.name?.trim() || "Promotion";
  return (
    <li>
      <Link
        href={`/ecom/promotions/${p.id}`}
        className="block rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 transition-colors hover:bg-slate-100/80 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/35 focus-visible:ring-offset-2"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className={`font-medium ${TEXT_PRIMARY}`}>{title}</span>
          <span className="text-xs text-slate-500">
            {getPromotionCategoryLabel(p.promotionCategory)}
            {p.couponCode ? ` · ${p.couponCode}` : ""}
          </span>
        </div>
      </Link>
    </li>
  );
}

export default function EcomPromotionsPage() {
  const [categoryCards, setCategoryCards] = useState([]);
  const [productCards, setProductCards] = useState([]);
  const [otherCategoryBased, setOtherCategoryBased] = useState([]);
  const [otherProductBased, setOtherProductBased] = useState([]);
  const [otherPromotionsRest, setOtherPromotionsRest] = useState([]);
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
          if (isTotalAmountCouponPromotion(p)) return false;
          return true;
        });
        const restCat = [];
        const restProd = [];
        const rest = [];
        for (const p of others) {
          const key = normalizePromotionCategoryKey(p.promotionCategory);
          if (key === "CategoryBased") restCat.push(p);
          else if (key === "ProductBased") restProd.push(p);
          else rest.push(p);
        }
        setOtherCategoryBased(restCat);
        setOtherProductBased(restProd);
        setOtherPromotionsRest(rest);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const hasCategorySection = categoryCards.length > 0 || otherCategoryBased.length > 0;
  const hasProductSection = productCards.length > 0 || otherProductBased.length > 0;
  const hasAnyOfferCards = categoryCards.length > 0 || productCards.length > 0;
  const hasAnyPromotionContent =
    hasCategorySection || hasProductSection || otherPromotionsRest.length > 0;

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
          <strong className="font-semibold text-slate-600">Category Based</strong> offers apply to whole categories;{" "}
          <strong className="font-semibold text-slate-600">Product Based</strong> offers target specific items. Discounts
          apply in cart and checkout. Tap a card to shop, or open a listed promotion for details.
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

        {!loading && !error && !hasAnyPromotionContent && (
          <p className="text-sm text-slate-500 text-center py-10 rounded-2xl bg-slate-50 border border-slate-100 px-4">
            No promotions at the moment. Browse the shop or check back later.
          </p>
        )}

        {!loading && !error && !hasAnyOfferCards && hasAnyPromotionContent && (
          <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-2xl">
            No offer cards right now. Active promotions are listed in the sections below.
          </p>
        )}

        {!loading && !error && hasCategorySection && (
          <section className="mb-10 sm:mb-12" aria-labelledby="category-based-promotions-heading">
            <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <h2
                  id="category-based-promotions-heading"
                  className={`text-xl sm:text-2xl font-bold ${TEXT_PRIMARY} tracking-tight`}
                >
                  Category Based Promotions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Discounts that apply to entire categories in the shop.
                </p>
              </div>
              <span
                className="shrink-0 self-start rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600"
                aria-hidden
              >
                Category based
              </span>
            </div>
            {categoryCards.length > 0 ? (
              <ul className={CARD_GRID_CLASS}>
                {categoryCards.map((c) => (
                  <PromotionOfferCard
                    key={c.key}
                    href={shopHrefForCategory(c.categoryId)}
                    imageUrl={c.imageUrl}
                    title={c.categoryName}
                    discountKind={c.discountKind}
                    discountValue={c.discountValue}
                    discountLabel={c.discountLabel}
                    endDate={c.endDate}
                    caption={c.description || c.promotionName}
                    ariaLabel={`Shop ${c.categoryName}, ${c.discountLabel}`}
                  />
                ))}
              </ul>
            ) : null}
            {otherCategoryBased.length > 0 ? (
              <ul
                className={`space-y-4 max-w-3xl ${categoryCards.length > 0 ? "mt-6" : ""}`}
                aria-label="Additional category based promotions"
              >
                {otherCategoryBased.map((p) => (
                  <SimplePromotionRow key={p.id} p={p} />
                ))}
              </ul>
            ) : null}
          </section>
        )}

        {!loading && !error && hasProductSection && (
          <section
            className={hasCategorySection ? "pt-8 sm:pt-10 border-t border-slate-100" : ""}
            aria-labelledby="product-based-promotions-heading"
          >
            <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <h2
                  id="product-based-promotions-heading"
                  className={`text-xl sm:text-2xl font-bold ${TEXT_PRIMARY} tracking-tight`}
                >
                  Product Based Promotions
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Offers on specific products or SKUs.
                </p>
              </div>
              <span
                className="shrink-0 self-start rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600"
                aria-hidden
              >
                Product based
              </span>
            </div>
            {productCards.length > 0 ? (
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
                      discountKind={c.discountKind}
                      discountValue={c.discountValue}
                      discountLabel={c.discountLabel}
                      endDate={c.endDate}
                      caption={c.description || c.promotionName}
                      ariaLabel={aria}
                    />
                  );
                })}
              </ul>
            ) : null}
            {otherProductBased.length > 0 ? (
              <ul
                className={`space-y-4 max-w-3xl ${productCards.length > 0 ? "mt-6" : ""}`}
                aria-label="Additional product based promotions"
              >
                {otherProductBased.map((p) => (
                  <SimplePromotionRow key={p.id} p={p} />
                ))}
              </ul>
            ) : null}
          </section>
        )}

        {!loading && !error && otherPromotionsRest.length > 0 && (
          <section
            className={
              hasCategorySection || hasProductSection ? "mt-12 pt-8 border-t border-slate-100" : ""
            }
            aria-labelledby="other-promos-heading"
          >
            <h2
              id="other-promos-heading"
              className={`text-base sm:text-lg font-semibold ${TEXT_PRIMARY} mb-4 tracking-tight`}
            >
              {hasCategorySection || hasProductSection ? "Other promotions" : "Current promotions"}
            </h2>
            <ul className="space-y-4 max-w-3xl">
              {otherPromotionsRest.map((p) => {
                const isOrderTotalOffer =
                  isTotalAmountDiscountPromotion(p) && !isTotalAmountCouponPromotion(p);
                const title = p.name?.trim() || "Promotion";
                const desc = String(p.description ?? "").trim();
                const tierParts = p.totalAmountSummary
                  ? String(p.totalAmountSummary)
                      .split(" · ")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];
                return (
                  <li key={p.id}>
                    <Link
                      href={`/ecom/promotions/${p.id}`}
                      className={`block rounded-2xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/35 focus-visible:ring-offset-2 ${
                        isOrderTotalOffer
                          ? "group border-slate-200/90 bg-white shadow-[0_4px_24px_-6px_rgba(15,23,42,0.1)] hover:border-[#0D1B3E]/25 hover:shadow-[0_16px_48px_-12px_rgba(13,27,62,0.18)] overflow-hidden"
                          : "rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 hover:bg-slate-100/80 hover:border-slate-300"
                      }`}
                    >
                      {isOrderTotalOffer ? (
                        <div className="flex flex-col sm:flex-row sm:min-h-[140px]">
                          <div className="relative flex items-center justify-center gap-3 bg-linear-to-br from-[#0D1B3E] via-[#152a52] to-[#1a3a6e] px-8 py-8 sm:w-[min(30%,200px)] sm:shrink-0 sm:py-6">
                            <div
                              className="absolute inset-0 opacity-[0.12]"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 20% 20%, #FFB000 0%, transparent 45%), radial-gradient(circle at 80% 80%, #fff 0%, transparent 40%)",
                              }}
                            />
                            <IconOrderTotal className="relative h-11 w-11 text-amber-300/95 drop-shadow-sm" />
                          </div>
                          <div className="flex flex-1 flex-col justify-center gap-3 p-5 sm:p-6 sm:pl-7">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <h3
                                className={`text-lg sm:text-xl font-bold capitalize tracking-tight ${TEXT_PRIMARY} leading-tight`}
                              >
                                {title}
                              </h3>
                              <span className="shrink-0 rounded-full border border-amber-200/80 bg-linear-to-r from-amber-50 to-amber-100/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-950 shadow-sm">
                                Order total
                              </span>
                            </div>
                            {tierParts.length > 1 ? (
                              <ul className="space-y-2.5">
                                {tierParts.map((part, idx) => (
                                  <li key={idx} className="flex gap-3 text-sm leading-snug text-slate-700">
                                    <span
                                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-linear-to-br from-amber-400 to-amber-600 shadow-sm"
                                      aria-hidden
                                    />
                                    <span>{part}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : p.totalAmountSummary ? (
                              <p className="text-[15px] sm:text-base font-medium leading-relaxed text-slate-800">
                                {p.totalAmountSummary}
                              </p>
                            ) : (
                              <p className="text-sm leading-relaxed text-slate-600">
                                Save on your order total when your cart reaches the spend tiers. Open this offer for
                                full tier details and dates.
                              </p>
                            )}
                            {desc ? (
                              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed border-t border-slate-100 pt-3">
                                {desc}
                              </p>
                            ) : null}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                              <span className="text-xs font-medium text-slate-400">
                                Applied at checkout on order subtotal
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D1B3E] transition-[gap] group-hover:gap-2.5">
                                View details
                                <span aria-hidden className="inline-block translate-x-0 transition-transform group-hover:translate-x-0.5">
                                  →
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className={`font-medium ${TEXT_PRIMARY}`}>{title}</span>
                          <span className="text-xs text-slate-500">
                            {getPromotionCategoryLabel(p.promotionCategory)}
                            {p.couponCode ? ` · ${p.couponCode}` : ""}
                          </span>
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
