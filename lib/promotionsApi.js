import api from "@/lib/base/api";
import {
  getCategoriesWithItemCount,
  fetchWebItemRowsByIds,
  pickWebItemDisplayImageUrl,
  resolveAbsoluteMediaUrl,
} from "@/lib/shopApi";
import { normalizeDiscountType } from "@/lib/categoryPromotionPricing";

function isApiSuccess(data) {
  if (!data || typeof data !== "object") return false;
  const sc = data.statusCode ?? data.StatusCode;
  if (sc === -99 || sc === "-99") return false;
  if (sc === "FAILED" || (typeof sc === "string" && sc.toUpperCase() === "FAILED")) return false;
  return sc === 200 || sc === "200";
}

/** List/detail item from GetPublicPromotions / GetPublicPromotionById (camelCase or PascalCase). */
export function normalizePublicPromotion(p) {
  if (!p || typeof p !== "object") return null;
  const id = p.id ?? p.Id;
  if (id == null || !Number.isFinite(Number(id))) return null;
  const linesRaw = p.promotionCategoryLines ?? p.PromotionCategoryLines;
  const lines = Array.isArray(linesRaw)
    ? linesRaw.map((line) => ({
        ...line,
        id: line.id ?? line.Id,
        categoryId: line.categoryId ?? line.CategoryId ?? null,
        categoryName: line.categoryName ?? line.CategoryName,
        itemId: line.itemId ?? line.ItemId ?? null,
        itemName: line.itemName ?? line.ItemName,
        itemCode: line.itemCode ?? line.ItemCode,
        productImage: line.productImage ?? line.ProductImage ?? null,
        discountType: line.discountType ?? line.DiscountType,
        value: line.value ?? line.Value,
      }))
    : undefined;
  const totalRaw = p.promotionTotalAmountLines ?? p.PromotionTotalAmountLines;
  const totalLines = Array.isArray(totalRaw)
    ? totalRaw.map((line) => ({
        ...line,
        id: line.id ?? line.Id,
        billValue: line.billValue ?? line.BillValue,
        discountType: line.discountType ?? line.DiscountType,
        value: line.value ?? line.Value,
      }))
    : undefined;
  return {
    id: Number(id),
    name: p.name ?? p.Name ?? "",
    description: p.description ?? p.Description ?? "",
    promotionCategory: p.promotionCategory ?? p.PromotionCategory,
    promotionType: p.promotionType ?? p.PromotionType,
    couponCode: p.couponCode ?? p.CouponCode ?? null,
    isCouponAvailable: !!(p.isCouponAvailable ?? p.IsCouponAvailable),
    maxBillAmount: p.maxBillAmount ?? p.MaxBillAmount ?? null,
    startDate: p.startDate ?? p.StartDate ?? null,
    endDate: p.endDate ?? p.EndDate ?? null,
    isActive: p.isActive ?? p.IsActive ?? true,
    createdOn: p.createdOn ?? p.CreatedOn ?? null,
    promotionCategoryLines: lines,
    promotionTotalAmountLines: totalLines,
  };
}

function unwrapPagedPromotions(data) {
  const result = data?.result ?? data?.Result;
  if (Array.isArray(result)) {
    return { items: result, totalCount: result.length };
  }
  const rawItems = result?.items ?? result?.Items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];
  const totalCount = result?.totalCount ?? result?.TotalCount ?? items.length;
  return { items, totalCount };
}

