"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginECommerceCustomer } from "@/lib/customerApi";

const AUTH_STORAGE_KEY = "colombo_pvc_user";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") setRegisteredMessage(true);
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const data = await loginECommerceCustomer({
        email: form.email.trim(),
        password: form.password,
      });

      const statusRaw = data?.statusCode ?? data?.StatusCode;
      const apiMessage = data?.message ?? data?.Message ?? "";
      const result = data?.result ?? data?.Result;

      const statusIsFailed =
        statusRaw === -99 ||
        statusRaw === "-99" ||
        (typeof statusRaw === "string" && statusRaw.toUpperCase() === "FAILED");

      const isOk =
        statusRaw === 200 &&
        result != null &&
        typeof result === "object" &&
        !statusIsFailed;

      if (!isOk) {
        setErrors({
          email: apiMessage || "Invalid email or password. Please try again.",
        });
        setSubmitting(false);
        return;
      }

      const firstName = (result.firstName ?? result.FirstName ?? "").trim();
      const lastName = (result.lastName ?? result.LastName ?? "").trim();
      const customerId =
        result.id ?? result.Id ?? result.customerId ?? result.CustomerId ?? result.customerID;
      const emailVal = (result.email ?? result.Email ?? form.email.trim()).trim();
      const user = {
        email: emailVal,
        name: result.firstName ?? result.FirstName
          ? [firstName, lastName].filter(Boolean).join(" ")
          : result.name ?? result.Name ?? emailVal ?? "",
        token: result.token ?? result.Token ?? null,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        mobileNo: (result.mobileNo ?? result.MobileNo ?? result.phone ?? "").trim() || undefined,
        customerId: customerId != null ? Number(customerId) : undefined,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      const returnUrl = searchParams.get("returnUrl");
      router.push(returnUrl && returnUrl.startsWith("/") ? returnUrl : "/");
    } catch (err) {
      let message = "Invalid email or password. Please try again.";
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
      setErrors({ email: message });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 text-sm text-black placeholder:text-slate-400 border rounded-md outline-none transition-colors bg-white ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
        : "border-slate-300 focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E]/20"
    }`;

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 font-poppins">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sign In</h1>
            <p className="text-slate-600 text-sm mt-2">Welcome back to Colombo PVC Center</p>
          </div>

          {registeredMessage && (
            <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Account created. Please sign in with your email and password.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputCls("email")}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-500 hover:text-[#0D1B3E] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`${inputCls("password")} pr-10`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D1B3E]/30 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0D1B3E] hover:bg-[#1a2d5c] text-white font-semibold px-4 py-3 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#F5C518] hover:text-[#E0B415]">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link href="/" className="hover:text-slate-700">Back to home</Link>
        </p>
      </div>
    </main>
  );
}
