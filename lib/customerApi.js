/**
 * E-Commerce customer API.
 * CreateECommerceCustomer, LoginECommerceCustomer, GetAllECommerceCustomers
 */

import api from "@/lib/base/api";

/**
 * GET /ECommerce/GetAllECommerceCustomers
 * @param {Object} [opts]
 * @param {number} [opts.skipCount=0]
 * @param {number} [opts.maxResultCount=100]
 * @param {string} [opts.search]
 * @returns {Promise<{ totalCount: number, items: Array<{ id, firstName, lastName, email, mobileNo }> }>}
 */
export async function getAllECommerceCustomers(opts = {}) {
  const { skipCount = 0, maxResultCount = 100, search } = opts;
  const params = {
    SkipCount: skipCount,
    MaxResultCount: maxResultCount,
  };
  if (search != null && search !== "") params.Search = search;

  const data = await api.get("/ECommerce/GetAllECommerceCustomers", params);
  const payload = data?.result ?? data;
  const totalCount = payload?.totalCount ?? payload?.TotalCount ?? 0;
  const rawItems = payload?.items ?? payload?.Items ?? (Array.isArray(payload) ? payload : []);
  const items = Array.isArray(rawItems) ? rawItems : [];
  return { totalCount, items };
}

/**
 * POST /ECommerce/CreateECommerceCustomer
 * Creates a customer. Used for sign-up and for guest checkout (with a generated password).
 * @param {Object} payload
 * @param {string} payload.firstName
 * @param {string} payload.lastName
 * @param {string} payload.email
 * @param {string} payload.mobileNo
 * @param {string} payload.password
 * @param {number} [payload.warehouseId]
 * @param {boolean} [payload.validateCustomer] - true for sign-up, false for guest checkout
 * @returns {Promise<object>} API response; success includes result.CustomerId or CustomerId
 */
export async function createECommerceCustomer(payload) {
  const body = {
    firstName: payload.firstName ?? "",
    lastName: payload.lastName ?? "",
    email: payload.email ?? "",
    mobileNo: payload.mobileNo ?? "",
    password: payload.password ?? "",
  };
  if (payload.warehouseId != null) body.warehouseId = payload.warehouseId;
  if (typeof payload.validateCustomer === "boolean") body.validateCustomer = payload.validateCustomer;

  const data = await api.post("/ECommerce/CreateECommerceCustomer", body);

  const res = data?.result ?? data;
  const message = (data?.message ?? res?.message ?? "").toString();
  const messageLower = message.toLowerCase();
  const isDuplicate =
    data?.success === false ||
    (data?.statusCode != null && data?.statusCode !== 200) ||
    messageLower.includes("already exists") ||
    messageLower.includes("duplicate") ||
    messageLower.includes("already registered") ||
    messageLower.includes("already in use");

  if (isDuplicate) {
    const err = new Error(message || "An account with this email or phone number already exists.");
    err.code = "ACCOUNT_EXISTS";
    throw err;
  }

  return data;
}

/** Generate a random password for guest customer creation (not used for login). */
function generateGuestPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 16; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

/**
 * POST /ECommerce/LoginECommerceCustomer
 * @param {Object} payload
 * @param {string} payload.email
 * @param {string} payload.password
 * @returns {Promise<object>} API response (e.g. { token, ...user })
 */
export async function loginECommerceCustomer(payload) {
  const body = {
    email: payload.email ?? "",
    password: payload.password ?? "",
  };
  const data = await api.post("/ECommerce/LoginECommerceCustomer", body);
  return data;
}

/**
 * Create a customer for guest checkout using CreateECommerceCustomer with a generated password.
 * Contact info is saved to DB. If the email is already registered, the API returns a fail response.
 * @param {Object} payload
 * @param {string} payload.firstName
 * @param {string} payload.lastName
 * @param {string} payload.email
 * @param {string} payload.mobileNo
 * @returns {Promise<{ customerId: number }>} Resolves with customerId; throws if account exists or API error
 */
export async function createGuestCustomerForCheckout(payload) {
  const data = await createECommerceCustomer({
    firstName: (payload.firstName ?? "").trim(),
    lastName: (payload.lastName ?? "").trim(),
    email: (payload.email ?? "").trim(),
    mobileNo: (payload.mobileNo ?? "").trim().replace(/\s/g, ""),
    password: generateGuestPassword(),
    validateCustomer: false,
  });
  const res = data?.result ?? data;
  const message = (data?.message ?? res?.message ?? "").toLowerCase();
  const isFail =
    data?.success === false ||
    (data?.statusCode != null && data?.statusCode !== 200) ||
    message.includes("already exists") ||
    message.includes("duplicate");
  if (isFail) {
    const err = new Error(data?.message ?? res?.message ?? "Account already exists for this email.");
    err.code = "ACCOUNT_EXISTS";
    throw err;
  }
  const customerId = res?.CustomerId ?? res?.customerId ?? res?.Id ?? res?.id;
  if (customerId == null) throw new Error("Could not create customer. Please try again.");
  return { customerId: Number(customerId) };
}