export function formatPromotionDate(isoString) {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-LK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/** Display names for categories used on the storefront; other enum values are humanized from the key. */
const STOREFRONT_CATEGORY_LABELS = {
  ProductBased: "Product Based",
  CategoryBased: "Category Based",
  TotalAmountBased: "Total Amount Based",
};

function humanizeEnumCategoryKey(key) {
  if (!key) return "";
  return String(key).replace(/([a-z])([A-Z])/g, "$1 $2");
}

const PROMOTION_CATEGORY_NAMES = [
  "DiscountBased",
  "ProductBased",
  "ShippingBased",
  "CustomerBased",
  "TimeBased",
  "CategoryBased",
  "TotalAmountBased",
];

/** API may send enum as name string, number, or numeric string (1–7). Matches backend PromotionCategory. */
export function normalizePromotionCategoryKey(raw) {
  if (raw == null || raw === "") return "";
  if (typeof raw === "number" && raw >= 1 && raw <= 7) {
    const map = ["", ...PROMOTION_CATEGORY_NAMES];
    return map[raw] || "";
  }
  const compact = String(raw).replace(/\s+/g, "");
  const lower = compact.toLowerCase();
  const byName = PROMOTION_CATEGORY_NAMES.find((n) => n.toLowerCase() === lower);
  if (byName) return byName;
  if (/^\d+$/.test(compact)) {
    const n = parseInt(compact, 10);
    if (n >= 1 && n <= 7) {
      const map = ["", ...PROMOTION_CATEGORY_NAMES];
      return map[n] || "";
    }
  }
  return compact;
}

export function getPromotionCategoryLabel(promotionCategory) {
  const key = normalizePromotionCategoryKey(promotionCategory);
  if (STOREFRONT_CATEGORY_LABELS[key]) return STOREFRONT_CATEGORY_LABELS[key];
  if (key) return humanizeEnumCategoryKey(key);
  return "—";
}

export function formatDiscountLine(line) {
  if (!line) return "—";
  const dt = line.discountType ?? line.DiscountType;
  const isPct = normalizeDiscountType(dt) === "percentage";
  const v = Number(line.value ?? line.Value);
  if (isPct) return `${v}% off`;
  return `Rs. ${Number.isFinite(v) ? v.toLocaleString() : line.value}`;
}

/**
 * Discount type + value for storefront badges (category / product promotion lines).
 * @returns {{ discountKind: "percentage"|"value"|null, discountValue: number|null, discountLabel: string }}
 */
export function getDiscountLineMeta(line) {
  if (!line) return { discountKind: null, discountValue: null, discountLabel: "—" };
  const dt = line.discountType ?? line.DiscountType;
  const kind = normalizeDiscountType(dt) === "percentage" ? "percentage" : "value";
  const v = Number(line.value ?? line.Value);
  return {
    discountKind: kind,
    discountValue: Number.isFinite(v) ? v : null,
    discountLabel: formatDiscountLine(line),
  };
}

/** Short label for image badges (explicit “off” on value discounts). */
export function formatDiscountBadgeText(discountKind, discountValue, discountLabel) {
  if (discountKind === "percentage" && discountValue != null && Number.isFinite(discountValue)) {
    const p = Math.round(discountValue * 100) / 100;
    const s = p % 1 === 0 ? String(Math.round(p)) : String(p);
    return `${s}% off`;
  }
  if (discountKind === "value" && discountValue != null && Number.isFinite(discountValue)) {
    const v = discountValue;
    const opts =
      v % 1 === 0
        ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return `Rs. ${v.toLocaleString("en-LK", opts)} off`;
  }
  if (discountLabel && discountLabel !== "—") return discountLabel;
  return "";
}

/**
 * Public storefront list (no auth). Backend filters: active, within start/end window.
 */
export async function getPublicPromotions({ skipCount = 0, maxResultCount = 50 } = {}) {
  const data = await api.get("/ECommerce/GetPublicPromotions", {
    SkipCount: skipCount,
    MaxResultCount: maxResultCount,
  });

  if (!isApiSuccess(data)) {
    throw new Error(data.message ?? data.Message ?? "Failed to load promotions");
  }

  const { items: rawItems, totalCount } = unwrapPagedPromotions(data);
  const items = rawItems.map(normalizePublicPromotion).filter(Boolean);
  return { items, totalCount };
}

/**
 * Public promotion detail (no auth). Returns null if not found or not currently valid.
 */
export async function getPublicPromotionById(id) {
  const num = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(num) || num < 1) return null;

  const data = await api.get("/ECommerce/GetPublicPromotionById", { id: num });
  if (!isApiSuccess(data) || data.result == null) return null;
  return data.result;
}

/** Stock imagery when API has no category image (GetCategoriesWithItemCount has no image URL). */
const CATEGORY_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1504148455328-a618bc2615dc?w=600&q=80",
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80",
  "https://images.pexels.com/photos/162625/grinder-hitachi-power-tool-flexible-162625.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
  "https://images.pexels.com/photos/209229/pexels-photo-209229.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
];

export function getCategoryCardImageUrl(categoryId) {
  const id = Number(categoryId) || 0;
  const idx = Math.abs(id) % CATEGORY_CARD_IMAGES.length;
  return CATEGORY_CARD_IMAGES[idx];
}

