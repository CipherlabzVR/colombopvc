/**
 * E-Commerce customer API.
 * CreateECommerceCustomer, LoginECommerceCustomer
 */

import api from "@/lib/base/api";

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

  const data = await api.post("/ECommerce/CreateECommerceCustomer", body);
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
