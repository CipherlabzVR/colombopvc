"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getCategoriesWithItemCount, getAllItemsForWeb } from "@/lib/shopApi";

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

function getDisplayName(user) {
  if (!user) return "";
  const name = (user.name || "").trim();
  if (name) {
    const first = name.split(/\s+/)[0];
    return first || name;
  }
  const email = (user.email || "").trim();
  if (email) return email.split("@")[0];
  return "Account";
}

const navLinkClass = (pathname, href) => {
  const base = "font-semibold text-sm whitespace-nowrap transition-all duration-200 py-2 px-3 rounded-lg";
  const active = "text-[#0D1B3E] bg-[#F5C518] shadow-sm";
  const inactive = "text-white/90 hover:text-[#F5C518] hover:bg-white/10";
  const isHome = href === "/";
  const isActive = isHome ? pathname === "/" : pathname.startsWith(href);
  return `${base} ${isActive ? active : inactive}`;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const categoryDropdownRef = useRef(null);
  const accountMenuRef = useRef(null);
  const searchSuggestionsRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const { totalItems, openDrawer } = useCart();

  useEffect(() => setUser(getStoredUser()), [pathname]);

  // Fetch categories for search dropdown
  useEffect(() => {
    getCategoriesWithItemCount()
      .then((list) => setNavCategories(Array.isArray(list) ? list : []))
      .catch(() => setNavCategories([]));
  }, []);

  // Sync search input and category from URL when on shop page
  useEffect(() => {
    if (pathname.startsWith("/shop")) {
      const q = searchParams.get("q") ?? "";
      const catParam = searchParams.get("category");
      setSearchQuery(q);
      const id = catParam ? parseInt(catParam, 10) : null;
      setCategoryId(Number.isFinite(id) && id > 0 ? id : null);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const openSearch = () => setMobileSearchOpen(true);
    window.addEventListener("open-mobile-search", openSearch);
    return () => window.removeEventListener("open-mobile-search", openSearch);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
      if (searchSuggestionsRef.current && !searchSuggestionsRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Fetch search suggestions when user types (debounced)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSuggestionsLoading(true);
      getAllItemsForWeb({
        pageNumber: 1,
        pageSize: 8,
        searchText: q,
        categoryId: categoryId ?? undefined,
      })
        .then(({ items }) => {
          setSuggestions(Array.isArray(items) ? items : []);
          setSuggestionsOpen(true);
        })
        .catch(() => {
          setSuggestions([]);
        })
        .finally(() => {
          setSuggestionsLoading(false);
          searchDebounceRef.current = null;
        });
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, categoryId]);

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId != null && categoryId > 0) params.set("category", String(categoryId));
    setSuggestionsOpen(false);
    setSuggestions([]);
    router.push(params.toString() ? `/shop?${params.toString()}` : "/shop");
    setMobileSearchOpen(false);
  };

  const categoryLabel = categoryId != null
    ? (navCategories.find((c) => c.categoryId === categoryId)?.categoryName ?? "All Categories")
    : "All Categories";

  return (
    <nav className="bg-[#0D1B3E] py-3">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 md:gap-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <Image
          src="/logo.png"
          alt="Colombo PVC Center"
          width={80}
          height={80}
          className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
        />
        <span className="text-lg sm:text-xl font-semibold">
          <span className="text-[#22D3EE]">Colombo</span>
          <span className="text-[#F5C518]"> PVC</span>
          <span className="text-[#22D3EE]"> Center</span>
        </span>
      </Link>

      {/* Desktop: Nav links */}
      <div className="hidden lg:flex items-center gap-5 md:gap-8 shrink-0">
        <Link href="/" className={navLinkClass(pathname, "/")}>
          Home
        </Link>
        <Link href="/shop" className={navLinkClass(pathname, "/shop")}>
          Shop
        </Link>
        {/* <Link href="/promotion" className={navLinkClass(pathname, "/promotion")}>
          Promotion
        </Link> */}
        <Link href="/order-status" className={navLinkClass(pathname, "/order-status")}>
          Order Status
        </Link>
      </div>

      {/* Desktop: Search bar */}
      <form
        role="search"
        onSubmit={handleSearch}
        className="hidden md:flex flex-1 min-w-0 max-w-xs lg:max-w-md items-stretch bg-[#1A2B52] rounded-lg border border-[#2D4080] focus-within:border-[#3B5998] focus-within:ring-2 focus-within:ring-[#3B5998]/30 transition-all"
        aria-label="Search products"
      >
        <div className="relative shrink-0 overflow-visible" ref={categoryDropdownRef}>
          <button
            type="button"
            onClick={() => setCategoryDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-2.5 border-r border-[#2D4080] hover:bg-[#243460] transition-colors text-left min-w-0 max-w-[140px] sm:max-w-none"
            aria-haspopup="listbox"
            aria-expanded={categoryDropdownOpen}
            aria-label="Choose category"
          >
            <span className="text-white/90 text-xs font-medium truncate">
              {categoryLabel}
            </span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/70 shrink-0 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} aria-hidden>
              <path d="M3 4.5l3 3 3-3" />
            </svg>
          </button>
          {categoryDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 min-w-[180px] max-h-72 overflow-y-auto bg-[#1A2B52] border border-[#2D4080] rounded-lg shadow-xl py-1"
              style={{ zIndex: 9999 }}
              role="listbox"
            >
              <button
                type="button"
                role="option"
                aria-selected={categoryId == null}
                onClick={() => { setCategoryId(null); setCategoryDropdownOpen(false); }}
                className="w-full px-3 py-2.5 text-left text-sm text-white/90 hover:bg-[#243460] hover:text-white transition-colors"
              >
                All Categories
              </button>
              {navCategories.map((cat) => (
                <button
                  key={cat.categoryId}
                  type="button"
                  role="option"
                  aria-selected={categoryId === cat.categoryId}
                  onClick={() => { setCategoryId(cat.categoryId); setCategoryDropdownOpen(false); }}
                  className="w-full px-3 py-2.5 text-left text-sm text-white/90 hover:bg-[#243460] hover:text-white transition-colors truncate"
                >
                  {cat.categoryName ?? ""}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 relative" ref={searchSuggestionsRef}>
          <input
            type="search"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.target.blur();
                setCategoryDropdownOpen(false);
                setSuggestionsOpen(false);
              }
            }}
            placeholder="Search products, pipes, tools..."
            autoComplete="off"
            className="w-full px-3 py-2.5 text-white placeholder-white/50 text-sm outline-none bg-transparent focus:placeholder-white/40"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen && suggestions.length > 0}
          />
          {suggestionsOpen && (suggestions.length > 0 || suggestionsLoading) && (
            <div
              className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto bg-[#1A2B52] border border-[#2D4080] rounded-lg shadow-xl py-1"
              style={{ zIndex: 9999 }}
              role="listbox"
            >
              {suggestionsLoading ? (
                <div className="px-3 py-4 text-center text-white/70 text-sm">Searching…</div>
              ) : (
                suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    className="w-full px-3 py-2.5 text-left text-sm text-white/90 hover:bg-[#243460] hover:text-white transition-colors flex items-center gap-3"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("q", (item.name ?? "").trim() || searchQuery);
                      if (categoryId != null && categoryId > 0) params.set("category", String(categoryId));
                      setSuggestionsOpen(false);
                      setSuggestions([]);
                      router.push(`/shop?${params.toString()}`);
                    }}
                  >
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="w-10 h-10 rounded object-cover shrink-0 bg-white/10" />
                    ) : (
                      <span className="w-10 h-10 rounded bg-white/10 shrink-0 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                    )}
                    <span className="truncate">{item.name ?? ""}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#F5C518] hover:bg-[#E0B415] text-[#0D1B3E] font-semibold text-sm px-4 py-2.5 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-r-md"
          aria-label="Search"
        >
          Search
        </button>
      </form>

      {/* Right section - pushed to the right (same row or when wrapped on mobile) */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 shrink-0 min-h-[44px] pr-1 md:pr-0 ml-auto">
        {/* Mobile search icon - 44px touch target on mobile */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden text-white hover:text-[#F5C518] active:opacity-80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 -m-1"
          aria-label="Toggle search"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {/* User / Account - show name when logged in, dropdown with Sign out */}
        <div className="relative" ref={accountMenuRef}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="flex items-center gap-2 text-white hover:text-[#F5C518] active:opacity-80 transition-colors min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 justify-center md:justify-start rounded-lg hover:bg-white/5 md:px-2 md:py-1.5 -m-1"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <span className="hidden sm:flex w-8 h-8 rounded-full bg-white/10 items-center justify-center shrink-0" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span className="hidden sm:block text-sm font-medium text-white/95 truncate max-w-[120px] md:max-w-[140px]">
                  Hi, {getDisplayName(user)}
                </span>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`hidden sm:block shrink-0 text-white/70 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} aria-hidden>
                  <path d="M3 4.5l3 3 3-3" />
                </svg>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:hidden md:w-6 md:h-6" aria-hidden>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {accountMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-1.5 w-48 py-1 bg-[#1A2B52] border border-[#2D4080] rounded-lg shadow-xl z-50"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs text-white/60 truncate" title={user.email}>{user.email}</p>
                    <p className="text-sm font-medium text-white truncate">{user.name || getDisplayName(user)}</p>
                  </div>
                  <Link
                    href="/order-status"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-[#243460] hover:text-[#F5C518] transition-colors"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Order status
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-3 py-2.5 text-left text-sm text-white/90 hover:bg-[#243460] hover:text-[#F5C518] transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/signin"
              className="text-white hover:text-[#F5C518] active:opacity-80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 md:min-w-0 md:min-h-0 md:hover:bg-transparent md:p-1 -m-1"
              aria-label="Sign in"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}
        </div>

        {/* Cart - 44px touch target, extra spacing so badge doesn't crowd hamburger */}
        <button
          onClick={openDrawer}
          className="relative text-white hover:text-[#F5C518] active:opacity-80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 md:min-w-0 md:min-h-0 md:hover:bg-transparent md:p-1 -m-1 md:ml-3"
          aria-label="Cart"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className={`absolute top-1 right-1 md:top-[-2px] md:right-[-2px] min-w-[18px] h-[18px] flex items-center justify-center text-xs font-semibold rounded-full transition-colors ${totalItems > 0 ? "bg-rose-500 text-white" : "bg-[#F5C518] text-[#0D1B3E]"}`}>
            {totalItems}
          </span>
        </button>

        {/* Hamburger - 44px touch target, clear spacing from cart */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white hover:text-[#F5C518] active:opacity-80 transition-colors min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 -m-1"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`w-5 h-0.5 bg-current block transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-5 h-0.5 bg-current block ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`w-5 h-0.5 bg-current block transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="w-full md:hidden order-last">
          <form
            role="search"
            onSubmit={handleSearch}
            className="flex items-center bg-[#1A2B52] rounded-lg border border-[#2D4080] overflow-hidden focus-within:border-[#3B5998] focus-within:ring-2 focus-within:ring-[#3B5998]/30 transition-all"
            aria-label="Search products"
          >
            <input
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, pipes, tools..."
              autoComplete="off"
              autoFocus
              className="flex-1 min-w-0 px-3 py-3 text-white placeholder-white/45 text-sm outline-none bg-transparent"
              aria-label="Search"
            />
            <button
              type="submit"
              className="bg-[#F5C518] hover:bg-[#E0B415] text-[#0D1B3E] font-semibold text-sm px-4 py-3 shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Search"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-hidden="false">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute top-0 right-0 w-full max-w-xs h-full bg-[#0D1B3E] shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-semibold text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -m-2 text-white/70 hover:text-[#F5C518]"
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <Link
                href="/"
                className={`py-3 px-4 font-medium rounded-lg transition-colors ${pathname === "/" ? "text-[#F5C518] bg-white/10 font-semibold" : "text-white/80 hover:bg-white/5 hover:text-[#F5C518]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`py-3 px-4 font-medium rounded-lg transition-colors ${pathname.startsWith("/shop") ? "text-[#F5C518] bg-white/10 font-semibold" : "text-white/80 hover:bg-white/5 hover:text-[#F5C518]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              {/* <Link
                href="/promotion"
                className={`py-3 px-4 font-medium rounded-lg transition-colors ${pathname.startsWith("/promotion") ? "text-[#F5C518] bg-white/10 font-semibold" : "text-white/80 hover:bg-white/5 hover:text-[#F5C518]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Promotion
              </Link> */}
              <Link
                href="/order-status"
                className={`py-3 px-4 font-medium rounded-lg transition-colors ${pathname.startsWith("/order-status") ? "text-[#F5C518] bg-white/10 font-semibold" : "text-white/80 hover:bg-white/5 hover:text-[#F5C518]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Order Status
              </Link>
              {user ? (
                <>
                  <div className="py-3 px-4 flex items-center gap-3 border-b border-white/10">
                    <span className="flex w-10 h-10 rounded-full bg-white/10 items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.name || getDisplayName(user)}</p>
                      <p className="text-xs text-white/60 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/order-status"
                    className="flex items-center gap-3 py-3 px-4 font-medium rounded-lg text-white/80 hover:bg-white/5 hover:text-[#F5C518] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Order status
                  </Link>
                  <button
                    type="button"
                    onClick={() => { handleSignOut(); }}
                    className="w-full py-3 px-4 text-left font-medium rounded-lg text-white/80 hover:bg-white/5 hover:text-[#F5C518] transition-colors flex items-center gap-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className={`py-3 px-4 font-medium rounded-lg transition-colors ${pathname.startsWith("/signin") || pathname.startsWith("/signup") ? "text-[#F5C518] bg-white/10 font-semibold" : "text-white/80 hover:bg-white/5 hover:text-[#F5C518]"}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/cart"
                className="py-3 px-4 text-white/80 font-medium rounded-lg hover:bg-white/5 hover:text-[#F5C518] flex items-center justify-between transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="min-w-[22px] h-[22px] flex items-center justify-center bg-rose-500 text-white text-xs font-semibold rounded-full px-1">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </nav>
  );
}
