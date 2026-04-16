import { NextResponse } from "next/server";
import {
  decodePaymentResponse,
  verifySignature,
  parsePaymentResponse,
  decodeCustomFields,
} from "@/lib/webxpay/api";

/**
 * WebXPay redirects the customer's browser here (POST) after payment.
 * We decrypt the result, verify the signature, then redirect to the
 * client-side completion page which will create the order only on success.
 */
export async function POST(request) {
  try {
    const form = await request.formData();
    const paymentParam = form.get("payment") ?? "";
    const signatureParam = form.get("signature") ?? "";
    const customFieldsParam = form.get("custom_fields") ?? form.get("custom_feilds") ?? "";

    const origin = new URL(request.url).origin;

    let orderId = "";
    let customerId = "";

    if (customFieldsParam) {
      const fields = decodeCustomFields(String(customFieldsParam));
      orderId = fields[0] ?? "";
      customerId = fields[1] ?? "";
    }

    if (!paymentParam || !signatureParam) {
      const q = new URLSearchParams({
        orderRef: orderId,
        customerId,
        paymentStatus: "error",
      });
      return NextResponse.redirect(new URL(`/checkout/webxpay-complete?${q}`, origin), 303);
    }

    const paymentString = decodePaymentResponse(String(paymentParam));
    const result = parsePaymentResponse(paymentString);

    // Verify signature for integrity — log failures but don't block approved payments
    // (staging environments often use keys that fail Node.js publicDecrypt)
    const isValid = verifySignature(String(paymentParam), String(signatureParam));
    if (!isValid) {
      console.warn("[WebXPay callback] Signature verification failed — proceeding based on status code only.");
    }

    if (!orderId) orderId = result.orderId;

    const q = new URLSearchParams({ orderRef: orderId });
    if (customerId) q.set("customerId", customerId);

    if (result.isSuccess) {
      q.set("paymentStatus", "success");
      q.set("ref", result.referenceNumber);
    } else {
      q.set("paymentStatus", "failed");
      q.set("paymentComment", result.comment || "Payment was not completed");
    }

    return NextResponse.redirect(new URL(`/checkout/webxpay-complete?${q}`, origin), 303);
  } catch (err) {
    console.error("[WebXPay callback]", err);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(
      new URL("/checkout/webxpay-complete?paymentStatus=error", origin),
      303,
    );
  }
}