/** Map categoryId → image URL from master Category (Items/GetCategoriesWithItemCount → categoryImage). */
export function buildCategoryImageMapFromApi(categories) {
  const map = new Map();
  if (!Array.isArray(categories)) return map;
  for (const c of categories) {
    const id = c.categoryId;
    const raw = c.categoryImage ?? c.CategoryImage;
    const url = raw != null && String(raw).trim() ? String(raw).trim() : null;
    if (id != null && url) {
      const n = Number(id);
      if (Number.isFinite(n) && n > 0) map.set(n, url);
    }
  }
  return map;
}

/** Prefer master/category image; otherwise placeholder pool. */
export function resolveCategoryImageUrl(categoryId, imageMap) {
  const id = Number(categoryId);
  const fromMaster = imageMap?.get?.(id);
  if (fromMaster && String(fromMaster).trim()) return String(fromMaster).trim();
  return getCategoryCardImageUrl(categoryId);
}

export function shopHrefForCategory(categoryId) {
  const id = Number(categoryId);
  if (!Number.isFinite(id) || id < 1) return "/shop";
  return `/shop?category=${id}`;
}

export function isCategoryDiscountPromotion(p) {
  if (!p) return false;
  const key = normalizePromotionCategoryKey(p.promotionCategory);
  const type = String(p.promotionType || "").toLowerCase();
  return key === "CategoryBased" && type === "categorydiscount";
}

/** Strict: category ProductBased + type ProductItemDiscount (e.g. cart rules). */
export function isProductItemDiscountPromotion(p) {
  if (!p) return false;
  const key = normalizePromotionCategoryKey(p.promotionCategory);
  const type = normalizePromotionTypeKey(p.promotionType);
  return key === "ProductBased" && type === "productitemdiscount";
}

/** Storefront: any promotion in the Product Based category (list/detail types may vary). */
export function isProductBasedPromotion(p) {
  if (!p) return false;
  return normalizePromotionCategoryKey(p.promotionCategory) === "ProductBased";
}

/** Cart / checkout: total merchandise subtotal tiers (before delivery). */
export function isTotalAmountDiscountPromotion(p) {
  if (!p) return false;
  const key = normalizePromotionCategoryKey(p.promotionCategory);
  const type = normalizePromotionTypeKey(p.promotionType);
  return key === "TotalAmountBased" && type === "totalamountdiscount";
}

/**
 * Total-amount promotion that only exposes a checkout coupon (no public “tier” offer card).
 * Hide these from the storefront promotions list — coupon is applied in cart/checkout only.
 */
export function isTotalAmountCouponPromotion(p) {
  if (!p) return false;
  if (!isTotalAmountDiscountPromotion(p)) return false;
  return !!(p.isCouponAvailable ?? p.IsCouponAvailable);
}

/** Backend DiscountType: Value = 1, Percentage = 2 */
function isTotalAmountLinePercentage(dt) {
  if (dt === 2 || dt === "2") return true;
  const s = String(dt ?? "").toLowerCase();
  return s === "percentage" || s.includes("percent");
}

/**
 * One tier row → short readable text (LKR / Rs. for storefront).
 * @param {object} line normalized or API line with billValue, discountType, value
 */
export function formatTotalAmountTierLine(line) {
  if (!line || typeof line !== "object") return "";
  const bill = Number(line.billValue ?? line.BillValue);
  const val = Number(line.value ?? line.Value);
  const dt = line.discountType ?? line.DiscountType;
  const isPct = isTotalAmountLinePercentage(dt);
  const billStr = Number.isFinite(bill) ? bill.toLocaleString("en-LK") : "—";
  if (isPct && Number.isFinite(val)) {
    return `Cart up to Rs. ${billStr} — ${val}% off`;
  }
  if (Number.isFinite(val)) {
    return `Cart up to Rs. ${billStr} — Rs. ${val.toLocaleString("en-LK")} off`;
  }
  return `Cart up to Rs. ${billStr}`;
}

/**
 * All tiers → one string for list cards, or null if no valid rows.
 * @param {Array|undefined} lines promotionTotalAmountLines
 */
