/**
 * AppSetting API.
 * Endpoints under /AppSetting on the ERP backend.
 */

import api from "@/lib/base/api";

/**
 * POST /AppSetting/SaveCorsLink
 * Registers the current website origin as an allowed CORS link on the ERP backend.
 *
 * @param {Object} payload
 * @param {string} payload.webLink - The full origin of the website (e.g. "https://colombopvc.lk").
 * @param {boolean} [payload.isActive=true]
 * @returns {Promise<any>}
 */
export async function saveCorsLink({ webLink, isActive = true }) {
  if (!webLink || typeof webLink !== "string") {
    throw new Error("saveCorsLink: 'webLink' is required");
  }

  return api.post("/AppSetting/SaveCorsLink", {
    webLink,
    isActive,
  });
}
