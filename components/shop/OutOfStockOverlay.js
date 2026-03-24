/**
 * Semi-transparent overlay + label for product images when marked out of stock in ERP.
 */
export function OutOfStockOverlay({ className = "", label = "Out of Stock" }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 ${className}`}
      aria-hidden
    >
      <span className="bg-slate-900/85 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-md uppercase tracking-wide shadow-lg text-center max-w-[90%]">
        {label}
      </span>
    </div>
  );
}
