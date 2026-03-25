"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCategoryDiscountRules } from "@/lib/promotionsApi";

const CategoryPromotionContext = createContext(null);

export function CategoryPromotionProvider({ children }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchCategoryDiscountRules();
      setRules(Array.isArray(next) ? next : []);
    } catch (e) {
      setRules([]);
      setError(e?.message ?? "Promotions unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      rules,
      loading,
      error,
      refresh,
    }),
    [rules, loading, error, refresh],
  );

  return (
    <CategoryPromotionContext.Provider value={value}>
      {children}
    </CategoryPromotionContext.Provider>
  );
}

export function useCategoryPromotions() {
  const ctx = useContext(CategoryPromotionContext);
  if (!ctx) {
    return { rules: [], loading: false, error: null, refresh: async () => {} };
  }
  return ctx;
}
