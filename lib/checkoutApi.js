/**
 * Checkout / address API.
 * CreateCheckoutAddress, GetAllCheckoutAddressByCustomerId, CreateOnlineOrder, Order status
 */

import api from "@/lib/base/api";

/** ECommerceOrderStatus: Queued=1, InProgress=2, Dispatched=3, Delivered=4, Completed=5 */
export const ORDER_STATUS = {
  Queued: 1,
  InProgress: 2,
  Dispatched: 3,
  Delivered: 4,
  Completed: 5,
};

export const ORDER_STATUS_LABELS = {
  1: "Queued",
  2: "In Progress",
  3: "Dispatched",
  4: "Delivered",
  5: "Completed",
};

/** Backend JsonStringEnumConverter sends names like "InProgress", not numeric 2. */
const ORDER_STATUS_NAME_TO_NUM = {
  queued: 1,
  inprogress: 2,
  dispatched: 3,
  delivered: 4,
  completed: 5,
};

function normalizeEnumKey(raw) {
  if (raw == null) return "";
  const s = String(raw).trim();
  const tail = s.includes(".") ? s.split(".").pop() : s;
  return tail.replace(/\s+/g, "").toLowerCase();
}

/**
 * Normalize API order status (number 1–5, numeric string, or enum name).
 * @param {*} raw - orderStatus / OrderStatus from API
 * @returns {number} 1–5, or NaN if unrecognized
 */
export function parseOrderStatus(raw) {
  if (raw == null || raw === "") return NaN;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw >= 1 && raw <= 5 ? raw : NaN;
  }
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1 && n <= 5) return n;
    const key = normalizeEnumKey(raw);
    if (ORDER_STATUS_NAME_TO_NUM[key] != null) return ORDER_STATUS_NAME_TO_NUM[key];
  }
  return NaN;
}

/** PaymentOptions enum from backend: CashOnDelivery=1, Card=2, BankTransfer=3 */
export const PAYMENT_OPTIONS = {
  CashOnDelivery: 1,
  Card: 2,
  BankTransfer: 3,
};

export const PAYMENT_OPTION_LABELS = {
  1: "Cash on Delivery",
  2: "Card",
  3: "Bank Transfer",
};

/**
 * GET /ECommerce/GetOnlineOrdersByCustomerId?customerId={customerId}
 * Returns list of OnlineOrderResponse (OrderId, OrderNo, OrderStatus, Lines, SubTotal, DeliveryCharge, NetTotal, CreatedOn, etc.)
 * @param {number} customerId
 * @returns {Promise<Array>} List of orders
 */
export async function getOnlineOrdersByCustomerId(customerId) {
  const data = await api.get("/ECommerce/GetOnlineOrdersByCustomerId", {
    customerId: Number(customerId),
  });
  const raw = data?.result ?? data;
  const list = Array.isArray(raw) ? raw : (raw?.items ?? data?.items ?? []);
  return Array.isArray(list) ? list : [];
}

/**
 * GET /ECommerce/GetOnlineOrderByOrderIdOrOrderNo?orderIdOrNo=&mobileNo=
 * Look up a single order by Order ID or Order No. Mobile number is required and must match checkout mobile.
 * @param {string} orderIdOrNo - Order ID (numeric) or Order No (e.g. invoice number)
 * @param {string} mobileNo - Mobile number used at checkout (required)
 * @returns {Promise<object|null>} Single order (OnlineOrderResponse) or null if not found
 * @throws {Error} On API failure (wrong mobile, validation, etc.) with message from server
 */
export async function getOnlineOrderByOrderIdOrOrderNo(orderIdOrNo, mobileNo) {
  const id = String(orderIdOrNo ?? "").trim();
  const mobile = String(mobileNo ?? "").trim();
  if (!id || !mobile) return null;
  const data = await api.get("/ECommerce/GetOnlineOrderByOrderIdOrOrderNo", {
    orderIdOrNo: id,
    mobileNo: mobile,
  });
  const code = data?.statusCode ?? data?.StatusCode;
  const failed =
    code === -99 ||
    code === "-99" ||
    code === "FAILED" ||
    (typeof code === "string" && code.toUpperCase() === "FAILED");
  if (failed) {
    throw new Error(data?.message ?? data?.Message ?? "Request failed");
  }
  const raw = data?.result ?? data?.Result ?? data;
  return raw && typeof raw === "object" ? raw : null;
}

/**
 * GET /ECommerce/GetAllCheckoutAddressByCustomerId?customerId={customerId}
 * @param {number} customerId
 * @returns {Promise<Array>} List of CheckoutAddress (e.g. [{ Id, AddressLine1, AddressLine2, AddressLine3, MobileNo, Email, PostalCode, ... }])
 */
export async function getAllCheckoutAddressByCustomerId(customerId) {
  const data = await api.get("/ECommerce/GetAllCheckoutAddressByCustomerId", {
    customerId: Number(customerId),
  });
  const list = data?.result ?? data;
  return Array.isArray(list) ? list : [];
}

/**
 * POST /ECommerce/CreateCheckoutAddress
 * @param {Object} payload
 * @param {number} payload.CustomerId
 * @param {string} payload.AddressLine1
 * @param {string} payload.AddressLine2
 * @param {string} payload.AddressLine3
 * @param {string} payload.MobileNo
 * @param {string} payload.Email
 * @param {string} payload.PostalCode
 * @param {boolean} [payload.IsActive]
 * @returns {Promise<object>} API response
 */
