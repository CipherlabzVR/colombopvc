"use client";

import Link from "next/link";

export default function ShopPagination({ currentPage, totalPages, getPageUrl, onPageChange }) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const useHandler = typeof onPageChange === "function";

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);
    for (let i = rangeStart; i <= rangeEnd; i++) range.push(i);
    return range;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-8 pt-6 border-t border-slate-200"
      aria-label="Product pagination"
    >
      {prevPage >= 1 ? (
        useHandler ? (
          <button
            type="button"
            onClick={(e) => onPageChange(e, prevPage)}
            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            aria-label="Previous page"
          >
            <span className="sr-only">Previous</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <Link
            href={getPageUrl(prevPage)}
            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            aria-label="Previous page"
          >
            <span className="sr-only">Previous</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        )
      ) : (
        <span
          className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
          aria-disabled="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </span>
      )}

      {pages[0] > 1 && (
        <>
          {useHandler ? (
            <button
              type="button"
              onClick={(e) => onPageChange(e, 1)}
              className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              1
            </button>
          ) : (
            <Link
              href={getPageUrl(1)}
              className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              1
            </Link>
          )}
          {pages[0] > 2 && (
            <span className="inline-flex items-center justify-center min-w-[36px] h-9 text-slate-500 text-sm">…</span>
          )}
        </>
      )}

      {pages.map((p) =>
        p === currentPage ? (
          <span
            key={p}
            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border-2 border-[#FACC15] bg-[#FACC15] text-slate-900 text-sm font-semibold"
            aria-current="page"
          >
            {p}
          </span>
        ) : useHandler ? (
          <button
            key={p}
            type="button"
            onClick={(e) => onPageChange(e, p)}
            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {p}
          </button>
        ) : (
          <Link
            key={p}
            href={getPageUrl(p)}
            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {p}
          </Link>
        )
      )}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="inline-flex items-center justify-center min-w-[36px] h-9 text-slate-500 text-sm">…</span>
          )}
          {useHandler ? (
            <button
              type="button"
              onClick={(e) => onPageChange(e, totalPages)}
              className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              {totalPages}
            </button>
          ) : (
            <Link
              href={getPageUrl(totalPages)}
              className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              {totalPages}
            </Link>
          )}
        </>
      )}

      {nextPage <= totalPages ? (
        useHandler ? (
          <button
            type="button"
            onClick={(e) => onPageChange(e, nextPage)}
            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            aria-label="Next page"
          >
            <span className="sr-only">Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : (
          <Link
            href={getPageUrl(nextPage)}
            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            aria-label="Next page"
          >
            <span className="sr-only">Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        )
      ) : (
        <span
          className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
          aria-disabled="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      )}
    </nav>
  );
}