export function formatTotalAmountPromotionSummary(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return null;
  const rows = lines
    .map((line) => ({
      billValue: Number(line.billValue ?? line.BillValue),
      discountType: line.discountType ?? line.DiscountType,
      value: Number(line.value ?? line.Value),
    }))
    .filter((r) => Number.isFinite(r.billValue) && r.billValue > 0);
  if (rows.length === 0) return null;
  rows.sort((a, b) => a.billValue - b.billValue);
  return rows.map((r) => formatTotalAmountTierLine(r)).join(" · ");
}

/** Short reward text for a tier row (detail tables). */
export function formatTotalAmountTierReward(line) {
  if (!line || typeof line !== "object") return "—";
  const val = Number(line.value ?? line.Value);
  const dt = line.discountType ?? line.DiscountType;
  const isPct = isTotalAmountLinePercentage(dt);
  if (isPct && Number.isFinite(val)) return `${val}% off`;
  if (Number.isFinite(val)) return `Rs. ${val.toLocaleString("en-LK")} off`;
  return "—";
}

function normalizePromotionTypeKey(raw) {
  return String(raw ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

/** Fallback card when API lines are missing (no JSON column). */
function productFallbackDiscountLabel() {
  return "View offer";
}

/** Placeholder imagery for product-offer cards (API lines have no item image URL yet). */
const PRODUCT_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80",
  "https://images.unsplash.com/photo-1504148455328-a618bc2615dc?w=600&q=80",
  "https://images.pexels.com/photos/162625/grinder-hitachi-power-tool-flexible-162625.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
];

export function getProductCardImageUrl(itemId) {
  const id = Number(itemId) || 0;
  const idx = Math.abs(id * 7) % PRODUCT_CARD_IMAGES.length;
  return PRODUCT_CARD_IMAGES[idx];
}

/** Prefer `/shop?item=id` so the shop opens that product with promo pricing; else search by code/name. */
export function shopHrefForPromotedItem(itemName, itemCode, itemId) {
  const id = Number(itemId);
  if (Number.isFinite(id) && id > 0) {
    return `/shop?item=${id}`;
  }
  const code = itemCode != null && String(itemCode).trim() ? String(itemCode).trim() : "";
  const name = itemName != null && String(itemName).trim() ? String(itemName).trim() : "";
  const q = code || name;
  if (!q) return "/shop";
  return `/shop?q=${encodeURIComponent(q)}`;
}

/**
 * Navigation target for a product promotion card — always an app path, never an image URL.
 * Uses explicit `/shop?item=` when a numeric inventory id exists (matches colombopvc shop deep link).
 */
export function getProductPromotionShopHref(card) {
  if (!card || typeof card !== "object") return "/shop";
  const href = typeof card.href === "string" ? card.href.trim() : "";
  const id = Number(card.itemId);
  const promoId = Number(card.promotionId);
  const isFallbackKey =
    typeof card.key === "string" && card.key.endsWith("-fallback");

  if (href.startsWith("/shop")) {
    return href;
  }

  const looksLikeImagePath = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(href);
  const isPromotionDetail =
    href.startsWith("/ecom/promotions/") || href.startsWith("http://") || href.startsWith("https://");
  if (!isPromotionDetail && !looksLikeImagePath && href.startsWith("/") && href.length > 1) {
    return href;
  }

  if (Number.isFinite(id) && id > 0) {
    if (isFallbackKey && Number.isFinite(promoId) && id === promoId) {
      return shopHrefForPromotedItem(card.itemName, card.itemCode, null);
    }
    return `/shop?item=${id}`;
  }
  return shopHrefForPromotedItem(card.itemName, card.itemCode, card.itemId);
}

export function resolveProductPromotionImageUrl(line, itemId) {
  const raw = line?.productImage ?? line?.ProductImage;
  const url = raw != null && String(raw).trim() ? String(raw).trim() : "";
  if (url) return resolveAbsoluteMediaUrl(url) || url;
  return getProductCardImageUrl(itemId);
}

async function loadPromotionDetailsByIds(ids) {
  const unique = [
    ...new Set(
      (ids || []).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)
    ),
  ];
  const entries = await Promise.all(
    unique.map(async (id) => {
      const raw = await getPublicPromotionById(id);
      return [id, raw ? normalizePublicPromotion(raw) : null];
    })
  );
  return new Map(entries);
}

/**
 * Flat rules for storefront pricing: one row per (promotion × category line).
 * @returns {Promise<Array<{ promotionId: number, categoryId: number, discountType: *, value: number }>>}
 */