export async function createCheckoutAddress(payload) {
  const body = {
    CustomerId: payload.CustomerId,
    AddressLine1: payload.AddressLine1 ?? "",
    AddressLine2: payload.AddressLine2 ?? "",
    AddressLine3: payload.AddressLine3 ?? "",
    MobileNo: payload.MobileNo ?? "",
    Email: payload.Email ?? "",
    PostalCode: payload.PostalCode ?? "",
    IsActive: payload.IsActive !== false,
  };
  const data = await api.post("/ECommerce/CreateCheckoutAddress", body);
  return data;
}

/**
 * POST /ECommerce/UpdateCheckoutAddress
 * @param {Object} payload
 * @param {number} payload.Id - CheckoutAddress id
 * @param {number} payload.CustomerId
 * @param {string} payload.AddressLine1
 * @param {string} payload.AddressLine2
 * @param {string} payload.AddressLine3
 * @param {string} payload.MobileNo
 * @param {string} payload.Email
 * @param {string} payload.PostalCode
 * @param {boolean} [payload.IsActive]
 */
export async function updateCheckoutAddress(payload) {
  const body = {
    Id: Number(payload.Id),
    CustomerId: Number(payload.CustomerId),
    AddressLine1: payload.AddressLine1 ?? "",
    AddressLine2: payload.AddressLine2 ?? "",
    AddressLine3: payload.AddressLine3 ?? "",
    MobileNo: payload.MobileNo ?? "",
    Email: payload.Email ?? "",
    PostalCode: payload.PostalCode ?? "",
    IsActive: payload.IsActive !== false,
  };
  const data = await api.post("/ECommerce/UpdateCheckoutAddress", body);
  return data;
}

/**
 * POST /ECommerce/CreateOnlineOrder
 * @param {Object} payload - CreateOnlineOrderRequest
 * @param {string} [payload.OrderNo]
 * @param {number} payload.CustomerId
 * @param {number} payload.CheckoutAddressId
 * @param {number} payload.SubTotal
 * @param {number} payload.DeliveryCharge
 * @param {number} payload.NetTotal
 * @param {number} [payload.DiscountRate]
 * @param {number} [payload.DiscountAmount]
 * @param {number} [payload.OrderStatus] - ECommerceOrderStatus; omit or use 1 (Queued)
 * @param {number} payload.PaymentOption - PaymentOptions: 1 CashOnDelivery, 2 Card, 3 BankTransfer
 * @param {Array<{ ProductId: number, ProductName: string, Price: number, Quantity: number, LineTotal: number }>} payload.Lines
 * @returns {Promise<{ result?: { OrderId: number }, orderId?: number }>}
 */
export async function createOnlineOrder(payload) {
  const body = {
    OrderNo: payload.OrderNo ?? "",
    CustomerId: Number(payload.CustomerId),
    CheckoutAddressId: Number(payload.CheckoutAddressId),
    SubTotal: Number(payload.SubTotal),
    DeliveryCharge: Number(payload.DeliveryCharge),
    NetTotal: Number(payload.NetTotal),
    DiscountRate: payload.DiscountRate ?? null,
    DiscountAmount: payload.DiscountAmount ?? null,
    OrderStatus: payload.OrderStatus ?? ORDER_STATUS.Queued,
    PaymentOption: Number(payload.PaymentOption),
    CouponCode:
      payload.CouponCode != null && String(payload.CouponCode).trim() !== ""
        ? String(payload.CouponCode).trim()
        : null,
    Lines: Array.isArray(payload.Lines)
      ? payload.Lines.map((line) => ({
          ProductId: Number(line.ProductId),
          ProductName: String(line.ProductName ?? ""),
          Price: Number(line.Price),
          Quantity: Number(line.Quantity),
          LineTotal: Number(line.LineTotal),
          PromotionId:
            line.PromotionId != null && line.PromotionId !== ""
              ? Number(line.PromotionId)
              : null,
          DiscountAmount:
            line.DiscountAmount != null && line.DiscountAmount !== ""
              ? Number(line.DiscountAmount)
              : null,
          TotalDiscount:
            line.TotalDiscount != null && line.TotalDiscount !== ""
              ? Number(line.TotalDiscount)
              : null,
          SubTotal:
            line.SubTotal != null && line.SubTotal !== ""
              ? Number(line.SubTotal)
              : null,
        }))
      : [],
  };
  const data = await api.post("/ECommerce/CreateOnlineOrder", body);
  return data;
}

/**
 * POST /ECommerce/CompleteOnlineOrderByCustomer
 * Customer confirms receipt: Delivered (4) → Completed (5). Requires matching customerId + email.
 * @param {{ orderId: number, customerId: number, email: string }} params
 */
export async function completeOnlineOrderByCustomer({ orderId, customerId, email }) {
  const data = await api.post("/ECommerce/CompleteOnlineOrderByCustomer", {
    orderId: Number(orderId),
    customerId: Number(customerId),
    email: String(email ?? "").trim(),
  });
  const code = data?.statusCode ?? data?.StatusCode;
  if (code === -99 || code === "FAILED") {
    throw new Error(data?.message ?? data?.Message ?? "Could not update order.");
  }
  return data;
}

/**
 * POST /ECommerce/SubmitOnlineOrderCustomerFeedback
 * Completed orders only; one submission per order. Same customerId + email as account.
 * @param {{ orderId: number, customerId: number, email: string, feedback: string }} params
 */
export async function submitOnlineOrderCustomerFeedback({ orderId, customerId, email, feedback }) {
  const data = await api.post("/ECommerce/SubmitOnlineOrderCustomerFeedback", {
    orderId: Number(orderId),
    customerId: Number(customerId),
    email: String(email ?? "").trim(),
    feedback: String(feedback ?? "").trim(),
  });
  const code = data?.statusCode ?? data?.StatusCode;
  if (code === -99 || code === "FAILED") {
    throw new Error(data?.message ?? data?.Message ?? "Could not save feedback.");
  }
  return data;
}
