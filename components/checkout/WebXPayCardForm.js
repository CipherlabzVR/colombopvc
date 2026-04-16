"use client";

/**
 * Info message shown when the Card payment option is selected.
 * With the Redirect Integration, actual card details are entered
 * on WebXPay's hosted payment page after the order is placed.
 */
export default function WebXPayCardInfo() {
  return (
    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
      <div className="flex items-start gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-600 shrink-0 mt-0.5"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
        <div>
          <p className="text-sm font-medium text-blue-900">
            Secure card payment via WebXPay
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            You will be redirected to a secure payment page to enter your card
            details after placing the order.
          </p>
        </div>
      </div>
    </div>
  );
}
