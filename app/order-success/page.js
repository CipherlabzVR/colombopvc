"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { jsPDF } from "jspdf";
import { formatRs } from "@/components/shop/shopData";
import {
  PAYMENT_OPTION_LABELS,
  getOnlineOrdersByCustomerId,
  getAllCheckoutAddressByCustomerId,
} from "@/lib/checkoutApi";
import { getAllECommerceCustomers } from "@/lib/customerApi";
import {
  mapApiLineToReceiptItem,
  getOrderDiscountAmount,
  sumOrderLinesGross,
} from "@/lib/orderPromotionDisplay";

const AUTH_STORAGE_KEY = "colombo_pvc_user";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && (data.email || data.name || data.customerId != null) ? data : null;
  } catch {
    return null;
  }
}

function getPaymentLabel(value) {
  if (value == null) return "—";
  const n = Number(value);
  if (PAYMENT_OPTION_LABELS[n]) return PAYMENT_OPTION_LABELS[n];
  if (value === "cod") return "Cash on Delivery";
  if (value === "bank") return "Bank Transfer";
  return String(value);
}

/** Normalize API order (checkoutAddress, customer, lines, etc.) to display shape. */
function normalizeOrderFromApi(apiOrder, orderIdForFallback) {
  const addr = apiOrder.checkoutAddress ?? apiOrder.CheckoutAddress ?? {};
  const cust = apiOrder.customer ?? apiOrder.Customer ?? addr.customer ?? addr.Customer ?? {};
  let addressLine1 = addr.addressLine1 ?? addr.AddressLine1 ?? apiOrder.addressLine1 ?? apiOrder.AddressLine1 ?? "";
  let addressLine2 = addr.addressLine2 ?? addr.AddressLine2 ?? apiOrder.addressLine2 ?? apiOrder.AddressLine2 ?? "";
  let addressLine3 = addr.addressLine3 ?? addr.AddressLine3 ?? apiOrder.addressLine3 ?? apiOrder.AddressLine3 ?? "";
  const lines = apiOrder.lines ?? apiOrder.Lines ?? [];
  let firstName = cust.firstName ?? cust.FirstName ?? apiOrder.customerFirstName ?? apiOrder.CustomerFirstName ?? "";
  let lastName = cust.lastName ?? cust.LastName ?? apiOrder.customerLastName ?? apiOrder.CustomerLastName ?? "";
  const customerName = cust.fullName ?? cust.FullName ?? apiOrder.customerName ?? apiOrder.CustomerName ?? "";
  let [parsedFirst, parsedLast] = customerName ? customerName.trim().split(/\s+/, 2) : [firstName, lastName];
  let phone = addr.mobileNo ?? addr.MobileNo ?? cust.mobileNo ?? cust.MobileNo ?? cust.phone ?? cust.Phone ?? apiOrder.mobileNo ?? apiOrder.MobileNo ?? "";
  let email = addr.email ?? addr.Email ?? cust.email ?? cust.Email ?? apiOrder.email ?? apiOrder.Email ?? "";
  let notes = apiOrder.notes ?? apiOrder.Notes ?? "";

  const fallback = (() => {
    if (typeof window === "undefined") return null;
    try {
      const keysToTry = [
        orderIdForFallback && `order_${orderIdForFallback}`,
        apiOrder.orderId != null && `order_${apiOrder.orderId}`,
        apiOrder.orderNo && `order_${apiOrder.orderNo}`,
        apiOrder.OrderId != null && `order_${apiOrder.OrderId}`,
        apiOrder.OrderNo && `order_${apiOrder.OrderNo}`,
      ].filter(Boolean);
      for (const key of keysToTry) {
        const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
          return data;
        }
      }
      return null;
    } catch {
      return null;
    }
  })();

  if (fallback) {
    if (!firstName && !parsedFirst) {
      const parts = (fallback.firstName + " " + fallback.lastName).trim().split(/\s+/, 2);
      firstName = parts[0] ?? "";
      lastName = parts[1] ?? "";
    }
    if (!phone) phone = fallback.phone ?? "";
    if (!email) email = fallback.email ?? "";
    if (!addressLine1) addressLine1 = fallback.address ?? "";
    if (!addressLine2) addressLine2 = fallback.city ?? "";
    if (!addressLine3) addressLine3 = fallback.district ?? "";
    if (!notes) notes = fallback.notes ?? "";
  }

  const fullAddress = [addressLine1, addressLine2, addressLine3].filter(Boolean).join(", ");
  return {
    orderId: apiOrder.orderId ?? apiOrder.orderNo ?? apiOrder.OrderId ?? apiOrder.OrderNo,
    orderNo: apiOrder.orderNo ?? apiOrder.OrderNo ?? apiOrder.orderId ?? apiOrder.OrderId,
    date: apiOrder.createdOn ?? apiOrder.CreatedOn ?? apiOrder.date ?? new Date().toISOString(),
    customer: {
      firstName: firstName || parsedFirst || "",
      lastName: lastName || parsedLast || "",
      phone,
      email,
      address: fullAddress || "—",
      city: addressLine2 || "",
      district: addressLine3 || "",
      postalCode: addr.postalCode ?? addr.PostalCode ?? "",
      paymentMethod: apiOrder.paymentOption ?? apiOrder.PaymentOption,
      notes,
    },
    items: lines.map((line) => mapApiLineToReceiptItem(line)),
    subtotal: apiOrder.subTotal ?? apiOrder.SubTotal ?? 0,
    deliveryFee: apiOrder.deliveryCharge ?? apiOrder.DeliveryCharge ?? 0,
    total: apiOrder.netTotal ?? apiOrder.NetTotal ?? 0,
    discountAmount: getOrderDiscountAmount(apiOrder),
    merchandiseGross:
      getOrderDiscountAmount(apiOrder) > 0 ? sumOrderLinesGross(lines) : null,
  };
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const customerId = searchParams.get("customerId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId || !customerId) {
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    getOnlineOrdersByCustomerId(customerId)
      .then(async (list) => {
        const match = list.find(
          (o) =>
            String(o.orderId ?? o.OrderId) === orderId ||
            String(o.orderNo ?? o.OrderNo ?? "").toLowerCase() === orderId.toLowerCase()
        );
        if (!match) {
          setOrder(null);
          return;
        }
        let normalized = normalizeOrderFromApi(match, orderId);
        const orderCustomerId = match.customerId ?? match.CustomerId ?? customerId;

        const loggedInUser = getStoredUser();
        const isCurrentUserOrder =
          loggedInUser?.customerId != null &&
          orderCustomerId != null &&
          Number(loggedInUser.customerId) === Number(orderCustomerId);

        if (isCurrentUserOrder && (loggedInUser.firstName || loggedInUser.lastName || loggedInUser.name)) {
          const first = (loggedInUser.firstName ?? "").trim();
          const last = (loggedInUser.lastName ?? "").trim();
          const fullName = (loggedInUser.name ?? "").trim();
          const [parsedFirst, parsedLast] =
            first || last ? [first, last] : fullName ? fullName.split(/\s+/, 2) : ["", ""];
          if (parsedFirst || parsedLast) {
            normalized = {
              ...normalized,
              customer: {
                ...normalized.customer,
                firstName: parsedFirst || normalized.customer.firstName,
                lastName: parsedLast || normalized.customer.lastName,
              },
            };
          }
        } else if (orderCustomerId) {
          try {
            const res = await getAllECommerceCustomers({ maxResultCount: 100 });
            const customers = Array.isArray(res?.items) ? res.items : [];
            let cust = customers.find(
              (c) => Number(c.id ?? c.Id) === Number(orderCustomerId)
            );
            if (!cust && (normalized.customer.email || normalized.customer.phone)) {
              const email = (normalized.customer.email ?? "").trim().toLowerCase();
              const phone = (normalized.customer.phone ?? "").replace(/\s/g, "");
              cust = customers.find(
                (c) =>
                  (email && (c.email ?? c.Email ?? "").toLowerCase() === email) ||
                  (phone && (c.mobileNo ?? c.MobileNo ?? "").replace(/\s/g, "") === phone)
              );
            }
            if (cust) {
              const first = (cust.firstName ?? cust.FirstName ?? "").trim();
              const last = (cust.lastName ?? cust.LastName ?? "").trim();
              if (first || last) {
                normalized = {
                  ...normalized,
                  customer: {
                    ...normalized.customer,
                    firstName: first || normalized.customer.firstName,
                    lastName: last || normalized.customer.lastName,
                  },
                };
              }
            }
          } catch { /* ignore */ }
        }
        const needsAddress =
          !normalized.customer.address ||
          normalized.customer.address === "—" ||
          (!normalized.customer.firstName && !normalized.customer.lastName);
        if (needsAddress) {
          try {
            const addresses = await getAllCheckoutAddressByCustomerId(customerId);
            const addrId =
              match.checkoutAddressId ??
              match.CheckoutAddressId ??
              match.checkoutAddress?.id ??
              match.checkoutAddress?.Id;
            const addr = addrId
              ? addresses.find(
                  (a) =>
                    Number(a.id ?? a.Id ?? a.internalId ?? a.InternalId) === Number(addrId)
                )
              : addresses[addresses.length - 1];
            if (addr) {
              const a1 = addr.addressLine1 ?? addr.AddressLine1 ?? "";
              const a2 = addr.addressLine2 ?? addr.AddressLine2 ?? "";
              const a3 = addr.addressLine3 ?? addr.AddressLine3 ?? "";
              const fullAddr = [a1, a2, a3].filter(Boolean).join(", ");
              normalized = {
                ...normalized,
                customer: {
                  ...normalized.customer,
                  phone: normalized.customer.phone || (addr.mobileNo ?? addr.MobileNo ?? ""),
                  email: normalized.customer.email || (addr.email ?? addr.Email ?? ""),
                  address: fullAddr || normalized.customer.address,
                  city: normalized.customer.city || a2,
                  district: normalized.customer.district || a3,
                  postalCode: normalized.customer.postalCode || (addr.postalCode ?? addr.PostalCode ?? ""),
                },
              };
            }
          } catch { /* ignore */ }
        }
        setOrder(normalized);
      })
      .catch(() => {
        setError(true);
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderId, customerId]);

  function downloadOrderPdf() {
    if (!order) return;
    const doc = new jsPDF({ format: "a4", unit: "mm" });
    const margin = 18;
    let y = 20;
    const lineH = 6;
    const sectionGap = 4;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", margin, y);
    y += lineH + 4;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order.orderNo ?? order.orderId}`, margin, y);
    y += lineH + sectionGap;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("CUSTOMER", margin, y);
    y += lineH;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`${order.customer.firstName} ${order.customer.lastName}`, margin, y);
    y += lineH;
    doc.text(order.customer.phone, margin, y);
    y += lineH;
    if (order.customer.email) {
      doc.text(order.customer.email, margin, y);
      y += lineH;
    }
    y += sectionGap;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("DELIVERY ADDRESS", margin, y);
    y += lineH;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(order.customer.address || "—", margin, y);
    y += lineH;
    doc.text(`${order.customer.city || ""}, ${order.customer.district || ""}${order.customer.postalCode ? " " + order.customer.postalCode : ""}`.trim() || "—", margin, y);
    y += lineH + sectionGap;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("PAYMENT METHOD", margin, y);
    y += lineH;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(getPaymentLabel(order.customer.paymentMethod), margin, y);
    y += lineH + sectionGap;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("ORDER DATE", margin, y);
    y += lineH;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(order.date).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" }), margin, y);
    y += lineH + sectionGap;

    if (order.customer.notes) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 83, 9);
      doc.text("ORDER NOTES", margin, y);
      y += lineH;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const notesLines = doc.splitTextToSize(order.customer.notes, 180);
      doc.text(notesLines, margin, y);
      y += notesLines.length * lineH + sectionGap;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Items Ordered", margin, y);
    y += lineH + 2;

    order.items.forEach((item, idx) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const nameLine = `${idx + 1}. ${item.name}`;
      const nameLines = doc.splitTextToSize(nameLine, 120);
      const priceText = item.hasPromo
        ? `x${item.qty} ${formatRs(item.lineNet)} (was ${formatRs(item.lineGross)})`
        : `x${item.qty} ${formatRs(item.lineNet)}`;
      nameLines.forEach((line, i) => {
        doc.text(line, margin, y);
        if (i === 0) doc.text(priceText, margin + 120, y);
        y += lineH;
      });
    });
    y += sectionGap;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, 210 - margin, y);
    y += lineH;

    if (order.discountAmount > 0 && order.merchandiseGross != null) {
      doc.text("Order (before promo)", margin, y);
      doc.text(formatRs(order.merchandiseGross), margin + 140, y);
      y += lineH;
      doc.setTextColor(5, 150, 105);
      doc.text("Promotion savings", margin, y);
      doc.text(`-${formatRs(order.discountAmount)}`, margin + 140, y);
      doc.setTextColor(0, 0, 0);
      y += lineH;
    }
    doc.text("Subtotal", margin, y);
    doc.text(formatRs(order.subtotal), margin + 140, y);
    y += lineH;
    doc.text("Delivery", margin, y);
    doc.text(order.deliveryFee === 0 ? "FREE" : formatRs(order.deliveryFee), margin + 140, y);
    y += lineH;
    doc.setFont("helvetica", "bold");
    doc.text("Total", margin, y);
    doc.text(formatRs(order.total), margin + 140, y);

    doc.save(`Order-${order.orderNo ?? order.orderId}.pdf`);
  }

  function buildWhatsAppLink() {
    if (!order) return "#";
    const lines = [
      `*New Order - ${order.orderNo ?? order.orderId}*`,
      `Date: ${new Date(order.date).toLocaleString("en-LK")}`,
      "",
      `*Customer:* ${order.customer.firstName} ${order.customer.lastName}`,
      `*Phone:* ${order.customer.phone}`,
      order.customer.email ? `*Email:* ${order.customer.email}` : "",
      `*Address:* ${order.customer.address}, ${order.customer.city}, ${order.customer.district}${order.customer.postalCode ? " " + order.customer.postalCode : ""}`,
      "",
      "*Items:*",
      ...order.items.map((i, idx) => {
        const amt = i.hasPromo
          ? `${formatRs(i.lineNet)} (promo, list ${formatRs(i.lineGross)})`
          : formatRs(i.lineNet);
        return `${idx + 1}. ${i.name} x${i.qty} - ${amt}`;
      }),
      "",
      ...(order.discountAmount > 0 && order.merchandiseGross != null
        ? [
            `*Order:* ${formatRs(order.merchandiseGross)}`,
            `*Promotion savings:* -${formatRs(order.discountAmount)}`,
          ]
        : []),
      `*Subtotal:* ${formatRs(order.subtotal)}`,
      `*Delivery:* ${order.deliveryFee === 0 ? "FREE" : formatRs(order.deliveryFee)}`,
      `*Total:* ${formatRs(order.total)}`,
      `*Payment:* ${getPaymentLabel(order.customer.paymentMethod)}`,
      order.customer.notes ? `\n*Notes:* ${order.customer.notes}` : "",
    ].filter(Boolean).join("\n");

    return `https://wa.me/94987654321?text=${encodeURIComponent(lines)}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-600 mb-4" />
          <p className="text-slate-600">Loading order details...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h1>
          <p className="text-slate-500 mb-6">
            {!customerId
              ? "This link has expired or is invalid. Use the Order Status page and enter your order number to track your order."
              : error
                ? "We couldn't load the order. Please try again later."
                : "We couldn't find this order."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/order-status" className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-md transition-colors">
              Order Status
            </Link>
            <Link href="/shop" className="inline-flex items-center justify-center bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 font-semibold px-6 py-2.5 rounded-md transition-colors">
              Go to Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {["Cart", "Checkout", "Confirmation"].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2 text-emerald-600">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-600 text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                <span className="text-sm font-medium hidden sm:inline">{step}</span>
              </div>
              {idx < 2 && <div className="w-12 sm:w-20 h-0.5 mx-2 bg-emerald-600" />}
            </div>
          ))}
        </div>

        {/* Success Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-5 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Order Placed Successfully!</h1>
          <p className="text-slate-600 mt-2 max-w-md mx-auto">
            Thank you for your order. We will contact you shortly to confirm the details.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-slate-500">Order ID:</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{order.orderNo ?? order.orderId}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Order Details</h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Customer</p>
              <p className="text-sm font-medium text-slate-800">
                {(order.customer.firstName || order.customer.lastName)
                  ? `${(order.customer.firstName ?? "").trim()} ${(order.customer.lastName ?? "").trim()}`.trim()
                  : "—"}
              </p>
              {order.customer.phone && <p className="text-sm text-slate-600">{order.customer.phone}</p>}
              {order.customer.email && <p className="text-sm text-slate-600">{order.customer.email}</p>}
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Delivery Address</p>
              <p className="text-sm text-slate-800">{order.customer.address}</p>
              {(order.customer.city || order.customer.district || order.customer.postalCode) && (
                <p className="text-sm text-slate-600 mt-0.5">
                  {[order.customer.city, order.customer.district].filter(Boolean).join(", ")}
                  {order.customer.postalCode ? ` ${order.customer.postalCode}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Method</p>
              <p className="text-sm font-medium text-slate-800">
                {getPaymentLabel(order.customer.paymentMethod)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Order Date</p>
              <p className="text-sm font-medium text-slate-800">
                {new Date(order.date).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {order.customer.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Order Notes</p>
              <p className="text-sm text-amber-800">{order.customer.notes}</p>
            </div>
          )}

          {/* Items */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Items Ordered</p>
            <ul className="space-y-3">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">{idx + 1}</span>
                  <span className="flex-1 min-w-0 text-slate-800 truncate">{item.name}</span>
                  <span className="text-slate-500 shrink-0">x{item.qty}</span>
                  <span className="font-semibold text-slate-800 shrink-0 text-right">
                    {item.hasPromo ? (
                      <span className="inline-flex flex-col items-end">
                        <span className="text-xs font-medium text-slate-400 line-through">{formatRs(item.lineGross)}</span>
                        <span>{formatRs(item.lineNet)}</span>
                      </span>
                    ) : (
                      formatRs(item.lineNet)
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 mt-4 pt-4 space-y-2 text-sm">
            {order.discountAmount > 0 && order.merchandiseGross != null && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Order</span>
                  <span className="font-medium text-slate-800">{formatRs(order.merchandiseGross)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Promotion savings</span>
                  <span className="font-semibold">−{formatRs(order.discountAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">{formatRs(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span className="font-medium">{order.deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : formatRs(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>{formatRs(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          <button
            type="button"
            onClick={downloadOrderPdf}
            className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-md transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-6 py-3 rounded-md transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send via WhatsApp
          </a>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 font-semibold px-6 py-3 rounded-md transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
