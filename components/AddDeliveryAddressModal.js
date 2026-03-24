"use client";

import { useState, useEffect } from "react";
import { createCheckoutAddress, updateCheckoutAddress } from "@/lib/checkoutApi";
import { DISTRICTS } from "@/lib/constants/districts";

/**
 * Modal for logged-in users to add a delivery address and save to backend.
 * Maps: Address -> AddressLine1, City -> AddressLine2, District -> AddressLine3.
 */
const emptyForm = {
  addressLine1: "",
  city: "",
  district: "",
  postalCode: "",
  mobileNo: "",
  email: "",
};

export default function AddDeliveryAddressModal({
  isOpen,
  onClose,
  onSaved,
  customerId,
  defaultPhone = "",
  defaultEmail = "",
  /** When set, modal updates this address instead of creating a new one */
  editRecord = null,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setApiError("");
    if (editRecord && editRecord.id != null) {
      setForm({
        addressLine1: editRecord.addressLine1 ?? "",
        city: editRecord.city ?? "",
        district: editRecord.district ?? "",
        postalCode: editRecord.postalCode ?? "",
        mobileNo: String(editRecord.mobileNo ?? "").replace(/\s/g, "") || defaultPhone,
        email: (editRecord.email ?? "").trim() || defaultEmail,
      });
    } else {
      setForm({
        ...emptyForm,
        mobileNo: defaultPhone.replace(/\s/g, ""),
        email: (defaultEmail || "").trim(),
      });
    }
  }, [isOpen, defaultPhone, defaultEmail, editRecord]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  }

  function validate() {
    const errs = {};
    if (!form.addressLine1.trim()) errs.addressLine1 = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.district) errs.district = "Please select a district";
    if (!form.mobileNo.trim()) errs.mobileNo = "Phone number is required";
    else if (!/^0\d{9}$/.test(form.mobileNo.replace(/\s/g, "")))
      errs.mobileNo = "Enter a valid 10-digit phone number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (customerId == null || customerId === "") {
      setApiError("Please sign in again to save an address.");
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      const isEdit = editRecord != null && editRecord.id != null;
      if (isEdit) {
        const data = await updateCheckoutAddress({
          Id: Number(editRecord.id),
          CustomerId: Number(customerId),
          AddressLine1: form.addressLine1.trim(),
          AddressLine2: form.city.trim(),
          AddressLine3: form.district.trim(),
          MobileNo: form.mobileNo.trim().replace(/\s/g, ""),
          Email: (form.email || "").trim(),
          PostalCode: (form.postalCode || "").trim(),
          IsActive: true,
        });
        const code = data?.statusCode ?? data?.StatusCode;
        const ok = code === 200;
        const failMsg = data?.message ?? data?.Message;
        if (!ok && failMsg) {
          setApiError(String(failMsg));
          return;
        }
        if (!ok) {
          setApiError("Could not update address. Please try again.");
          return;
        }
      } else {
        await createCheckoutAddress({
          CustomerId: Number(customerId),
          AddressLine1: form.addressLine1.trim(),
          AddressLine2: form.city.trim(),
          AddressLine3: form.district.trim(),
          MobileNo: form.mobileNo.trim().replace(/\s/g, ""),
          Email: (form.email || "").trim(),
          PostalCode: (form.postalCode || "").trim(),
          IsActive: true,
        });
      }

      const saved = {
        address: form.addressLine1.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        postalCode: form.postalCode.trim(),
        phone: form.mobileNo.trim().replace(/\s/g, ""),
        email: form.email.trim(),
        mode: isEdit ? "edit" : "add",
      };
      onSaved?.(saved);
      onClose?.();
      setForm({ ...emptyForm });
      setErrors({});
    } catch (err) {
      const msg = err?.message ?? "Failed to save address. Please try again.";
      setApiError(msg.replace(/^API error \d+: /i, "").trim());
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 text-sm text-black placeholder:text-slate-400 border rounded-md outline-none transition-colors bg-white ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
        : "border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-address-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 id="add-address-title" className="text-xl font-bold text-slate-900">
              {editRecord?.id != null ? "Edit delivery address" : "Add delivery address"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {apiError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
              <input
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                className={inputCls("addressLine1")}
                placeholder="123, Main Street"
              />
              {errors.addressLine1 && (
                <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={inputCls("city")}
                  placeholder="Colombo"
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className={inputCls("district")}
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className={inputCls("postalCode")}
                placeholder="10100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                name="mobileNo"
                type="tel"
                value={form.mobileNo}
                onChange={handleChange}
                className={inputCls("mobileNo")}
                placeholder="07X XXX XXXX"
              />
              {errors.mobileNo && <p className="text-xs text-red-500 mt-1">{errors.mobileNo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputCls("email")}
                placeholder="you@email.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : editRecord?.id != null ? (
                  "Save changes"
                ) : (
                  "Save address"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
