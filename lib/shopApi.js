/**
 * Shop / Items API.
 * Backend: GetAllWebItemsRequest { Input { SkipCount, MaxResultCount, Search, Filter }, CategoryIds, SubCategoryIds, SortType }
 */

import api, { API_BASE } from "@/lib/base/api";

/**
 * GET /Items/GetCategoriesWithItemCount
 */
export async function getCategoriesWithItemCount() {
  const data = await api.get("/Items/GetCategoriesWithItemCount");
  const list = data?.result ?? data?.data ?? data;
  return Array.isArray(list) ? list : [];
}

/**
 * POST /Items/GetAllItemsForWeb
 *
 * Maps our page-based params to the backend's GetAllWebItemsRequest:
 *   input.skipCount        = (pageNumber - 1) * pageSize
 *   input.maxResultCount   = pageSize
 *   input.search           = searchText
 *   input.filter           = filter (null if not provided)
 *   categoryIds            = [categoryId] or array (if provided)
 *   subCategoryIds         = [subCategoryId] or array (if provided)
 *   sortType               = sortType (0 default)
 *
 * @param {Object} opts
 * @param {number} [opts.pageNumber=1]
 * @param {number} [opts.pageSize=16]
 * @param {number|number[]} [opts.categoryId]
 * @param {number|number[]} [opts.subCategoryId]
 * @param {string} [opts.searchText]
 * @param {string|null} [opts.filter]
 * @param {number} [opts.sortType=0]
 * @returns {Promise<{ totalCount: number, items: Array }>}
 */
export async function getAllItemsForWeb(opts = {}) {
  const {
    pageNumber = 1,
    pageSize = 16,
    categoryId,
    subCategoryId,
    searchText,
    filter = null,
    sortType = 0,
  } = opts;

  const page = Math.max(1, pageNumber);
  const size = Math.max(1, Math.min(100, pageSize));

  const body = {
    input: {
      skipCount: (page - 1) * size,
      maxResultCount: size,
      search: searchText != null && String(searchText).trim() ? String(searchText).trim() : "",
      filter,
    },
    sortType,
  };

  if (categoryId != null) {
    body.categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
  }

  if (subCategoryId != null) {
    body.subCategoryIds = Array.isArray(subCategoryId) ? subCategoryId : [subCategoryId];
  }

  const data = await api.post("/Items/GetAllItemsForWeb", body);
  const payload = data?.result ?? data?.data ?? data;
  const totalCount = payload?.totalCount ?? 0;
  const rawItems = payload?.items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];
  return { totalCount, items };
}

/**
 * Loads every web-visible item by paging GetAllItemsForWeb (max 100 per request).
 * @param {Omit<Parameters<typeof getAllItemsForWeb>[0], "pageNumber" | "pageSize">} [opts]
 * @returns {Promise<{ totalCount: number, items: Array }>}
 */
export async function fetchAllWebItems(opts = {}) {
  const pageSize = 100;
  let page = 1;
  const all = [];
  let totalCount = 0;
  const maxPages = 500;

  while (page <= maxPages) {
    const { totalCount: tc, items } = await getAllItemsForWeb({
      ...opts,
      pageNumber: page,
      pageSize,
    });
    totalCount = tc || 0;
    const batch = Array.isArray(items) ? items : [];
    all.push(...batch);
    if (batch.length < pageSize) break;
    if (totalCount > 0 && all.length >= totalCount) break;
    page += 1;
  }

  return { totalCount, items: all };
}

/**
 * Fetch specific web-visible items by primary key (e.g. promotion deep link `?item=123`).
 * When backend supports GetAllWebItemsRequest.ItemIds, returns only those rows.
 */
