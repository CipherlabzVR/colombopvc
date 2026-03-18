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
