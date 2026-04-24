/**
 * Server-side WebXPay helpers for the Redirect Integration.
 *
 * Request:  encrypt "orderId|amount" with the RSA public key → base64 encode.
 * Response: base64 decode → RSA public-decrypt (verifies WebXPay's private-key signature).
 *
 * Must only be used in server-side code (API routes).
 */

import crypto from "crypto";

function getPublicKey() {
  const b64 = process.env.WEBXPAY_PUBLIC_KEY_B64 || "";
  if (!b64) throw new Error("WEBXPAY_PUBLIC_KEY_B64 is not set");
  const lines = b64.match(/.{1,64}/g) || [];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`;
}

/**
 * Encrypt the payment string (orderId|amount) with the WebXPay RSA public key.
 * WebXPay's PHP sample uses phpseclib Crypt_RSA which defaults to OAEP + SHA-1.
 */
export function encryptPayment(orderId, amount) {
  const paymentString = `${orderId}|${amount}`;
  const encrypted = crypto.publicEncrypt(
    {
      key: getPublicKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha1",
    },
    Buffer.from(paymentString),
  );
  return encrypted.toString("base64");
}

// NOTE: WebXPay refunds are intentionally NOT automated.
// When an order is cancelled, finance issues the refund manually from the
// WebXPay merchant dashboard. The cancellation row on the ERP records that a
// refund is owed; nothing in code talks to the gateway for refunds.

/**
 * Decode the plain callback payment payload.
 * WebXPay redirect responses send `payment` as base64 text.
 */
export function decodePaymentResponse(encoded) {
  return Buffer.from(encoded, "base64").toString();
}

/**
 * Decrypt a WebXPay signature value.
 * WebXPay signs the response with their private key; we verify with the public key.
 */
export function decryptResponse(encoded) {
  const decoded = Buffer.from(encoded, "base64");
  const decrypted = crypto.publicDecrypt(
    { key: getPublicKey(), padding: crypto.constants.RSA_PKCS1_PADDING },
    decoded,
  );
  return decrypted.toString();
}

/**
 * Verify that the payment and signature from WebXPay's callback match.
 */
export function verifySignature(paymentParam, signatureParam) {
  try {
    const p = decodePaymentResponse(paymentParam);
    const s = decryptResponse(signatureParam);
    return p === s;
  } catch {
    return false;
  }
}

/**
 * Base64-encode custom fields (pipe-delimited).
 */
export function encodeCustomFields(...fields) {
  return Buffer.from(fields.join("|")).toString("base64");
}

/**
 * Decode custom fields from a WebXPay callback.
 */
export function decodeCustomFields(encoded) {
  return Buffer.from(encoded, "base64").toString().split("|");
}

/**
 * Parse the WebXPay callback payment response string.
 * Format: order_id|order_reference_number|date_time_transaction|status_code|comment|payment_gateway_used
 *
 * WebXPay staging sometimes sends the status and comment combined in parts[3]
 * e.g. "00 - Approved" instead of separate "00" and "Approved" fields.
 */
export function parsePaymentResponse(paymentString) {
  const parts = paymentString.split("|");

  // Extract the raw status field and pull just the leading numeric code
  // handles: "0", "00", "00 - Approved", "0 - Transaction Approved", "15", etc.
  const rawStatus = (parts[3] ?? "").trim();
  const statusCode = rawStatus.split(/[\s\-]+/)[0].trim();
  const isSuccess = statusCode === "0" || statusCode === "00";

  // If status and comment were combined (e.g. "00 - Approved"), rebuild a clean comment
  const hasSeparateComment = parts.length >= 6 || (parts[4] ?? "").length > 0;
  const comment = hasSeparateComment
    ? (parts[4] ?? "").trim()
    : rawStatus.replace(/^0+\s*[-–]?\s*/i, "").trim();

  return {
    orderId: (parts[0] ?? "").trim(),
    referenceNumber: (parts[1] ?? "").trim(),
    dateTime: (parts[2] ?? "").trim(),
    statusCode,
    comment: comment || rawStatus,
    gateway: (parts[5] ?? parts[4] ?? "").trim(),
    isSuccess,
  };
}