export async function getWebItemsByIds(itemIds) {
  const ids = [...new Set((itemIds || []).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0))];
  if (ids.length === 0) return { totalCount: 0, items: [] };

  const body = {
    input: {
      skipCount: 0,
      maxResultCount: Math.min(ids.length, 100),
      search: "",
      filter: null,
    },
    itemIds: ids,
    sortType: 0,
  };

  const data = await api.post("/Items/GetAllItemsForWeb", body);
  const payload = data?.result ?? data?.data ?? data;
  const totalCount = payload?.totalCount ?? 0;
  const rawItems = payload?.items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];
  return { totalCount, items };
}

/**
 * Resolve a single web item by primary key for promotion links (`/shop?item=id`).
 * Tries ItemIds request first, then scans paged catalog if the API ignores itemIds or the item is missing.
 */
export async function resolveWebItemById(itemId) {
  const id = Number(itemId);
  if (!Number.isFinite(id) || id < 1) return null;

  const pickId = (x) => Number(x?.id ?? x?.Id);
  try {
    const { items } = await getWebItemsByIds([id]);
    const row = (items || []).find((x) => pickId(x) === id);
    if (row) return row;
  } catch {
    /* continue to scan */
  }

  const pageSize = 100;
  let page = 1;
  let totalCount = 0;
  const maxPages = 60;

  while (page <= maxPages) {
    const { totalCount: tc, items } = await getAllItemsForWeb({
      pageNumber: page,
      pageSize,
      searchText: undefined,
    });
    totalCount = tc || 0;
    const batch = Array.isArray(items) ? items : [];
    const found = batch.find((x) => pickId(x) === id);
    if (found) return found;
    if (batch.length < pageSize) break;
    if (totalCount > 0 && page * pageSize >= totalCount) break;
    page += 1;
  }

  return null;
}

/** Turn relative upload paths into absolute URLs using the API origin (e.g. `/files/...` → `https://host/files/...`). */
export function resolveAbsoluteMediaUrl(url) {
  if (url == null || typeof url !== "string") return null;
  const u = url.trim();
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  try {
    const origin = new URL(API_BASE).origin;
    const path = u.startsWith("/") ? u : `/${u}`;
    return `${origin}${path}`;
  } catch {
    return u;
  }
}

/**
 * Best display image URL from a GetAllItemsForWeb / Items row (main + sub-images).
 */
export function pickWebItemDisplayImageUrl(row) {
  if (!row || typeof row !== "object") return null;
  const main = row.productImage ?? row.ProductImage;
  if (main != null && String(main).trim()) {
    return resolveAbsoluteMediaUrl(String(main).trim());
  }
  const subs = row.itemSubImages ?? row.ItemSubImages;
  if (Array.isArray(subs)) {
    for (const s of subs) {
      const u = s?.imgUrl ?? s?.imageUrl ?? s?.ImgUrl ?? s?.ImageUrl;
      if (u != null && String(u).trim()) return resolveAbsoluteMediaUrl(String(u).trim());
    }
  }
  return null;
}

const pickItemRowId = (x) => Number(x?.id ?? x?.Id);

/**
 * Load web-visible item rows for many IDs (promotion cards, etc.).
 * Batches GetAllItemsForWeb with itemIds; fills gaps with per-id resolve when needed.
 * @returns {Promise<Map<number, object>>}
 */
export async function fetchWebItemRowsByIds(itemIds) {
  const unique = [
    ...new Set((itemIds || []).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)),
  ];
  const map = new Map();
  if (unique.length === 0) return map;

  const chunkSize = 100;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const chunkSet = new Set(chunk);
    try {
      const { items } = await getWebItemsByIds(chunk);
      for (const row of items || []) {
        const id = pickItemRowId(row);
        if (id > 0 && chunkSet.has(id)) map.set(id, row);
      }
    } catch {
      /* continue with resolve fallback */
    }
  }

  const missing = unique.filter((id) => !map.has(id));
  if (missing.length === 0) return map;

  await Promise.all(
    missing.map(async (id) => {
      try {
        const row = await resolveWebItemById(id);
        if (row && pickItemRowId(row) === id) map.set(id, row);
      } catch {
        /* ignore */
      }
    })
  );

  return map;
}
