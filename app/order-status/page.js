"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  completeOnlineOrderByCustomer,
  getOnlineOrdersByCustomerId,
  getOnlineOrderByOrderIdOrOrderNo,
} from "@/lib/checkoutApi";
import { formatRs } from "@/components/shop/shopData";

const AUTH_STORAGE_KEY = "colombo_pvc_user";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && (data.email || data.name) ? data : null;
  } catch {
    return null;
  }
}

const STATUS_STEPS = [
  { value: 1, label: "Queued" },
  { value: 2, label: "In Progress" },
  { value: 3, label: "Dispatched" },
  { value: 4, label: "Delivered" },
  { value: 5, label: "Completed" },
];

function StatusStepper({ currentStatus }) {
  const status = Number(currentStatus) || 1;
  return (
    <div className="flex items-center justify-between gap-1">
      {STATUS_STEPS.map((step, idx) => {
        const isActive = status >= step.value;
        const isCurrent = status === step.value;
        return (
          <div key={step.value} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 ${isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-300 ring-offset-2"
                    : isActive
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {isActive ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.value
                )}
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                />
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-medium ${isActive ? "text-slate-800" : "text-slate-400"}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, showDetails = true, viewer = null, onOrderUpdated }) {
  const [marking, setMarking] = useState(false);
  const [markError, setMarkError] = useState("");

  const status = Number(order.orderStatus ?? order.OrderStatus ?? 1);
  const orderId = order.orderId ?? order.id ?? order.OrderId;
  const orderNo = order.orderNo ?? order.orderNumber ?? order.OrderNo ?? orderId;
  const date = order.orderDate ?? order.date ?? order.CreatedOn ?? order.createdOn;
  const total = order.netTotal ?? order.NetTotal ?? order.total;
  const customer = order.customer ?? {};
  const items = order.items ?? order.lines ?? order.Lines ?? [];

  const orderCustomerId = Number(order.customerId ?? order.CustomerId);
  const viewerId =
    viewer?.customerId != null && viewer.customerId !== ""
      ? Number(viewer.customerId)
      : NaN;
  const viewerEmail = (viewer?.email ?? "").trim();
  const canMarkComplete =
    viewer != null &&
    Number.isFinite(viewerId) &&
    Number.isFinite(orderCustomerId) &&
    viewerId === orderCustomerId &&
    viewerEmail.length > 0 &&
    status === ORDER_STATUS.Delivered;

  async function handleMarkComplete() {
    if (!canMarkComplete || !orderId) return;
    setMarkError("");
    setMarking(true);
    try {
      await completeOnlineOrderByCustomer({
        orderId,
        customerId: viewerId,
        email: viewerEmail,
      });
      onOrderUpdated?.();
    } catch (e) {
      setMarkError(e?.message ?? "Something went wrong.");
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Order No
          </p>
          <p className="text-lg font-bold text-slate-900 font-mono">{orderNo}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            status === 5
              ? "bg-emerald-100 text-emerald-800"
              : status === 4
                ? "bg-violet-100 text-violet-800"
                : status === 3
                  ? "bg-sky-100 text-sky-800"
                  : status === 2
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
          }`}
        >
          {ORDER_STATUS_LABELS[status] ?? "Queued"}
        </span>
      </div>

      <StatusStepper currentStatus={status} />

      {canMarkComplete && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/90 p-4">
          <p className="text-sm text-slate-700 mb-3">
            Received your delivery? Confirm here to mark this order as completed. This matches what the store sees in the admin panel.
          </p>
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={marking}
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {marking ? "Saving…" : "Mark order as complete"}
          </button>
          {markError ? <p className="mt-2 text-sm text-red-600">{markError}</p> : null}
        </div>
      )}

      {showDetails && (
        <>
          {date && (
            <p className="mt-4 text-sm text-slate-600">
              Order date:{" "}
              {new Date(date).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {total != null && (
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Total: {formatRs(total)}
            </p>
          )}
          {(customer && (customer.firstName || customer.lastName)) || order.customerName ? (
            <p className="mt-1 text-sm text-slate-600">
              {customer && (customer.firstName || customer.lastName)
                ? [customer.firstName, customer.lastName].filter(Boolean).join(" ")
                : (order.customerName ?? "")}
            </p>
          ) : null}
              {Array.isArray(items) && items.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
              {items.slice(0, 3).map((item, idx) => (
                <li key={item.LineId ?? item.lineId ?? idx} className="flex justify-between gap-2">
                  <span className="truncate">
                    {item.name ?? item.ProductName ?? "Item"} x{item.qty ?? item.Quantity ?? 1}
                  </span>
                  <span className="shrink-0">
                    {formatRs(item.LineTotal ?? item.lineTotal ?? (item.price ?? item.Price ?? 0) * (item.qty ?? item.Quantity ?? 1))}
                  </span>
                </li>
              ))}
              {items.length > 3 && (
                <li className="text-slate-500">+{items.length - 3} more</li>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default function OrderStatusPage() {
  const [user, setUser] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [lookupMobile, setLookupMobile] = useState("");
  const [lookupOrder, setLookupOrder] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (!user?.customerId) return;
    setMyOrdersLoading(true);
    getOnlineOrdersByCustomerId(user.customerId)
      .then((list) => setMyOrders(Array.isArray(list) ? list : []))
      .catch(() => setMyOrders([]))
      .finally(() => setMyOrdersLoading(false));
  }, [user?.customerId]);

  const viewerForCard =
    user?.customerId != null && user?.email
      ? { customerId: user.customerId, email: user.email }
      : null;

  function refreshOrdersAfterCustomerComplete() {
    const id = searchId.trim();
    const mobile = lookupMobile.trim();
    if (id && mobile) {
      getOnlineOrderByOrderIdOrOrderNo(id, mobile)
        .then((o) => {
          if (o) setLookupOrder(o);
        })
        .catch(() => {});
    }
    if (user?.customerId) {
      getOnlineOrdersByCustomerId(user.customerId)
        .then((list) => setMyOrders(Array.isArray(list) ? list : []))
        .catch(() => {});
    }
  }

  function handleLookup(e) {
    e.preventDefault();
    const id = searchId.trim();
    const mobile = lookupMobile.trim();
    if (!id) {
      setLookupError("Please enter an order ID or order number.");
      return;
    }
    if (!mobile) {
      setLookupError("Mobile number is required.");
      return;
    }
    setLookupError("");
    setLookupOrder(null);
    setLookupLoading(true);

    getOnlineOrderByOrderIdOrOrderNo(id, mobile)
      .then((order) => {
        if (order) setLookupOrder(order);
        else setLookupError("Order not found. Check the order number or try again.");
      })
      .catch((err) => {
        setLookupError(err?.message ?? "Could not load order. Try again.");
      })
      .finally(() => setLookupLoading(false));
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-10">
        <nav className="text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-800 font-medium">Order Status</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Order Status
        </h1>
        <p className="text-slate-600 text-sm mb-8">
          Track your order with your order number and the mobile number you used at checkout. If you&apos;re signed in,
          you can also see your recent orders below.
        </p>

        {/* Lookup by Order ID + mobile */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Look up order</h2>
          <form onSubmit={handleLookup} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="min-w-0">
                <label htmlFor="order-lookup-id" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Order ID or order number
                </label>
                <input
                  id="order-lookup-id"
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Order ID"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="order-lookup-mobile" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Mobile number <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="order-lookup-mobile"
                  type="tel"
                  inputMode="tel"
                  value={lookupMobile}
                  onChange={(e) => setLookupMobile(e.target.value)}
                  placeholder="Enter mobile number used at checkout"
                  autoComplete="tel"
                  required
                  aria-required="true"
                  className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={lookupLoading}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm w-full sm:w-auto sm:self-start"
            >
              {lookupLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking...
                </>
              ) : (
                "Check Status"
              )}
            </button>
          </form>
          {lookupError && (
            <p className="mt-2 text-sm text-red-600">{lookupError}</p>
          )}
        </div>

        {/* Lookup result */}
        {lookupOrder && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Order details</h2>
            <OrderCard
              order={lookupOrder}
              showDetails={true}
              viewer={viewerForCard}
              onOrderUpdated={refreshOrdersAfterCustomerComplete}
            />
          </div>
        )}

        {/* My Orders (logged in) */}
        {user?.customerId && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">My orders</h2>
            {myOrdersLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <svg className="animate-spin h-8 w-8 text-emerald-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="ml-2 text-sm">Loading orders...</span>
              </div>
            ) : myOrders.length > 0 ? (
              <ul className="space-y-4">
                {myOrders.map((order, idx) => (
                  <li key={order.id ?? order.orderId ?? order.OrderId ?? idx}>
                    <OrderCard
                      order={order}
                      showDetails={true}
                      viewer={viewerForCard}
                      onOrderUpdated={refreshOrdersAfterCustomerComplete}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600">
                <p className="font-medium">No orders found</p>
                <p className="text-sm mt-1">Place an order from the shop to see it here.</p>
                <Link
                  href="/shop"
                  className="mt-4 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
                >
                  Go to Shop
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
