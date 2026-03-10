"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategorySidebar from "@/components/shop/CategorySidebar";
import ProductGrid from "@/components/shop/ProductGrid";
import ProductQuickView from "@/components/shop/ProductQuickView";
import ShopPagination from "@/components/shop/ShopPagination";
import { mapApiItemToProduct } from "@/components/shop/shopData";
import { getCategoriesWithItemCount, getAllItemsForWeb } from "@/lib/shopApi";

const PAGE_SIZE_OPTIONS = [8, 12, 16, 24, 32];
const DEFAULT_PAGE_SIZE = 12;

function parseId(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryIdParam = searchParams.get("category");
  const subIdParam = searchParams.get("sub");
  const queryParam = (searchParams.get("q") ?? "").trim();
  const pageParam = searchParams.get("page");

  const selectedCategoryId = parseId(categoryIdParam);
  const selectedSubCategoryId = parseId(subIdParam);
  const currentPage = useMemo(() => {
    const p = parseInt(pageParam, 10);
    if (!Number.isFinite(p) || p < 1) return 1;
    return p;
  }, [pageParam]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  const [itemsData, setItemsData] = useState({ totalCount: 0, items: [] });
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(null);

  const [expandedCategoryId, setExpandedCategoryId] = useState(selectedCategoryId ?? null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const searchDebounceRef = useRef(null);

  const fetchItemsList = useCallback(
    (pageNumber, searchText, size) => {
      setItemsLoading(true);
      setItemsError(null);
      getAllItemsForWeb({
        pageNumber,
        pageSize: size,
        categoryId: selectedCategoryId ?? undefined,
        subCategoryId: selectedSubCategoryId ?? undefined,
        searchText: searchText && searchText.trim() ? searchText.trim() : undefined,
      })
        .then(({ totalCount, items }) => setItemsData({ totalCount, items }))
        .catch((err) => setItemsError(err.message || "Failed to load products"))
        .finally(() => setItemsLoading(false));
    },
    [selectedCategoryId, selectedSubCategoryId]
  );

  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;
      setSearchTerm(value);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) params.set("q", value.trim());
        else params.delete("q");
        params.set("page", "1");
        router.replace(params.toString() ? `/shop?${params.toString()}` : "/shop", { scroll: false });
        searchDebounceRef.current = null;
      }, 350);
    },
    [searchParams, router]
  );

  const handlePageChange = useCallback(
    (event, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value <= 1) params.delete("page");
      else params.set("page", String(value));
      router.replace(params.toString() ? `/shop?${params.toString()}` : "/shop", { scroll: false });
    },
    [searchParams, router]
  );

  const handlePageSizeChange = useCallback(
    (event) => {
      const newSize = Number(event.target.value) || DEFAULT_PAGE_SIZE;
      setPageSize(newSize);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.replace(params.toString() ? `/shop?${params.toString()}` : "/shop", { scroll: false });
    },
    [searchParams, router]
  );

  // Fetch categories once
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    setCategoriesError(null);
    getCategoriesWithItemCount()
      .then((list) => {
        if (!cancelled) {
          setCategories(list);
          if (list.length > 0 && expandedCategoryId == null) {
            setExpandedCategoryId(list[0].categoryId);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setCategoriesError(err.message || "Failed to load categories");
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Keep expanded in sync with selection
  useEffect(() => {
    if (selectedCategoryId != null) setExpandedCategoryId(selectedCategoryId);
  }, [selectedCategoryId]);

  // Fetch items when page, search (URL), category, or pageSize change
  useEffect(() => {
    fetchItemsList(currentPage, queryParam, pageSize);
  }, [currentPage, queryParam, selectedCategoryId, selectedSubCategoryId, pageSize, fetchItemsList]);

  // Sync searchTerm from URL (e.g. back button or initial load)
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const categoryNames = useMemo(() => {
    const byCat = new Map();
    const bySub = new Map();
    categories.forEach((c) => {
      byCat.set(c.categoryId, c.categoryName);
      (c.subCategories || []).forEach((s) => {
        bySub.set(s.subCategoryId, s.subCategoryName);
      });
    });
    return { byCat, bySub };
  }, [categories]);

  const products = useMemo(() => {
    return itemsData.items.map((item) => {
      const catName = categoryNames.byCat.get(item.categoryId) ?? "";
      const subName = categoryNames.bySub.get(item.subCategoryId) ?? "";
      return mapApiItemToProduct(item, catName, subName);
    }).filter(Boolean);
  }, [itemsData.items, categoryNames]);

  const totalPages = Math.max(1, Math.ceil(itemsData.totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const activeCategory = categories.find((c) => c.categoryId === selectedCategoryId);
  const activeSub = activeCategory?.subCategories?.find(
    (s) => s.subCategoryId === selectedSubCategoryId
  );
  const heading = activeSub
    ? `${activeCategory?.categoryName ?? ""} / ${activeSub.subCategoryName}`
    : activeCategory
      ? activeCategory.categoryName
      : "All Products";

  const getPageUrl = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      const qs = params.toString();
      return qs ? `/shop?${qs}` : "/shop";
    },
    [searchParams]
  );

  const replaceFilters = useCallback(
    ({ category, sub }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category != null) params.set("category", String(category));
      else params.delete("category");
      if (sub != null) params.set("sub", String(sub));
      else params.delete("sub");
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
    },
    [router, searchParams]
  );

  const handleClearFilters = useCallback(() => {
    replaceFilters({ category: null, sub: null });
  }, [replaceFilters]);

  const handleCategoryClick = useCallback(
    (categoryId) => {
      if (categoryId === selectedCategoryId) {
        setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
        return;
      }
      setExpandedCategoryId(categoryId);
      replaceFilters({ category: categoryId, sub: null });
    },
    [selectedCategoryId, replaceFilters]
  );

  const handleSubcategoryClick = useCallback(
    (categoryId, subCategoryId) => {
      setExpandedCategoryId(categoryId);
      replaceFilters({ category: categoryId, sub: subCategoryId });
    },
    [replaceFilters]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6 sm:py-8 font-poppins">
        <div className="mb-4 sm:mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Shop</h1>
              <p className="text-sm text-slate-600 mt-1">
                Browse products by category. Only web-visible items are shown.
              </p>
            </div>
            <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{heading}</span>{" "}
            <span className="text-slate-400">•</span>{" "}
            <span>
              {itemsLoading
                ? "Loading…"
                : `${itemsData.totalCount} item${itemsData.totalCount !== 1 ? "s" : ""}`}
            </span>
            </div>
          </div>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const params = new URLSearchParams(searchParams.toString());
              const v = searchTerm.trim();
              if (v) params.set("q", v);
              else params.delete("q");
              params.set("page", "1");
              router.replace(params.toString() ? `/shop?${params.toString()}` : "/shop", { scroll: false });
            }}
          >
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products…"
              className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-2 text-sm text-black placeholder-slate-400 focus:border-[#FACC15] focus:outline-none focus:ring-1 focus:ring-[#FACC15]"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="shrink-0 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {categoriesError && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
            {categoriesError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <CategorySidebar
              categories={categories}
              expandedCategoryId={expandedCategoryId}
              selectedCategoryId={selectedCategoryId}
              selectedSubCategoryId={selectedSubCategoryId}
              onCategoryClick={handleCategoryClick}
              onSubcategoryClick={handleSubcategoryClick}
              onClearFilters={handleClearFilters}
              loading={categoriesLoading}
            />
          </div>

          <section className="flex-1 min-w-0">
            {itemsError && (
              <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">
                {itemsError}
              </div>
            )}

            {itemsLoading ? (
              <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-slate-500">
                Loading products…
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-sm text-slate-600">
                    {itemsData.totalCount} item{itemsData.totalCount !== 1 ? "s" : ""}
                  </span>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <span>Per page</span>
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-black bg-white focus:border-[#FACC15] focus:outline-none focus:ring-1 focus:ring-[#FACC15]"
                      aria-label="Items per page"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <ProductGrid
                  products={products}
                  onProductClick={setQuickViewProduct}
                />
                <ShopPagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  getPageUrl={getPageUrl}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="rounded-md border border-slate-200 bg-white p-6">
                <p className="text-slate-800 font-semibold">No products found</p>
                <p className="text-slate-600 text-sm mt-1">
                  Try another category or clear the filters. Only items visible on the web are listed.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 inline-flex items-center justify-center bg-[#FACC15] hover:bg-[#EAB308] active:scale-[0.98] text-slate-900 font-semibold px-4 py-2 rounded-md transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </main>
  );
}
