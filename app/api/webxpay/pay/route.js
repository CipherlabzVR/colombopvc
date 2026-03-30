import { NextResponse } from "next/server";
import { encryptPayment, encodeCustomFields } from "@/lib/webxpay/api";

/**
 * Build the encrypted form data needed to redirect the customer to WebXPay's
 * hosted payment page (Redirect Integration).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, amount, currency, customer, customerId } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, amount" },
        { status: 400 },
      );
    }

    const encryptedPayment = encryptPayment(orderId, amount);
    const customFields = encodeCustomFields(
      String(orderId),
      String(customerId ?? ""),
    );

    const formData = {
      first_name: customer?.firstName ?? "",
      last_name: customer?.lastName ?? "",
      email: customer?.email ?? "",
      contact_number: customer?.contactNumber ?? "",
      address_line_one: customer?.addressLineOne ?? "",
      address_line_two: customer?.city ?? "",
      city: customer?.city ?? "",
      country: "Sri Lanka",
      postal_code: customer?.postalCode ?? "",
      secret_key: process.env.WEBXPAY_SECRET_KEY ?? "",
      payment: encryptedPayment,
      cms: "PHP",
      process_currency: currency || "LKR",
      custom_feilds: customFields,
    };

    const gatewayUrl =
      process.env.NEXT_PUBLIC_WEBXPAY_GATEWAY_URL ||
      "https://stagingxpay.info/index.php?route=checkout/billing";

    return NextResponse.json({ formData, gatewayUrl });
  } catch (err) {
    console.error("[WebXPay pay]", err);
    return NextResponse.json(
      { error: err.message || "Failed to prepare payment" },
      { status: 500 },
    );
  }
}
