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
    };
  }
  const list = Array.isArray(rules) ? rules : [];
  let bestTotal = 0;
  let bestPromo = null;
  for (const r of list) {
    if (Number(r.itemId) !== pid) continue;
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
        };
  if (prod.totalDiscount > cat.totalDiscount + 1e-9) {
    return prod;
  }
  return cat;
}

/**
 * @param {Array<{ price: number, qty: number, categoryId?: number, id?: number }>} items
 * @param {Array} categoryRules
 * @param {Array} [productRules]
 */
export function summarizeCartPromotions(items, categoryRules, productRules = []) {
  const pr = Array.isArray(productRules) ? productRules : [];
  let gross = 0;
  let discount = 0;
  let net = 0;
  for (const item of items) {
    const lineGross = Number(item.price) * Number(item.qty);
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
  return {
    gross: round2(gross),
    discount: round2(discount),
    net: round2(net),
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
 */
export function getCartLinePromoPricing(item, categoryRules, productRules = []) {
  const q = Math.max(0, Number(item?.qty));
  const unitList = Number(item?.price);
  const pr = Array.isArray(productRules) ? productRules : [];
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
  const promo = computeBestCombinedLinePromotion(
    lineGross,
    q,
    item.categoryId,
    item.id,
    categoryRules,
    pr,
  );
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
