/**
 * Shop / Items API.
 * Backend: GetAllWebItemsRequest { Input { SkipCount, MaxResultCount, Search, Filter }, CategoryIds, SubCategoryIds, SortType }
 */

import api from "@/lib/base/api";

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
 *   input.skipCount   = (pageNumber - 1) * pageSize
 *   input.maxResultCount = pageSize
 *   input.search       = searchText
 *   categoryIds        = [categoryId]   (if provided)
 *   subCategoryIds     = [subCategoryId] (if provided)
 *   sortType           = 0
 *
 * @param {Object} opts
 * @param {number} [opts.pageNumber=1]
 * @param {number} [opts.pageSize=16]
 * @param {number} [opts.categoryId]
 * @param {number} [opts.subCategoryId]
 * @param {string} [opts.searchText]
 * @returns {Promise<{ totalCount: number, items: Array }>}
 */
export async function getAllItemsForWeb(opts = {}) {
  const {
    pageNumber = 1,
    pageSize = 16,
    categoryId,
    subCategoryId,
    searchText,
  } = opts;

  const page = Math.max(1, pageNumber);
  const size = Math.max(1, Math.min(100, pageSize));

  const body = {
    input: {
      skipCount: (page - 1) * size,
      maxResultCount: size,
    },
    sortType: 0,
  };

  if (searchText != null && String(searchText).trim()) {
    body.input.search = String(searchText).trim();
  }

  if (categoryId != null) {
    body.categoryIds = [categoryId];
  }

  if (subCategoryId != null) {
    body.subCategoryIds = [subCategoryId];
  }

  const data = await api.post("/Items/GetAllItemsForWeb", body);
  const payload = data?.result ?? data?.data ?? data;
  const totalCount = payload?.totalCount ?? 0;
  const rawItems = payload?.items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];
  return { totalCount, items };
}
