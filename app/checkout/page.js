"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatRs } from "@/components/shop/shopData";
import { DISTRICTS } from "@/lib/constants/districts";
import {
  getAllCheckoutAddressByCustomerId,
  createCheckoutAddress,
  createOnlineOrder,
  getOnlineOrdersByCustomerId,
  PAYMENT_OPTIONS,
  PAYMENT_OPTION_LABELS,
} from "@/lib/checkoutApi";
import { createGuestCustomerForCheckout } from "@/lib/customerApi";
import CheckoutAuthModal from "@/components/CheckoutAuthModal";
import AddDeliveryAddressModal from "@/components/AddDeliveryAddressModal";

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

const DELIVERY_FEE = 350;
const FREE_DELIVERY_MIN = 5000;

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CPV-${ts}-${rand}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { itemsForCheckout, removeFromCart, setCheckoutSelection } = useCart();

  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [guestCheckoutAccepted, setGuestCheckoutAccepted] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    notes: "",
    paymentMethod: PAYMENT_OPTIONS.CashOnDelivery,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setAuthChecked(true);
  }, []);

  // Pre-fill contact info when user is set (e.g. after sign-in or on load)
  useEffect(() => {
    if (!user) return;
    setForm((prev) => {
      const namePart = (user.name || "").trim().split(/\s+/);
      const first = (user.firstName || namePart[0] || "").trim();
      const last = (user.lastName || namePart.slice(1).join(" ") || "").trim();
      const email = (user.email || "").trim();
      const phone = (user.mobileNo || user.phone || user.phoneNumber || "").trim().replace(/\s/g, "");
      return {
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
        email: prev.email || email,
        phone: prev.phone || phone,
      };
    });
  }, [user]);

  // Fetch saved delivery addresses for logged-in customer
  useEffect(() => {
    const cid = user?.customerId;
    if (cid == null || cid === "") return;
    setAddressesLoading(true);
    getAllCheckoutAddressByCustomerId(cid)
      .then((list) => {
        setSavedAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId((prev) => {
            const exists = list.some(
              (a) => (a.id ?? a.Id) === prev || (a.internalId ?? a.InternalId) === prev
            );
            if (exists) return prev;
            const first = list[0];
            return first.id ?? first.Id ?? first.internalId ?? first.InternalId ?? prev;
          });
        } else {
          setSelectedAddressId(null);
        }
      })
      .catch(() => setSavedAddresses([]))
      .finally(() => setAddressesLoading(false));
  }, [user?.customerId]);

  // When selected address changes, fill form from that address
  useEffect(() => {
    if (!selectedAddressId || savedAddresses.length === 0) return;
    const addr = savedAddresses.find(
      (a) => (a.id ?? a.Id) === selectedAddressId || (a.internalId ?? a.InternalId) === selectedAddressId
    );
    if (!addr) return;
    const line1 = addr.addressLine1 ?? addr.AddressLine1 ?? "";
    const line2 = addr.addressLine2 ?? addr.AddressLine2 ?? "";
    const line3 = addr.addressLine3 ?? addr.AddressLine3 ?? "";
    setForm((prev) => ({
      ...prev,
      address: line1,
      city: line2,
      district: line3,
      postalCode: (addr.postalCode ?? addr.PostalCode ?? "").trim(),
      phone: (addr.mobileNo ?? addr.MobileNo ?? addr.phone ?? "").trim().replace(/\s/g, "") || prev.phone,
      email: (addr.email ?? addr.Email ?? "").trim() || prev.email,
    }));
  }, [selectedAddressId, savedAddresses]);

  const totalItems = itemsForCheckout.reduce((s, i) => s + i.qty, 0);
  const totalPrice = itemsForCheckout.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = totalPrice >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const grandTotal = totalPrice + deliveryFee;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "paymentMethod" ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid 10-digit phone number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.district) errs.district = "Please select a district";
    return errs;
  }

  const lines = itemsForCheckout.map((i) => ({
    ProductId: i.id ?? 0,
    ProductName: i.name ?? "",
    Price: Number(i.price),
    Quantity: Number(i.qty),
    LineTotal: Number(i.price) * Number(i.qty),
  }));

  const paymentOption = Number(form.paymentMethod) || PAYMENT_OPTIONS.CashOnDelivery;

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (lines.length === 0) {
      setErrors({ form: "Cart is empty." });
      return;
    }

    setSubmitting(true);
    setErrors({});

    const orderPayload = {
      SubTotal: totalPrice,
      DeliveryCharge: deliveryFee,
      NetTotal: grandTotal,
      DiscountRate: null,
      DiscountAmount: null,
      OrderStatus: 1,
      PaymentOption: paymentOption,
      Lines: lines,
    };

    let customerId;
    let checkoutAddressId;
    let orderIdDisplay = generateOrderId();

    try {
      if (user?.customerId != null) {
        customerId = Number(user.customerId);
        const addrId = selectedAddressId ?? savedAddresses[0]?.id ?? savedAddresses[0]?.Id;
        if (addrId == null) {
          setErrors({ form: "Please select or add a delivery address." });
          setSubmitting(false);
          return;
        }
        checkoutAddressId = Number(addrId);
      } else {
        try {
          const guestRes = await createGuestCustomerForCheckout({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            mobileNo: form.phone.trim().replace(/\s/g, ""),
          });
          customerId = guestRes.customerId;
        } catch (guestErr) {
          if (guestErr?.code === "ACCOUNT_EXISTS" || (guestErr?.message ?? "").toLowerCase().includes("already exists")) {
            setErrors({ form: "An account already exists for this email. Please sign in to place your order." });
          } else {
            setErrors({ form: guestErr?.message ?? "Could not create customer. Please try again or sign in." });
          }
          setSubmitting(false);
          return;
        }

        await createCheckoutAddress({
          CustomerId: customerId,
          AddressLine1: form.address.trim(),
          AddressLine2: form.city.trim(),
          AddressLine3: form.district.trim(),
          MobileNo: form.phone.trim().replace(/\s/g, ""),
          Email: form.email.trim(),
          PostalCode: (form.postalCode ?? "").trim(),
          IsActive: true,
        });

        const addressList = await getAllCheckoutAddressByCustomerId(customerId);
        const latest = addressList.length > 0 ? addressList[addressList.length - 1] : null;
        checkoutAddressId = latest
          ? Number(latest.id ?? latest.Id ?? latest.internalId ?? latest.InternalId)
          : null;
        if (checkoutAddressId == null) {
          setErrors({ form: "Address was saved but could not be linked. Please try again." });
          setSubmitting(false);
          return;
        }
      }

      const orderRes = await createOnlineOrder({
        ...orderPayload,
        CustomerId: customerId,
        CheckoutAddressId: checkoutAddressId,
      });

      const apiOrderId = orderRes?.result?.OrderId ?? orderRes?.result?.orderId ?? orderRes?.data?.OrderId ?? orderRes?.OrderId ?? orderRes?.orderId ?? orderRes?.items?.[0]?.orderId ?? orderRes?.items?.[0]?.OrderId;
      let apiOrderNo = orderRes?.result?.OrderNo ?? orderRes?.result?.orderNo ?? orderRes?.data?.OrderNo ?? orderRes?.OrderNo ?? orderRes?.orderNo ?? orderRes?.items?.[0]?.orderNo ?? orderRes?.items?.[0]?.OrderNo ?? orderRes?.result?.items?.[0]?.orderNo ?? orderRes?.result?.items?.[0]?.OrderNo;
      if (apiOrderId != null) orderIdDisplay = String(apiOrderId);
      if (apiOrderNo != null && apiOrderNo !== "") orderIdDisplay = String(apiOrderNo);

      // If create response didn't include orderNo, fetch customer orders to get it (API returns OrderNo from GetOnlineOrdersByCustomerId)
      if ((apiOrderNo == null || apiOrderNo === "") && customerId != null && apiOrderId != null) {
        try {
          const list = await getOnlineOrdersByCustomerId(customerId);
          const created = list.find(
            (o) => Number(o.orderId ?? o.OrderId) === Number(apiOrderId)
          );
          const no = created?.orderNo ?? created?.OrderNo;
          if (no != null && no !== "") {
            apiOrderNo = String(no);
            orderIdDisplay = apiOrderNo;
          }
        } catch { /* ignore */ }
      }

      itemsForCheckout.forEach((i) => removeFromCart(i.slug));
      setCheckoutSelection(null);
      try {
        const checkoutSnapshot = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim().replace(/\s/g, ""),
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          postalCode: (form.postalCode ?? "").trim(),
          notes: (form.notes ?? "").trim(),
        };
        const key = `order_${orderIdDisplay}`;
        sessionStorage.setItem(key, JSON.stringify(checkoutSnapshot));
        localStorage.setItem(key, JSON.stringify(checkoutSnapshot));
      } catch { /* ignore */ }
      const query = new URLSearchParams({ id: orderIdDisplay });
      if (customerId != null) query.set("customerId", String(customerId));
      router.push(`/order-success?${query.toString()}`);
    } catch (err) {
      const msg = err?.message ?? "Failed to place order. Please try again.";
      setErrors({ form: msg.replace(/^API error \d+: /i, "").trim() });
    } finally {
      setSubmitting(false);
    }
  }

  if (itemsForCheckout.length === 0 && !submitting) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-2 sm:px-3 lg:px-4 py-12 text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 mx-auto mb-4">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="text-slate-500 text-sm mt-1">Add products to your cart before checking out.</p>
          <Link href="/shop" className="mt-5 inline-flex items-center justify-center bg-[#FACC15] hover:bg-[#EAB308] text-slate-900 font-semibold px-6 py-2.5 rounded-md transition-colors">
            Go to Shop
          </Link>
        </div>
      </main>
    );
  }

  const showAuthModal = authChecked && !user && !guestCheckoutAccepted;
  const showCheckoutForm = user || guestCheckoutAccepted;

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 text-sm text-black placeholder:text-slate-400 border rounded-md outline-none transition-colors bg-white ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
        : "border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
    }`;

  return (
    <main className="min-h-screen bg-slate-50">
      {showAuthModal && (
        <CheckoutAuthModal onContinueAsGuest={() => setGuestCheckoutAccepted(true)} />
      )}

      {user && (
        <AddDeliveryAddressModal
          isOpen={addAddressModalOpen}
          onClose={() => setAddAddressModalOpen(false)}
          onSaved={(saved) => {
            setForm((prev) => ({
              ...prev,
              address: saved.address ?? prev.address,
              city: saved.city ?? prev.city,
              district: saved.district ?? prev.district,
              postalCode: saved.postalCode ?? prev.postalCode,
              phone: saved.phone ?? prev.phone,
              email: saved.email ?? prev.email,
            }));
            const cid = user?.customerId;
            if (cid != null) {
              getAllCheckoutAddressByCustomerId(cid).then((list) => {
                setSavedAddresses(list);
                if (list.length > 0) {
                  const last = list[list.length - 1];
                  const id = last.id ?? last.Id ?? last.internalId ?? last.InternalId;
                  if (id != null) setSelectedAddressId(id);
                }
              });
            }
          }}
          customerId={user?.customerId}
          defaultPhone={form.phone}
          defaultEmail={form.email}
        />
      )}

      <div className="max-w-6xl mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-600 mb-6">
          <Link href="/shop" className="hover:underline">Shop</Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link href="/cart" className="hover:underline">Cart</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-800 font-medium">Checkout</span>
        </nav>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {["Cart", "Checkout", "Confirmation"].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 ${idx <= 1 ? "text-emerald-600" : "text-slate-400"}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx < 1 ? "bg-emerald-600 text-white" : idx === 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {idx < 1 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="text-sm font-medium hidden sm:inline">{step}</span>
              </div>
              {idx < 2 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${idx < 1 ? "bg-emerald-600" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {!showCheckoutForm ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center text-slate-500">
              <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Preparing checkout...</p>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          {errors.form && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errors.form}
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Customer Info */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Contact */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">1</span>
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} className={inputCls("firstName")} placeholder="e.g. Kasun" />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} className={inputCls("lastName")} placeholder="e.g. Perera" />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputCls("phone")} placeholder="07X XXX XXXX" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls("email")} placeholder="you@email.com" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
                    Delivery Address
                  </h2>
                  {user && (
                    <button
                      type="button"
                      onClick={() => setAddAddressModalOpen(true)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add delivery address
                    </button>
                  )}
                </div>

                {user && addressesLoading ? (
                  <div className="py-6 flex items-center justify-center text-slate-500">
                    <svg className="animate-spin h-6 w-6 text-emerald-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="ml-2 text-sm">Loading addresses...</span>
                  </div>
                ) : user && savedAddresses.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-slate-600 text-sm mb-4">You haven&apos;t added a delivery address yet.</p>
                    <button
                      type="button"
                      onClick={() => setAddAddressModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add delivery address
                    </button>
                  </div>
                ) : user && savedAddresses.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-700">Select a delivery address</p>
                    <ul className="space-y-2">
                      {savedAddresses.map((addr) => {
                        const id = addr.id ?? addr.Id ?? addr.internalId ?? addr.InternalId;
                        const line1 = addr.addressLine1 ?? addr.AddressLine1 ?? "";
                        const line2 = addr.addressLine2 ?? addr.AddressLine2 ?? "";
                        const line3 = addr.addressLine3 ?? addr.AddressLine3 ?? "";
                        const isSelected = selectedAddressId === id;
                        return (
                          <li key={id ?? line1 + line2}>
                            <label
                              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                isSelected ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="deliveryAddress"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(id)}
                                className="mt-1 accent-emerald-600"
                              />
                              <div className="flex-1 min-w-0 text-sm">
                                <p className="font-medium text-slate-900">{line1 || "—"}</p>
                                <p className="text-slate-600">
                                  {[line2, line3].filter(Boolean).join(", ")}
                                  {(addr.postalCode ?? addr.PostalCode) && ` · ${addr.postalCode ?? addr.PostalCode}`}
                                </p>
                                {(addr.mobileNo ?? addr.MobileNo) && (
                                  <p className="text-slate-500 mt-0.5">{addr.mobileNo ?? addr.MobileNo}</p>
                                )}
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    {selectedAddressId && (
                      <div className="pt-2 space-y-4 border-t border-slate-200">
                        <p className="text-sm text-slate-600">Selected address will be used for delivery. Add order notes below if needed.</p>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Order Notes (optional)</label>
                          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={inputCls("notes")} placeholder="Any special instructions for delivery..." />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                      <input name="address" value={form.address} onChange={handleChange} className={inputCls("address")} placeholder="123, Main Street" />
                      {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                        <input name="city" value={form.city} onChange={handleChange} className={inputCls("city")} placeholder="Colombo" />
                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                        <select name="district" value={form.district} onChange={handleChange} className={inputCls("district")}>
                          <option value="">Select district</option>
                          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                        <input name="postalCode" value={form.postalCode} onChange={handleChange} className={inputCls("postalCode")} placeholder="10100" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Order Notes (optional)</label>
                      <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={inputCls("notes")} placeholder="Any special instructions for delivery..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.paymentMethod === PAYMENT_OPTIONS.CashOnDelivery ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="paymentMethod" value={PAYMENT_OPTIONS.CashOnDelivery} checked={form.paymentMethod === PAYMENT_OPTIONS.CashOnDelivery} onChange={handleChange} className="mt-0.5 accent-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{PAYMENT_OPTION_LABELS[PAYMENT_OPTIONS.CashOnDelivery]}</p>
                      <p className="text-xs text-slate-500">Pay when you receive your order</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.paymentMethod === PAYMENT_OPTIONS.Card ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="paymentMethod" value={PAYMENT_OPTIONS.Card} checked={form.paymentMethod === PAYMENT_OPTIONS.Card} onChange={handleChange} className="mt-0.5 accent-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{PAYMENT_OPTION_LABELS[PAYMENT_OPTIONS.Card]}</p>
                      <p className="text-xs text-slate-500">Pay by credit or debit card</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${form.paymentMethod === PAYMENT_OPTIONS.BankTransfer ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="paymentMethod" value={PAYMENT_OPTIONS.BankTransfer} checked={form.paymentMethod === PAYMENT_OPTIONS.BankTransfer} onChange={handleChange} className="mt-0.5 accent-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{PAYMENT_OPTION_LABELS[PAYMENT_OPTIONS.BankTransfer]}</p>
                      <p className="text-xs text-slate-500">Transfer to our bank account (details will be provided)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:w-96 shrink-0">
              <div className="bg-white border border-slate-200 rounded-lg p-5 lg:sticky lg:top-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>

                <ul className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {itemsForCheckout.map((item) => (
                    <li key={item.slug} className="flex gap-3">
                      <div className="w-14 h-14 shrink-0 bg-slate-50 rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-800 shrink-0">{formatRs(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-slate-800">{formatRs(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="font-medium text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-medium text-slate-800">{formatRs(deliveryFee)}</span>
                    )}
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-emerald-600">
                      Free delivery on orders above {formatRs(FREE_DELIVERY_MIN)}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold text-slate-900">{formatRs(grandTotal)}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-md transition-all text-sm"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      Place Order &mdash; {formatRs(grandTotal)}
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center mt-3">
                  By placing this order, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </form>
        )}
      </div>
    </main>
  );
}
