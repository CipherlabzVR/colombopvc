"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  createOnlineOrder,
  getOnlineOrdersByCustomerId,
} from "@/lib/checkoutApi";

function WebXPayCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { removeFromCart, setCheckoutSelection, clearCart } = useCart();
  const [message, setMessage] = useState("Finalizing your payment...");
  const [error, setError] = useState("");

  // Guard against React StrictMode double-invocation and cart state re-renders
  // both of which would otherwise call createOnlineOrder twice.
  const didFinalizeRef = useRef(false);

  useEffect(() => {
    // Only ever run once per page mount — exit immediately on any re-run.
    if (didFinalizeRef.current) return;

    const paymentStatus = searchParams.get("paymentStatus");
    const orderRef = searchParams.get("orderRef");
    const customerIdFromQuery = searchParams.get("customerId");
    const paymentComment = searchParams.get("paymentComment");
    const gatewayRef = searchParams.get("ref");

    if (!orderRef) {
      setError("Payment reference is missing.");
      return;
    }

    if (paymentStatus !== "success") {
      setError(paymentComment || "Payment was not completed.");
      try {
        const pendingKey = `webxpay_pending_${orderRef}`;
        sessionStorage.removeItem(pendingKey);
        localStorage.removeItem(pendingKey);
      } catch { /* ignore */ }
      return;
    }

    // Mark as started before the first await so concurrent calls bail out immediately.
    didFinalizeRef.current = true;

    let cancelled = false;

    async function finalizeOrder() {
      try {
        const pendingKey = `webxpay_pending_${orderRef}`;
        const raw =
          sessionStorage.getItem(pendingKey) ??
          localStorage.getItem(pendingKey);

        if (!raw) {
          throw new Error("We could not find the pending checkout details for this payment.");
        }

        const pending = JSON.parse(raw);
        const effectiveCustomerId = Number(
          pending.customerId ?? customerIdFromQuery ?? 0,
        );
        const checkoutAddressId = Number(pending.checkoutAddressId ?? 0);

        if (!effectiveCustomerId || !checkoutAddressId) {
          throw new Error("The checkout details are incomplete. Please contact support with your payment reference.");
        }

        setMessage("Payment confirmed. Creating your order...");

        const orderRes = await createOnlineOrder({
          ...pending.orderPayload,
          OrderNo: pending.orderRef || orderRef,
          CustomerId: effectiveCustomerId,
          CheckoutAddressId: checkoutAddressId,
        });

        const apiOrderId =
          orderRes?.result?.OrderId ??
          orderRes?.result?.orderId ??
          orderRes?.data?.OrderId ??
          orderRes?.OrderId ??
          orderRes?.orderId ??
          orderRes?.items?.[0]?.orderId ??
          orderRes?.items?.[0]?.OrderId;
        let apiOrderNo =
          orderRes?.result?.OrderNo ??
          orderRes?.result?.orderNo ??
          orderRes?.data?.OrderNo ??
          orderRes?.OrderNo ??
          orderRes?.orderNo ??
          orderRes?.items?.[0]?.orderNo ??
          orderRes?.items?.[0]?.OrderNo ??
          orderRes?.result?.items?.[0]?.orderNo ??
          orderRes?.result?.items?.[0]?.OrderNo;

        let orderIdDisplay = pending.orderRef || orderRef;
        if (apiOrderId != null) orderIdDisplay = String(apiOrderId);
        if (apiOrderNo != null && apiOrderNo !== "") orderIdDisplay = String(apiOrderNo);

        if ((apiOrderNo == null || apiOrderNo === "") && effectiveCustomerId != null && apiOrderId != null) {
          try {
            const list = await getOnlineOrdersByCustomerId(effectiveCustomerId);
            const created = list.find(
              (o) => Number(o.orderId ?? o.OrderId) === Number(apiOrderId),
            );
            const no = created?.orderNo ?? created?.OrderNo;
            if (no != null && no !== "") {
              apiOrderNo = String(no);
              orderIdDisplay = apiOrderNo;
            }
          } catch { /* ignore */ }
        }

        try {
          const orderKey = `order_${orderIdDisplay}`;
          const snap = JSON.stringify(pending.checkoutSnapshot ?? {});
          sessionStorage.setItem(orderKey, snap);
          localStorage.setItem(orderKey, snap);
          sessionStorage.removeItem(pendingKey);
          localStorage.removeItem(pendingKey);
        } catch { /* ignore */ }

        if (!cancelled) {
          const slugs = pending.checkoutSlugs;
          if (Array.isArray(slugs) && slugs.length > 0) {
            slugs.forEach((slug) => removeFromCart(slug));
          } else {
            clearCart();
          }
          setCheckoutSelection(null);

          const query = new URLSearchParams({ id: orderIdDisplay });
          query.set("customerId", String(effectiveCustomerId));
          query.set("paymentStatus", "success");
          if (gatewayRef) query.set("ref", gatewayRef);
          router.replace(`/order-success?${query.toString()}`);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? "We couldn't create your order after payment.");
        }
      }
    }

    finalizeOrder();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
        {error ? (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Payment Not Completed</h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <div className="mt-5">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Back to Checkout
              </Link>
            </div>
          </>
        ) : (
          <>
            <svg className="mx-auto mb-4 h-8 w-8 animate-spin text-emerald-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <h1 className="text-xl font-bold text-slate-900">Completing Your Order</h1>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </>
        )}
      </div>
    </main>
  );
}

function WebXPayCompleteFallback() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
        <svg className="mx-auto mb-4 h-8 w-8 animate-spin text-emerald-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h1 className="text-xl font-bold text-slate-900">Completing Your Order</h1>
        <p className="mt-2 text-sm text-slate-600">Finalizing your payment...</p>
      </div>
    </main>
  );
}

export default function WebXPayCompletePage() {
  return (
    <Suspense fallback={<WebXPayCompleteFallback />}>
      <WebXPayCompleteContent />
    </Suspense>
  );
}
