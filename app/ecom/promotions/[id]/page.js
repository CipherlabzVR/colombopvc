"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getPublicPromotionById,
  normalizePublicPromotion,
  getPromotionCategoryLabel,
  formatPromotionDate,
  formatDiscountLine,
  normalizePromotionCategoryKey,
  formatTotalAmountTierReward,
} from "@/lib/promotionsApi";

export default function EcomPromotionDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return undefined;
    setLoading(true);
    setError(null);
    getPublicPromotionById(id)
      .then((p) => {
        if (!p) setError("notfound");
        else setPromo(normalizePublicPromotion(p) ?? p);
      })
      .catch((e) => setError(e.message || "failed"))
      .finally(() => setLoading(false));
    return undefined;
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#B45309]" />
      </main>
    );
  }

  if (error === "notfound" || !promo) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4 font-poppins">
        <p className="text-slate-600 text-center">
          {error && error !== "notfound" ? error : "This promotion is not available or has ended."}
        </p>
        <Link href="/ecom/promotions" className="text-sm font-medium text-[#B45309] hover:text-[#923a07]">
          ← All promotions
        </Link>
      </main>
    );
  }

  const catKey = normalizePromotionCategoryKey(promo.promotionCategory);
  const lines = Array.isArray(promo.promotionCategoryLines) ? promo.promotionCategoryLines : [];
  const categoryLines = lines.filter((l) => {
    const cid = l.categoryId ?? l.CategoryId;
    return cid != null && cid !== "";
  });
  const productLines = lines.filter((l) => {
    const iid = l.itemId ?? l.ItemId;
    return iid != null && iid !== "";
  });

  const totalAmountLines = Array.isArray(promo.promotionTotalAmountLines)
    ? [...promo.promotionTotalAmountLines].sort(
        (a, b) =>
          Number(a.billValue ?? a.BillValue ?? 0) - Number(b.billValue ?? b.BillValue ?? 0),
      )
    : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 font-poppins">
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#B45309]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/ecom/promotions" className="hover:text-[#B45309]">
            Promotions
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800 line-clamp-1">{promo.name}</span>
        </nav>

        <div className="h-1.5 rounded-full bg-linear-to-r from-[#0D1B3E] to-[#FFB000] mb-6" />

        <p className="text-sm font-medium text-[#B45309] uppercase tracking-wide mb-2">
          {getPromotionCategoryLabel(promo.promotionCategory)}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{promo.name}</h1>

        {promo.description && <p className="text-slate-600 leading-relaxed mb-6">{promo.description}</p>}

        {catKey === "TotalAmountBased" && totalAmountLines.length > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 mb-6">
            <p className="text-sm font-medium text-emerald-950 mb-1">How it works</p>
            <p className="text-sm text-emerald-900/90 leading-relaxed">
              Savings apply to your merchandise subtotal before delivery. At checkout we use the best tier your cart still
              qualifies for — see the table below.
            </p>
          </div>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-8">
          <div className="bg-white rounded-lg border border-slate-100 p-4">
            <dt className="text-slate-500 mb-1">Valid from</dt>
            <dd className="font-medium text-slate-900">{formatPromotionDate(promo.startDate)}</dd>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 p-4">
            <dt className="text-slate-500 mb-1">Valid until</dt>
            <dd className="font-medium text-slate-900">{formatPromotionDate(promo.endDate)}</dd>
          </div>
          {promo.couponCode ? (
            <div className="bg-amber-50 rounded-lg border border-amber-100 p-4 sm:col-span-2">
              <dt className="text-amber-900/80 mb-1">Coupon code</dt>
              <dd className="font-mono text-lg font-semibold text-slate-900">{promo.couponCode}</dd>
            </div>
          ) : null}
          {catKey !== "CategoryBased" && promo.promotionType ? (
            <div className="bg-white rounded-lg border border-slate-100 p-4 sm:col-span-2">
              <dt className="text-slate-500 mb-1">Offer type</dt>
              <dd className="font-medium text-slate-900">
                {String(promo.promotionType).replace(/([A-Z])/g, " $1").trim()}
              </dd>
            </div>
          ) : null}
        </dl>

        {categoryLines.length > 0 && (
          <section className="mb-8" aria-labelledby="category-offers-heading">
            <h2 id="category-offers-heading" className="text-lg font-semibold text-slate-900 mb-3">
              Category offers
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-700">Category</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryLines.map((line) => (
                    <tr key={line.id ?? `${line.categoryId}-${line.value}`} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 text-slate-800">{line.categoryName || `Category #${line.categoryId}`}</td>
                      <td className="px-4 py-3 text-slate-800">{formatDiscountLine(line)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {totalAmountLines.length > 0 && (
          <section className="mb-8" aria-labelledby="order-total-tiers-heading">
            <h2 id="order-total-tiers-heading" className="text-lg font-semibold text-slate-900 mb-1">
              Spend tiers
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              Merchandise subtotal caps (before delivery). Your cart qualifies for the highest tier it still fits under.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-700">Merchandise up to</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Discount on cart</th>
                  </tr>
                </thead>
                <tbody>
                  {totalAmountLines.map((line) => {
                    const bill = Number(line.billValue ?? line.BillValue);
                    const billLabel = Number.isFinite(bill) ? `Rs. ${bill.toLocaleString("en-LK")}` : "—";
                    return (
                      <tr
                        key={line.id ?? `${bill}-${line.value}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-4 py-3 text-slate-800 tabular-nums">{billLabel}</td>
                        <td className="px-4 py-3 text-slate-800 font-medium">{formatTotalAmountTierReward(line)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {productLines.length > 0 && (
          <section className="mb-8" aria-labelledby="product-offers-heading">
            <h2 id="product-offers-heading" className="text-lg font-semibold text-slate-900 mb-3">
              Product offers
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-700">Item</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Discount</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-32">Shop</th>
                  </tr>
                </thead>
                <tbody>
                  {productLines.map((line) => {
                    const itemId = line.itemId ?? line.ItemId;
                    const shopHref = `/shop?item=${Number(itemId)}`;
                    const label = line.itemName || line.ItemName || `Item #${itemId}`;
                    return (
                      <tr key={line.id ?? `item-${itemId}-${line.value}`} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 text-slate-800">{label}</td>
                        <td className="px-4 py-3 text-slate-800">{formatDiscountLine(line)}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={shopHref}
                            className="font-medium text-emerald-700 hover:text-emerald-800 underline-offset-2 hover:underline"
                          >
                            View in shop
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <Link
          href="/ecom/promotions"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#B45309] hover:text-[#923a07]"
        >
          ← Back to all promotions
        </Link>
      </article>
    </main>
  );
}
