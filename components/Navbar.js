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
  const [searchModalOpen, setSearchModalOpen] = useState(false);
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
  const searchInputRef = useRef(null);
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
    const openSearch = () => setSearchModalOpen(true);
    window.addEventListener("open-mobile-search", openSearch);
    return () => window.removeEventListener("open-mobile-search", openSearch);
  }, []);

  useEffect(() => {
    if (searchModalOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [searchModalOpen]);

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
    setSearchModalOpen(false);
  };

  const categoryLabel = categoryId != null
    ? (navCategories.find((c) => c.categoryId === categoryId)?.categoryName ?? "All Categories")
    : "All Categories";

  return (
    <nav className="bg-[#0D1B3E] py-3">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-3 md:gap-6 relative">
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

      {/* Center: Nav links — absolutely centered on desktop */}
      <div className="hidden lg:flex items-center gap-5 absolute left-1/2 -translate-x-1/2">
        <Link href="/" className={navLinkClass(pathname, "/")}>
          Home
        </Link>
        <Link href="/shop" className={navLinkClass(pathname, "/shop")}>
          Shop
        </Link>
        <Link href="/ecom/promotions" className={navLinkClass(pathname, "/ecom/promotions")}>
          Promotion
        </Link>
        <Link href="/order-status" className={navLinkClass(pathname, "/order-status")}>
          Order Status
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-5 shrink-0 min-h-[44px] ml-auto">
        {/* Search icon — opens search modal */}
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-[#F5C518] hover:text-[#0D1B3E] text-white transition-all duration-200"
          aria-label="Search products"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                  <Link
                    href="/account/profile"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-[#243460] hover:text-[#F5C518] transition-colors"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My profile
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
          className="relative text-white hover:text-[#F5C518] active:opacity-80 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 md:min-w-0 md:min-h-0 md:hover:bg-transparent md:p-1 -m-1"
          aria-label="Cart"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span suppressHydrationWarning className={`absolute top-1 right-1 md:top-[-2px] md:right-[-2px] min-w-[18px] h-[18px] flex items-center justify-center text-xs font-semibold rounded-full transition-colors ${totalItems > 0 ? "bg-rose-500 text-white" : "bg-[#F5C518] text-[#0D1B3E]"}`}>
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

      {/* Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Search products">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSearchModalOpen(false); setCategoryDropdownOpen(false); setSuggestionsOpen(false); }}
          />
          <div className="relative w-full max-w-2xl mx-auto mt-[10vh] sm:mt-[15vh] px-4 animate-[searchSlideDown_0.25s_ease-out]">
            <div className="bg-[#0D1B3E] rounded-2xl shadow-2xl border border-[#2D4080] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="text-white font-semibold text-base">Search Products</h2>
                <button
                  type="button"
                  onClick={() => { setSearchModalOpen(false); setCategoryDropdownOpen(false); setSuggestionsOpen(false); }}
                  className="text-white/60 hover:text-white transition-colors p-1 -m-1"
                  aria-label="Close search"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search form */}
              <form role="search" onSubmit={handleSearch} className="p-5" ref={categoryDropdownRef}>
                <div className="flex items-stretch bg-[#1A2B52] rounded-xl border border-[#2D4080] focus-within:border-[#F5C518] focus-within:ring-2 focus-within:ring-[#F5C518]/20 transition-all">
                  {/* Category dropdown trigger */}
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 px-4 py-3.5 border-r border-[#2D4080] hover:bg-[#243460] rounded-l-xl transition-colors text-left shrink-0"
                    aria-haspopup="listbox"
                    aria-expanded={categoryDropdownOpen}
                    aria-label="Choose category"
                  >
                    <span className="text-white/90 text-sm font-medium whitespace-nowrap">
                      {categoryLabel}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/60 shrink-0 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} aria-hidden>
                      <path d="M3 4.5l3 3 3-3" />
                    </svg>
                  </button>

                  {/* Search input */}
                  <div className="flex-1 min-w-0 relative" ref={searchSuggestionsRef}>
                    <div className="flex items-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40 ml-3 shrink-0">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <input
                        ref={searchInputRef}
                        type="search"
                        name="q"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            if (suggestionsOpen || categoryDropdownOpen) {
                              setCategoryDropdownOpen(false);
                              setSuggestionsOpen(false);
                            } else {
                              setSearchModalOpen(false);
                            }
                          }
                        }}
                        placeholder="Search products, pipes, fittings, tools..."
                        autoComplete="off"
                        className="w-full px-3 py-3.5 text-white placeholder-white/40 text-sm outline-none bg-transparent"
                        aria-label="Search"
                        aria-autocomplete="list"
                        aria-expanded={suggestionsOpen && suggestions.length > 0}
                      />
                    </div>
                  </div>

                  {/* Search button */}
                  <button
                    type="submit"
                    className="bg-[#F5C518] hover:bg-[#E0B415] text-[#0D1B3E] font-bold text-sm px-6 py-3.5 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-r-xl"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </div>

                {/* Category dropdown list */}
                {categoryDropdownOpen && (
                  <div
                    className="mt-2 max-h-64 overflow-y-auto bg-[#1A2B52] border border-[#2D4080] rounded-xl shadow-2xl py-1"
                    role="listbox"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={categoryId == null}
                      onClick={() => { setCategoryId(null); setCategoryDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${categoryId == null ? "text-[#F5C518] bg-[#243460] font-medium" : "text-white/90 hover:bg-[#243460] hover:text-white"}`}
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
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors truncate ${categoryId === cat.categoryId ? "text-[#F5C518] bg-[#243460] font-medium" : "text-white/90 hover:bg-[#243460] hover:text-white"}`}
                      >
                        {cat.categoryName ?? ""}
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions dropdown */}
                {suggestionsOpen && (suggestions.length > 0 || suggestionsLoading) && (
                  <div
                    className="mt-2 max-h-72 overflow-y-auto bg-[#1A2B52] border border-[#2D4080] rounded-xl shadow-xl py-1"
                    role="listbox"
                  >
                    {suggestionsLoading ? (
                      <div className="px-4 py-5 text-center text-white/60 text-sm flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[#F5C518]" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-[#243460] hover:text-white transition-colors flex items-center gap-3"
                          onClick={() => {
                            const params = new URLSearchParams();
                            params.set("q", (item.name ?? "").trim() || searchQuery);
                            if (categoryId != null && categoryId > 0) params.set("category", String(categoryId));
                            setSuggestionsOpen(false);
                            setSuggestions([]);
                            setSearchModalOpen(false);
                            router.push(`/shop?${params.toString()}`);
                          }}
                        >
                          {item.productImage ? (
                            <img src={item.productImage} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 bg-white/10" />
                          ) : (
                            <span className="w-11 h-11 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="m21 15-5-5L5 21" />
                              </svg>
                            </span>
                          )}
                          <span className="truncate">{item.name ?? ""}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </form>

              {/* Keyboard hint */}
              <div className="px-5 pb-4 flex items-center gap-3 text-white/30 text-xs">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">ESC</kbd>
                  to close
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">Enter</kbd>
                  to search
                </span>
              </div>
            </div>
          </div>
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
              <Link
                href="/ecom/promotions"
                className={`py-3 px-4 font-medium rounded-lg transition-colors ${pathname.startsWith("/ecom/promotions") ? "text-[#F5C518] bg-white/10 font-semibold" : "text-white/80 hover:bg-white/5 hover:text-[#F5C518]"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Promotion
              </Link>
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
                  <Link
                    href="/account/profile"
                    className="flex items-center gap-3 py-3 px-4 font-medium rounded-lg text-white/80 hover:bg-white/5 hover:text-[#F5C518] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My profile
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
