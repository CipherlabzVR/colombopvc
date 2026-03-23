"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getECommerceCustomerProfileById,
  updateECommerceCustomerProfile,
} from "@/lib/customerApi";

const AUTH_STORAGE_KEY = "colombo_pvc_user";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.customerId != null ? data : null;
  } catch {
    return null;
  }
}

/** Pre-fill form when profile GET fails (e.g. API 404) using data from sign-in. */
function formFieldsFromSessionUser(user) {
  let firstName = (user.firstName ?? "").trim();
  let lastName = (user.lastName ?? "").trim();
  if (!firstName && !lastName && user.name) {
    const parts = String(user.name).trim().split(/\s+/).filter(Boolean);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }
  return {
    firstName,
    lastName,
    email: (user.email ?? "").trim(),
    mobileNo: String(user.mobileNo ?? "").replace(/\s/g, ""),
  };
}

function persistUserFromApi(stored, apiResult) {
  const firstName = (apiResult.firstName ?? "").trim();
  const lastName = (apiResult.lastName ?? "").trim();
  const name =
    [firstName, lastName].filter(Boolean).join(" ") ||
    stored.name ||
    apiResult.email ||
    "";
  const next = {
    ...stored,
    email: apiResult.email ?? stored.email,
    name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    mobileNo: (apiResult.mobileNo ?? "").trim() || undefined,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export default function ProfilePage() {
  const router = useRouter();
  const [storedUser, setStoredUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadProfile = useCallback(async (user) => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getECommerceCustomerProfileById(Number(user.customerId));
      const ok = data?.statusCode === 200;
      const result = data?.result ?? data?.Result;
      if (!ok || !result) {
        setLoadError(data?.message ?? "Could not load your profile.");
        setLoading(false);
        return;
      }
      const firstName = result.firstName ?? result.FirstName ?? "";
      const lastName = result.lastName ?? result.LastName ?? "";
      const email = result.email ?? result.Email ?? user.email ?? "";
      const mobileNo = result.mobileNo ?? result.MobileNo ?? user.mobileNo ?? "";
      setForm((f) => ({
        ...f,
        firstName,
        lastName,
        email,
        mobileNo: String(mobileNo).replace(/\s/g, ""),
      }));
    } catch (e) {
      const msg = e?.message ?? "";
      const is404 = /\b404\b/.test(msg);
      if (is404) {
        const fromSession = formFieldsFromSessionUser(user);
        setForm((f) => ({
          ...f,
          ...fromSession,
        }));
        setLoadError(
          "Profile service not found (404). The running API does not expose GetECommerceCustomerProfileById yet—publish the latest Backend (ApexflowERP.Api), restart IIS Express or the app pool, and confirm NEXT_PUBLIC_API_BASE points at that server. Fields below are from your last sign-in on this device."
        );
      } else {
        setLoadError(msg || "Could not load your profile.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      setLoading(false);
      router.replace("/signin?returnUrl=/account/profile");
      return;
    }
    setStoredUser(u);
    loadProfile(u);
  }, [router, loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setSuccessMessage("");
  };

  const validate = () => {
    const errs = [];
    if (!form.firstName.trim()) errs.push("First name is required.");
    if (!form.lastName.trim()) errs.push("Last name is required.");
    if (!form.mobileNo.trim()) errs.push("Phone number is required.");
    else if (!/^0\d{9}$/.test(form.mobileNo.replace(/\s/g, "")))
      errs.push("Enter a valid 10-digit phone number (e.g. 07X XXX XXXX).");
    const hasNew = !!form.newPassword.trim();
    if (hasNew) {
      if (form.newPassword.length < 6) errs.push("New password must be at least 6 characters.");
      if (form.newPassword !== form.confirmPassword) errs.push("New passwords do not match.");
      if (!form.currentPassword) errs.push("Enter your current password to set a new one.");
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setFormError("");
    const errs = validate();
    if (errs.length) {
      setFormError(errs[0]);
      return;
    }
    if (!storedUser?.customerId) return;

    setSaving(true);
    try {
      const payload = {
        customerId: Number(storedUser.customerId),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNo: form.mobileNo.replace(/\s/g, ""),
      };
      if (form.newPassword.trim()) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword.trim();
      }

      const data = await updateECommerceCustomerProfile(payload);
      const ok = data?.statusCode === 200;
      const result = data?.result ?? data?.Result;
      if (!ok || !result) {
        setFormError(data?.message ?? "Could not save changes.");
        setSaving(false);
        return;
      }

      const merged = persistUserFromApi(storedUser, {
        firstName: result.firstName ?? result.FirstName,
        lastName: result.lastName ?? result.LastName,
        email: result.email ?? result.Email,
        mobileNo: result.mobileNo ?? result.MobileNo,
      });
      setStoredUser(merged);
      setSuccessMessage("Your profile was updated.");
      setForm((f) => ({
        ...f,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      let message = "Could not save changes.";
      const raw = err?.message ?? "";
      const suffix = raw.replace(/^API error \d+: /i, "").trim();
      if (suffix) {
        try {
          const j = JSON.parse(suffix);
          if (j && typeof j.message === "string") message = j.message;
        } catch {
          message = suffix;
        }
      }
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 text-sm text-black placeholder:text-slate-400 border rounded-md outline-none transition-colors bg-white ${
      formError && field ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E]/20"
    }`;

  if (!storedUser && !loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 text-sm">Redirecting…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
      <div className="max-w-lg mx-auto px-4 py-10 font-poppins">
        <nav className="text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-800 font-medium">My profile</span>
        </nav>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[#0D1B3E] mb-1">My profile</h1>
          <p className="text-sm text-slate-600 mb-6">
            Update your name, phone, or password. Your email is your sign-in address and cannot be changed here.
          </p>

          {loadError && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {loadError}
            </div>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm py-8 text-center">Loading your profile…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {successMessage}
                </div>
              )}
              {formError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputCls("firstName")}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputCls("lastName")}
                  autoComplete="family-name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full px-3.5 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-md bg-slate-50 cursor-not-allowed"
                  title="Contact support to change your email"
                />
              </div>
              <div>
                <label htmlFor="mobileNo" className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile number
                </label>
                <input
                  id="mobileNo"
                  name="mobileNo"
                  value={form.mobileNo}
                  onChange={handleChange}
                  className={inputCls("mobileNo")}
                  autoComplete="tel"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-800 mb-3">Change password (optional)</p>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                      Current password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={form.currentPassword}
                      onChange={handleChange}
                      className={inputCls()}
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                      New password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={form.newPassword}
                      onChange={handleChange}
                      className={inputCls()}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm new password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={inputCls()}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#0D1B3E] hover:bg-[#152a52] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <Link
                  href="/shop"
                  className="flex-1 text-center border border-slate-300 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back to shop
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
