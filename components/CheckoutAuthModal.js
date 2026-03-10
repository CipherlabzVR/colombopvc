"use client";

import Link from "next/link";

/**
 * Modal shown on checkout when user is not signed in.
 * Offers: Sign In (with returnUrl) or Continue as Guest.
 */
export default function CheckoutAuthModal({ onContinueAsGuest }) {
  const signInUrl = "/signin?returnUrl=" + encodeURIComponent("/checkout");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-auth-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 sm:p-8 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 id="checkout-auth-title" className="text-xl font-bold text-slate-900">
            Sign in for a faster checkout
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Use your account to save your details and track orders. Or continue as a guest.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={signInUrl}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </Link>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-3 rounded-lg transition-colors text-sm border border-slate-200"
          >
            Continue without login
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-5">
          Guest checkout only requires your delivery details. No account needed.
        </p>
      </div>
    </div>
  );
}