export async function fetchCategoryDiscountRules() {
  const { items: promotions } = await getPublicPromotions({ skipCount: 0, maxResultCount: 100 });
  const list = (promotions || []).filter(isCategoryDiscountPromotion);
  if (list.length === 0) return [];

  const details = await Promise.all(list.map((p) => getPublicPromotionById(p.id)));
  const rules = [];

  list.forEach((promo, i) => {
    const detail = details[i];
    const lines = detail?.promotionCategoryLines ?? detail?.PromotionCategoryLines;
    if (!Array.isArray(lines)) return;
    for (const line of lines) {
      const categoryId = line.categoryId ?? line.CategoryId;
      if (categoryId == null || categoryId === "") continue;
      const v = Number(line.value ?? line.Value);
      rules.push({
        promotionId: promo.id,
        categoryId: Number(categoryId),
        discountType: line.discountType ?? line.DiscountType,
        value: Number.isFinite(v) ? v : 0,
      });
    }
  });

  return rules;
}

/**
 * Product-item discount rules (matches backend LoadActiveProductItemDiscountRulesAsync).
 * @returns {Promise<Array<{ promotionId: number, itemId: number, discountType: *, value: number }>>}
 */
export async function fetchProductDiscountRules() {
  const { items: promotions } = await getPublicPromotions({ skipCount: 0, maxResultCount: 100 });
  const list = (promotions || []).filter(isProductItemDiscountPromotion);
  if (list.length === 0) return [];

  const details = await Promise.all(list.map((p) => getPublicPromotionById(p.id)));
  const rules = [];

  list.forEach((promo, i) => {
    const detail = normalizePublicPromotion(details[i]) ?? details[i];
    const lines = detail?.promotionCategoryLines ?? detail?.PromotionCategoryLines;
    if (!Array.isArray(lines)) return;
    for (const line of lines) {
      const itemId = line.itemId ?? line.ItemId;
      if (itemId == null || itemId === "") continue;
      const v = Number(line.value ?? line.Value);
      rules.push({
        promotionId: promo.id,
        itemId: Number(itemId),
        discountType: line.discountType ?? line.DiscountType,
        value: Number.isFinite(v) ? v : 0,
      });
    }
  });

  return rules;
}

/**
 * Normalize rows from API or from promotion detail lines.
 * @param {Array} raw
 * @returns {Array<{ promotionId: number, billValue: number, discountType: *, value: number }>}
 */
function normalizeTotalAmountRuleRows(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => ({
      promotionId: Number(r.promotionId ?? r.PromotionId),
      billValue: Number(r.billValue ?? r.BillValue),
      discountType: r.discountType ?? r.DiscountType,
      value: Number(r.value ?? r.Value),
    }))
    .filter(
      (r) =>
        Number.isFinite(r.promotionId) &&
        r.promotionId > 0 &&
        Number.isFinite(r.billValue) &&
        r.billValue > 0 &&
        Number.isFinite(r.value) &&
        r.value >= 0,
    );
}

/**
 * Fallback when GetPublicTotalAmountPromotionRules is empty or unavailable: same tiers as
 * GetPublicPromotionById → PromotionTotalAmountLines (mirrors fetchCategoryDiscountRules pattern).
 */
async function fetchTotalAmountRulesFromPublicPromotionDetails() {
  const { items: promotions } = await getPublicPromotions({ skipCount: 0, maxResultCount: 100 });
  const list = (promotions || []).filter(isTotalAmountDiscountPromotion);
  if (list.length === 0) return [];

  const details = await Promise.all(list.map((p) => getPublicPromotionById(p.id)));
  const rows = [];
  list.forEach((promo, i) => {
    const detail = normalizePublicPromotion(details[i]) ?? details[i];
    const lines = detail?.promotionTotalAmountLines ?? detail?.PromotionTotalAmountLines;
    if (!Array.isArray(lines)) return;
    for (const line of lines) {
      rows.push({
        promotionId: promo.id,
        billValue: line.billValue ?? line.BillValue,
        discountType: line.discountType ?? line.DiscountType,
        value: line.value ?? line.Value,
      });
    }
  });
  return normalizeTotalAmountRuleRows(rows);
}

