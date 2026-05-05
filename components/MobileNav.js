"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

const AUTH_STORAGE_KEY = "colombo_pvc_user";

const NAV_LABEL_CLASS =
  "mt-0.5 text-[10px] font-semibold leading-tight text-center px-0.5 max-w-[4.5rem] truncate";

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

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/shop",
    label: "Shop",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l2.5 12h13L21 9H3z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    href: "/ecom/promotions",
    label: "Promotion",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l6.59-6.58a1 1 0 0 0 0-1.42L12 2Z" />
        <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    cart: true,
    label: "Cart",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    account: true,
    label: "Account",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const [user, setUser] = useState(null);

  useEffect(() => setUser(getStoredUser()), [pathname]);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around min-h-14 py-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.account) {
            const accountHref = user ? "/account/profile" : "/signin";
            const isActive = user
              ? pathname?.startsWith("/account")
              : pathname?.startsWith("/signin") || pathname?.startsWith("/signup");
            return (
              <Link
                key={item.label}
                href={accountHref}
                className={`flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors touch-manipulation ${
                  isActive ? "text-[#1f2937]" : "text-gray-600 hover:text-[#1f2937] active:text-[#1f2937]"
                }`}
                aria-label={user ? "My profile" : "Sign in"}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                <span className={NAV_LABEL_CLASS}>{item.label}</span>
              </Link>
            );
          }
          if (item.cart) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={openDrawer}
                className="relative flex flex-col items-center justify-center flex-1 min-w-0 h-full text-gray-600 hover:text-[#1f2937] active:text-[#1f2937] transition-colors touch-manipulation"
                aria-label={item.label}
              >
                <span className="relative inline-flex shrink-0">
                  {item.icon}
                  {totalItems > 0 && (
                    <span className="absolute -top-1 right-1/2 translate-x-[14px] min-w-[18px] h-[18px] flex items-center justify-center bg-rose-600 text-white text-xs font-semibold rounded-full">
                      {totalItems}
                    </span>
                  )}
                </span>
                <span className={NAV_LABEL_CLASS}>{item.label}</span>
              </button>
            );
          }
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-colors touch-manipulation ${
                isActive ? "text-[#1f2937]" : "text-gray-600 hover:text-[#1f2937] active:text-[#1f2937]"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              <span className={NAV_LABEL_CLASS}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
