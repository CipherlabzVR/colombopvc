import {
  effectiveUnitPriceForCartLine,
  wholesaleAppliesToCartLine,
} from "@/components/shop/shopData";

/**
 * Category- and product-item promotion pricing (aligns with backend ECommerceService:
 * best of category discount vs product-item discount per line).
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
      discountKind: null,
      ruleValue: null,
    };
  }
  const list = Array.isArray(rules) ? rules : [];
  let bestTotal = 0;
  let bestPromo = null;
  /** @type {{ discountType: *, value: number } | null} */
  let bestRule = null;
  for (const r of list) {
    if (Number(r.categoryId) !== cid) continue;
    const raw = computeRawLineDiscount(g, q, r.discountType, r.value);
    if (raw > bestTotal) {
      bestTotal = raw;
      bestPromo = r.promotionId;
      bestRule = { discountType: r.discountType, value: Number(r.value) };
    }
  }
  const totalDiscount = round2(bestTotal);
  const subTotal = round2(g - totalDiscount);
  const discountAmountPerUnit = q > 0 ? round4(totalDiscount / q) : totalDiscount;
  const dk = bestRule && totalDiscount > 0 ? normalizeDiscountType(bestRule.discountType) : null;
  return {
    promotionId: bestPromo != null && totalDiscount > 0 ? bestPromo : null,
    discountAmountPerUnit,
    totalDiscount,
    subTotal,
    discountKind: dk,
    ruleValue: bestRule && totalDiscount > 0 && Number.isFinite(bestRule.value) ? bestRule.value : null,
  };
}

/**
 * @param {number} lineGross - unit price × qty
 * @param {number} qty
 * @param {number|null|undefined} productId - Items.Id (cart / shop product id)
 * @param {Array<{ promotionId: number, itemId: number, discountType: *, value: number }>} rules
 */
export function computeBestProductLinePromotion(lineGross, qty, productId, rules) {
  const g = round2(lineGross);
  const q = Number(qty);
  const pid = productId != null ? Number(productId) : NaN;
  if (!Number.isFinite(g) || g <= 0 || !Number.isFinite(q) || q <= 0 || !Number.isFinite(pid) || pid < 1) {
    return {
      promotionId: null,
      discountAmountPerUnit: 0,
      totalDiscount: 0,
      subTotal: g,
      discountKind: null,
      ruleValue: null,
    };
  }
  const list = Array.isArray(rules) ? rules : [];
  let bestTotal = 0;
  let bestPromo = null;
  /** @type {{ discountType: *, value: number } | null} */
  let bestRule = null;
  for (const r of list) {
    if (Number(r.itemId) !== pid) continue;
    const raw = computeRawLineDiscount(g, q, r.discountType, r.value);
    if (raw > bestTotal) {
      bestTotal = raw;
      bestPromo = r.promotionId;
      bestRule = { discountType: r.discountType, value: Number(r.value) };
    }
  }
  const totalDiscount = round2(bestTotal);
  const subTotal = round2(g - totalDiscount);
  const discountAmountPerUnit = q > 0 ? round4(totalDiscount / q) : totalDiscount;
  const dk = bestRule && totalDiscount > 0 ? normalizeDiscountType(bestRule.discountType) : null;
  return {
    promotionId: bestPromo != null && totalDiscount > 0 ? bestPromo : null,
    discountAmountPerUnit,
    totalDiscount,
    subTotal,
    discountKind: dk,
    ruleValue: bestRule && totalDiscount > 0 && Number.isFinite(bestRule.value) ? bestRule.value : null,
  };
}

/**
 * Same rule as backend CreateOnlineOrder: pick the larger LKR discount between category and item promos.
 */