/**
 * Total-amount tiers for storefront cart (merchandise subtotal before line splits for order discount).
 * Primary: GET /ECommerce/GetPublicTotalAmountPromotionRules (same data as CreateOnlineOrder).
 * Fallback: public promotions list + GetPublicPromotionById tiers if the dedicated endpoint returns nothing.
 * @returns {Promise<Array<{ promotionId: number, billValue: number, discountType: *, value: number }>>}
 */
export async function fetchTotalAmountDiscountRules() {
  let fromDedicated = [];
  try {
    const data = await api.get("/ECommerce/GetPublicTotalAmountPromotionRules");
    if (isApiSuccess(data)) {
      const raw = data.result ?? data.Result ?? [];
      fromDedicated = normalizeTotalAmountRuleRows(raw);
    }
  } catch {
    /* try fallback */
  }

  if (fromDedicated.length > 0) {
    return fromDedicated;
  }

  try {
    return await fetchTotalAmountRulesFromPublicPromotionDetails();
  } catch {
    return [];
  }
}

/**
 * True when any active total-amount promotion has “coupon available” enabled (storefront Order Summary).
 * @returns {Promise<boolean>}
 */
export async function getPublicTotalAmountCouponAvailability() {
  try {
    const data = await api.get("/ECommerce/GetPublicTotalAmountCouponAvailability");
    if (!isApiSuccess(data)) return false;
    const r = data.result ?? data.Result ?? {};
    return !!(r.couponEnabled ?? r.CouponEnabled);
  } catch {
    return false;
  }
}

/**
 * Preview extra coupon discount on merchandise net after line + tier promos (matches CreateOnlineOrder).
 * @param {{ couponCode: string, merchandiseNetAfterLineAndTier: number }} params
 * @returns {Promise<{ valid: boolean, couponDiscount: number, message?: string, promotionId?: number }>}
 */
export async function previewTotalAmountCoupon({ couponCode, merchandiseNetAfterLineAndTier }) {
  const data = await api.post("/ECommerce/PreviewTotalAmountCoupon", {
    couponCode: String(couponCode ?? "").trim(),
    merchandiseNetAfterLineAndTier: Number(merchandiseNetAfterLineAndTier),
  });
  if (!isApiSuccess(data)) {
    return {
      valid: false,
      couponDiscount: 0,
      message: data?.message ?? data?.Message ?? "Request failed",
    };
  }
  const r = data.result ?? data.Result ?? {};
  return {
    valid: !!(r.valid ?? r.Valid),
    couponDiscount: Number(r.couponDiscount ?? r.CouponDiscount ?? 0),
    message: r.message ?? r.Message,
    promotionId: r.promotionId ?? r.PromotionId,
  };
}

/** Merge Items API rows into product promotion cards (real productImage / sub-image URLs). */
async function enrichProductPromotionCardsFromWebItems(productCards) {
  const rows = productCards.filter((c) => !c.href);
  if (rows.length === 0) return;
  const ids = [...new Set(rows.map((c) => c.itemId).filter((id) => Number.isFinite(id) && id > 0))];
  if (ids.length === 0) return;

  let map;
  try {
    map = await fetchWebItemRowsByIds(ids);
  } catch {
    return;
  }

  for (const c of rows) {
    const row = map.get(c.itemId);
    if (!row) continue;
    const url = pickWebItemDisplayImageUrl(row);
    if (url) c.imageUrl = url;
    const masterName = row.name ?? row.Name;
    if (masterName != null && String(masterName).trim()) {
      const name = String(masterName).trim();
      if (!c.itemName || /^Item #\d+$/i.test(String(c.itemName).trim())) {
        c.itemName = name;
      }
    }
  }
}

/**
 * Single load: category offer cards, product item offer cards, and the promotion list.
 * Fetches each qualifying promotion detail once.
 */
