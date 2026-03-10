/**
 * Hero banners API.
 * GET /ECommerce/GetAllHeroBanners
 */

import api from "@/lib/base/api";

/**
 * GET /ECommerce/GetAllHeroBanners
 * @param {Object} [opts]
 * @param {number} [opts.skipCount=0]
 * @param {number} [opts.maxResultCount=10]
 * @param {string} [opts.search]
 * @returns {Promise<Array<{ id, title, description, displayOrder, isActive, bannerImages: Array<{ imgUrl, displayOrder }> }>>}
 */
export async function getAllHeroBanners(opts = {}) {
  const { skipCount = 0, maxResultCount = 10, search } = opts;

  const data = await api.get("/ECommerce/GetAllHeroBanners", {
    SkipCount: skipCount,
    MaxResultCount: maxResultCount,
    ...(search != null && search !== "" && { Search: search }),
  });

  if (data.statusCode !== 200) {
    throw new Error(data.message || "Failed to load hero banners");
  }

  const result = data.result;
  const rawItems = result?.items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];

  return items
    .filter((b) => b.isActive)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}