export function computeBestCombinedLinePromotion(
  lineGross,
  qty,
  categoryId,
  productId,
  categoryRules,
  productRules,
) {
  const g = round2(lineGross);
  const q = Number(qty);
  const cat = computeBestCategoryLinePromotion(g, q, categoryId, categoryRules);
  const pid =
    productId != null && Number.isFinite(Number(productId)) && Number(productId) > 0
      ? Number(productId)
      : null;
  const prod =
    pid != null
      ? computeBestProductLinePromotion(g, q, pid, productRules)
      : {
          promotionId: null,
          discountAmountPerUnit: 0,
          totalDiscount: 0,
          subTotal: g,
          discountKind: null,
          ruleValue: null,
        };
  if (prod.totalDiscount > cat.totalDiscount + 1e-9) {
    return prod;
  }
  return cat;
}

/**
 * Human-readable discount badge for product cards (percentage vs fixed LKR from promotion rule).
 * @param {"percentage"|"value"|null} discountKind
 * @param {number|null} ruleValue - admin field (percent 0–100 or LKR off line)
 * @param {number} totalDiscount - actual LKR saved on the line (qty 1 = unit)
 */
export function formatPromotionDiscountLabel(discountKind, ruleValue, totalDiscount) {
  if (discountKind === "percentage" && ruleValue != null && Number.isFinite(ruleValue) && ruleValue > 0) {
    const p = Math.round(ruleValue * 100) / 100;
    const s = p % 1 === 0 ? String(Math.round(p)) : String(p);
    return `${s}% off`;
  }
  if (discountKind === "value" && totalDiscount > 0) {
    return `${formatRsAmount(totalDiscount)} off`;
  }
  if (totalDiscount > 0) {
    return `${formatRsAmount(totalDiscount)} off`;
  }
  return "";
}

