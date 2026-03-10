/**
 * Top bar notifications API.
 * GET /ECommerce/GetAllTopBarNotifications
 */

import api from "@/lib/base/api";

/**
 * GET /ECommerce/GetAllTopBarNotifications
 * @param {Object} [opts]
 * @param {number} [opts.skipCount=0]
 * @param {number} [opts.maxResultCount=10]
 * @param {string} [opts.search]
 * @param {boolean} [opts.isCurrentDate=true]
 * @returns {Promise<Array<{ id, message, startDate, endDate, isActive }>>}
 */
export async function getAllTopBarNotifications(opts = {}) {
  const {
    skipCount = 0,
    maxResultCount = 10,
    search,
    isCurrentDate = true,
  } = opts;

  const params = {
    SkipCount: skipCount,
    MaxResultCount: maxResultCount,
    isCurrentDate: isCurrentDate,
  };
  if (search != null && search !== "") params.Search = search;

  const data = await api.get("/ECommerce/GetAllTopBarNotifications", params);

  if (data && data.statusCode != null && data.statusCode !== 200) {
    throw new Error(data.message || "Failed to load top bar notifications");
  }

  const result = data.result ?? data;
  const rawItems = result?.items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];

  const now = new Date();
  return items
    .filter((n) => n.isActive)
    .filter((n) => {
      if (n.startDate && new Date(n.startDate) > now) return false;
      if (n.endDate && new Date(n.endDate) < now) return false;
      return true;
    });
}
