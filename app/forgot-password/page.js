"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 font-poppins">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Forgot Password</h1>
            <p className="text-slate-600 text-sm mt-2">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-emerald-600 font-medium">Check your email</p>
              <p className="text-sm text-slate-600 mt-2">
                If an account exists for {email}, you will receive a password reset link.
              </p>
              <Link
                href="/signin"
                className="mt-6 inline-block text-sm font-semibold text-[#F5C518] hover:text-[#E0B415]"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-md outline-none focus:border-[#0D1B3E] focus:ring-1 focus:ring-[#0D1B3E]/20 bg-white"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-[#0D1B3E] hover:bg-[#1a2d5c] text-white font-semibold px-4 py-3 rounded-md text-sm transition-colors"
              >
                Send reset link
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/signin" className="hover:text-slate-700">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
