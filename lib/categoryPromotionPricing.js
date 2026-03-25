/**
 * Category-based promotion pricing (aligns with backend ECommerceService category discount rules).
 * DiscountType: Value = 1, Percentage = 2 (ApexflowERP.Domain.Enums.DiscountType).
 */

function round2(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

function round4(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 10000) / 10000;
}

/** @returns {"percentage"|"value"}
 * Backend uses JsonStringEnumConverter: API sends "Percentage" | "Value" (PascalCase).
 * Enum numeric: Percentage = 2, Value = 1.
 */
export function normalizeDiscountType(raw) {
  if (raw === 2 || raw === "2") return "percentage";
  if (raw === 1 || raw === "1") return "value";
  const s = String(raw ?? "").replace(/\s+/g, "").toLowerCase();
  if (s === "percentage") return "percentage";
  if (s === "value") return "value";
  return "value";
}

/**
 * Raw discount off a line (before rounding).
 * Percentage: lineTotal × (value / 100), capped at 100%.
 * Value: fixed LKR off the whole line (same as admin “Value” field), capped at line gross.
 */
export function computeRawLineDiscount(lineGross, qty, discountType, value) {
  const g = Number(lineGross);
  const q = Number(qty);
  const v = Number(value);
  if (!Number.isFinite(g) || g <= 0 || !Number.isFinite(q) || q <= 0 || !Number.isFinite(v) || v < 0) {
    return 0;
  }
  // Always normalize: API sends "Percentage"/"Value" strings; using raw string breaks === "percentage".
  const kind = normalizeDiscountType(discountType);
  if (kind === "percentage") {
    const pct = Math.min(v, 100);
    return g * (pct / 100);
  }
  return Math.min(v, g);
}

/**
 * @param {number} lineGross - unit price × qty
 * @param {number} qty
 * @param {number|null|undefined} categoryId
 * @param {Array<{ promotionId: number, categoryId: number, discountType: *, value: number }>} rules
 */
export function computeBestCategoryLinePromotion(lineGross, qty, categoryId, rules) {
  const g = round2(lineGross);
  const q = Number(qty);
  const cid = categoryId != null ? Number(categoryId) : NaN;
  if (!Number.isFinite(g) || g <= 0 || !Number.isFinite(q) || q <= 0 || !Number.isFinite(cid) || cid < 1) {
    return {
      promotionId: null,
      discountAmountPerUnit: 0,
      totalDiscount: 0,
      subTotal: g,
    };
  }
  const list = Array.isArray(rules) ? rules : [];
  let bestTotal = 0;
  let bestPromo = null;
  for (const r of list) {
    if (Number(r.categoryId) !== cid) continue;
    const raw = computeRawLineDiscount(g, q, r.discountType, r.value);
    if (raw > bestTotal) {
      bestTotal = raw;
      bestPromo = r.promotionId;
    }
  }
  const totalDiscount = round2(bestTotal);
  const subTotal = round2(g - totalDiscount);
  const discountAmountPerUnit = q > 0 ? round4(totalDiscount / q) : totalDiscount;
  return {
    promotionId: bestPromo != null && totalDiscount > 0 ? bestPromo : null,
    discountAmountPerUnit,
    totalDiscount,
    subTotal,
  };
}

/**
 * @param {Array<{ price: number, qty: number, categoryId?: number }>} items
 * @param {Array} rules
 */
export function summarizeCartPromotions(items, rules) {
  let gross = 0;
  let discount = 0;
  let net = 0;
  for (const item of items) {
    const lineGross = Number(item.price) * Number(item.qty);
    const row = computeBestCategoryLinePromotion(lineGross, item.qty, item.categoryId, rules);
    gross += lineGross;
    discount += row.totalDiscount;
    net += row.subTotal;
  }
  return {
    gross: round2(gross),
    discount: round2(discount),
    net: round2(net),
  };
}

/**
 * Effective unit price after best category promotion (for display).
 */
export function effectiveUnitPriceAfterPromotion(unitPrice, qty, categoryId, rules) {
  const q = Math.max(1, Number(qty) || 1);
  const lineGross = Number(unitPrice) * q;
  const { subTotal } = computeBestCategoryLinePromotion(lineGross, q, categoryId, rules);
  return round2(subTotal / q);
}

/**
 * Cart / mini-cart: list vs promotional unit price and line totals.
 */
export function getCartLinePromoPricing(item, rules) {
  const q = Math.max(0, Number(item?.qty));
  const unitList = Number(item?.price);
  if (!Number.isFinite(unitList) || q <= 0) {
    return {
      hasPromo: false,
      unitList: Number.isFinite(unitList) ? unitList : 0,
      unitSale: Number.isFinite(unitList) ? unitList : 0,
      lineGross: 0,
      lineNet: 0,
      discount: 0,
    };
  }
  const lineGross = round2(unitList * q);
  const promo = computeBestCategoryLinePromotion(lineGross, q, item.categoryId, rules);
  const hasPromo = promo.totalDiscount > 0;
  const unitSale = hasPromo ? round2(promo.subTotal / q) : unitList;
  return {
    hasPromo,
    unitList,
    unitSale,
    lineGross,
    lineNet: promo.subTotal,
    discount: promo.totalDiscount,
  };
}