export async function getPublicPromotionsPageData() {
  let categories = [];
  try {
    categories = await getCategoriesWithItemCount();
  } catch {
    categories = [];
  }

  const { items: promotions } = await getPublicPromotions({ skipCount: 0, maxResultCount: 100 });
  const categoryImageMap = buildCategoryImageMapFromApi(categories);
  const promoById = new Map(promotions.map((p) => [p.id, p]));

  const needDetails = new Set();
  for (const p of promotions) {
    if (isCategoryDiscountPromotion(p) || isProductBasedPromotion(p) || isTotalAmountDiscountPromotion(p)) {
      needDetails.add(p.id);
    }
  }
  const detailMap = await loadPromotionDetailsByIds([...needDetails]);

  const categoryCards = [];
  promotions.filter(isCategoryDiscountPromotion).forEach((promo) => {
    const detail = detailMap.get(promo.id);
    const lines = detail?.promotionCategoryLines;
    if (!Array.isArray(lines)) return;
    lines.forEach((line, lineIdx) => {
      const categoryId = line.categoryId ?? line.CategoryId;
      if (categoryId == null || categoryId === "") return;
      const categoryName =
        String(line.categoryName ?? line.CategoryName ?? "").trim() || `Category #${categoryId}`;
      const meta = getDiscountLineMeta(line);
      categoryCards.push({
        key: `cat-${promo.id}-${categoryId}-${line.id ?? lineIdx}`,
        categoryId: Number(categoryId),
        categoryName,
        imageUrl: resolveCategoryImageUrl(categoryId, categoryImageMap),
        discountKind: meta.discountKind,
        discountValue: meta.discountValue,
        discountLabel: meta.discountLabel,
        promotionId: promo.id,
        promotionName: promo.name || detail?.name || "",
        description: String(detail?.description ?? promo.description ?? "").trim(),
        endDate: promo.endDate ?? detail?.endDate,
      });
    });
  });

  const productCards = [];
  promotions.filter(isProductBasedPromotion).forEach((promo) => {
    const detail = detailMap.get(promo.id);
    const lines = detail?.promotionCategoryLines;
    let fromLines = 0;
    if (Array.isArray(lines)) {
      lines.forEach((line, lineIdx) => {
        const itemId = line.itemId ?? line.ItemId;
        if (itemId == null || itemId === "") return;
        fromLines += 1;
        const itemName =
          String(line.itemName ?? line.ItemName ?? "").trim() || `Item #${itemId}`;
        const itemCode = line.itemCode ?? line.ItemCode ?? null;
        const metaP = getDiscountLineMeta(line);
        productCards.push({
          key: `prod-${promo.id}-${itemId}-${line.id ?? lineIdx}`,
          itemId: Number(itemId),
          itemName,
          itemCode,
          imageUrl: resolveProductPromotionImageUrl(line, itemId),
          discountKind: metaP.discountKind,
          discountValue: metaP.discountValue,
          discountLabel: metaP.discountLabel,
          promotionId: promo.id,
          promotionName: promo.name || detail?.name || "",
          description: String(detail?.description ?? promo.description ?? "").trim(),
          endDate: promo.endDate ?? detail?.endDate,
        });
      });
    }
    if (fromLines === 0) {
      const title = String(promo.name || detail?.name || "").trim() || "Product offer";
      productCards.push({
        key: `prod-${promo.id}-fallback`,
        href: `/ecom/promotions/${promo.id}`,
        itemId: promo.id,
        itemName: title,
        itemCode: null,
        imageUrl: getProductCardImageUrl(promo.id),
        discountKind: null,
        discountValue: null,
        discountLabel: productFallbackDiscountLabel(),
        promotionId: promo.id,
        promotionName: promo.name || detail?.name || "",
        description: String(detail?.description ?? promo.description ?? "").trim(),
        endDate: promo.endDate ?? detail?.endDate,
      });
    }
  });

  if (productCards.length > 0) {
    await enrichProductPromotionCardsFromWebItems(productCards);
  }

  const promotionsEnriched = promotions.map((p) => {
    if (!isTotalAmountDiscountPromotion(p) || isTotalAmountCouponPromotion(p)) return p;
    const detail = detailMap.get(p.id);
    const lines = detail?.promotionTotalAmountLines ?? detail?.PromotionTotalAmountLines;
    const totalAmountSummary = formatTotalAmountPromotionSummary(lines);
    return totalAmountSummary ? { ...p, totalAmountSummary } : p;
  });

  const promoByIdEnriched = new Map(promotionsEnriched.map((x) => [x.id, x]));

  return { categoryCards, productCards, promotions: promotionsEnriched, promoById: promoByIdEnriched };
}

/**
 * Loads active promotions, then expands Category Discount rows into shop cards
 * (category image + name + discount). Each card links to /shop?category=…
 */
export async function getPublicCategoryOfferCards() {
  const { categoryCards, promotions, promoById } = await getPublicPromotionsPageData();
  return { cards: categoryCards, promotions, promoById };
}