function formatRsAmount(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return "Rs. 0.00";
  return `Rs. ${x.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Best order-level discount on merchandise subtotal (sum of line list prices × qty), before delivery.
 * Within each promotion, uses the tier with the highest billValue that still qualifies.
 * @param {Array<{ promotionId: number, billValue: number, discountType: *, value: number }>} rules
 */
export function computeBestTotalAmountOrderDiscount(merchandiseGross, rules) {
  const g = Number(merchandiseGross);
  const list = Array.isArray(rules) ? rules : [];
  if (!Number.isFinite(g) || g <= 0 || list.length === 0) {
    return { discount: 0, promotionId: null };
  }
  const byPromo = new Map();
  for (const r of list) {
    const pid = r.promotionId;
    if (!byPromo.has(pid)) byPromo.set(pid, []);
    byPromo.get(pid).push(r);
  }
  let best = 0;
  let bestPromo = null;
  for (const [pid, tiers] of byPromo) {
    const qualifying = tiers.filter((t) => g >= Number(t.billValue));
    if (qualifying.length === 0) continue;
    const tier = qualifying.reduce((a, b) => (Number(a.billValue) >= Number(b.billValue) ? a : b));
    const d = computeRawLineDiscount(g, 1, tier.discountType, tier.value);
    const rounded = round2(d);
    if (rounded > best) {
      best = rounded;
      bestPromo = pid;
    }
  }
  return { discount: best, promotionId: bestPromo };
}

/**
 * @param {Array<{ price: number, qty: number, categoryId?: number, id?: number }>} items
 * @param {Array} categoryRules
 * @param {Array} [productRules]
 * @param {Array} [totalAmountRules] — tiers from fetchTotalAmountDiscountRules (optional)
 */
export function summarizeCartPromotions(items, categoryRules, productRules = [], totalAmountRules = []) {
  const pr = Array.isArray(productRules) ? productRules : [];
  let gross = 0;
  let discount = 0;
  let net = 0;
  for (const item of items) {
    const lineGross = effectiveUnitPriceForCartLine(item) * Number(item.qty);
    const row = computeBestCombinedLinePromotion(
      lineGross,
      item.qty,
      item.categoryId,
      item.id,
      categoryRules,
      pr,
    );
    gross += lineGross;
    discount += row.totalDiscount;
    net += row.subTotal;
  }
  const ta = Array.isArray(totalAmountRules) ? totalAmountRules : [];
  const { discount: orderDiscountRaw } = computeBestTotalAmountOrderDiscount(gross, ta);
  // Cap order-level discount to merchandise net after line promos (matches CreateOnlineOrder).
  const orderDiscount = round2(Math.min(orderDiscountRaw, net));
  const totalDisc = round2(discount + orderDiscount);
  const netAfter = round2(net - orderDiscount);
  return {
    gross: round2(gross),
    discount: totalDisc,
    net: netAfter,
    lineDiscount: round2(discount),
    orderDiscount,
  };
}

/**
 * Effective unit price after best promotion (category vs product-item), matching shop grid logic.
 * @param {number|null} [productId] - optional; pass `product.id` from API when available
 * @param {Array} [productRules]
 */
export function effectiveUnitPriceAfterPromotion(
  unitPrice,
  qty,
  categoryId,
  categoryRules,
  productId = null,
  productRules = [],
) {
  const q = Math.max(1, Number(qty) || 1);
  const lineGross = Number(unitPrice) * q;
  const pr = Array.isArray(productRules) ? productRules : [];
  const { subTotal } = computeBestCombinedLinePromotion(
    lineGross,
    q,
    categoryId,
    productId,
    categoryRules,
    pr,
  );
  return round2(subTotal / q);
}

/**
 * Cart / mini-cart: list vs promotional unit price and line totals.
 *
 * The per-unit promo price (`unitSale`) is always computed as if qty = 1 so it stays
 * stable as the shopper increases / decreases quantity. This matches the price shown
 * on product cards. Line totals (`lineNet`, `discount`) still use the real qty so they
 * stay aligned with the backend (which applies "Value" discounts per line, not per unit).
 */
export function getCartLinePromoPricing(item, categoryRules, productRules = []) {
  const q = Math.max(0, Number(item?.qty));
  const unitList = Number(item?.price);
  const pr = Array.isArray(productRules) ? productRules : [];
  if (!Number.isFinite(unitList) || q <= 0) {
    return {
      hasPromo: false,
      hasPromoDiscount: false,
      wholesaleActive: false,
      priceLabel: null,
      unitList: Number.isFinite(unitList) ? unitList : 0,
      unitSale: Number.isFinite(unitList) ? unitList : 0,
      retailLineGross: 0,
      lineGross: 0,
      lineNet: 0,
      discount: 0,
      lineTotalStrikeGross: 0,
    };
  }
  const wholesaleActive = wholesaleAppliesToCartLine(item);
  const retailLineGross = round2(unitList * q);
  const effectiveUnit = effectiveUnitPriceForCartLine(item);
  const lineGross = round2(effectiveUnit * q);
  const promo = computeBestCombinedLinePromotion(
    lineGross,
    q,
    item.categoryId,
    item.id,
    categoryRules,
    pr,
  );
  // Stable per-unit promo price: always evaluate the rule at qty=1 so the displayed
  // unit price doesn't drift as the cart quantity changes (e.g. "Rs. 5 off" at qty 1
  // showed Rs. 145 but at qty 2 used to render Rs. 147.50).
  const unitPromo = computeBestCombinedLinePromotion(
    round2(effectiveUnit),
    1,
    item.categoryId,
    item.id,
    categoryRules,
    pr,
  );
  const hasPromoDiscount = promo.totalDiscount > 0;
  const unitSale = hasPromoDiscount ? round2(unitPromo.subTotal) : round2(effectiveUnit);
  const hasSpecialPrice = wholesaleActive || hasPromoDiscount;
  const priceLabel = hasPromoDiscount ? "Promo price" : wholesaleActive ? "Wholesale price" : null;
  /** Line total to strike through before showing net (retail total if wholesale-only; pre-promo line if promo). */
  const lineTotalStrikeGross = hasPromoDiscount ? lineGross : wholesaleActive ? retailLineGross : lineGross;
  return {
    hasPromo: hasSpecialPrice,
    hasPromoDiscount,
    wholesaleActive,
    priceLabel,
    unitList,
    unitSale,
    retailLineGross,
    lineGross,
    lineNet: promo.subTotal,
    discount: promo.totalDiscount,
    lineTotalStrikeGross,
  };
}
