"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCategoryDiscountRules, fetchProductDiscountRules } from "@/lib/promotionsApi";

const CategoryPromotionContext = createContext(null);

export function CategoryPromotionProvider({ children }) {
  const [rules, setRules] = useState([]);
  const [productRules, setProductRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cat, prod] = await Promise.all([fetchCategoryDiscountRules(), fetchProductDiscountRules()]);
      setRules(Array.isArray(cat) ? cat : []);
      setProductRules(Array.isArray(prod) ? prod : []);
    } catch (e) {
      setRules([]);
      setProductRules([]);
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
      productRules,
      loading,
      error,
      refresh,
    }),
    [rules, productRules, loading, error, refresh],
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
    return {
      rules: [],
      productRules: [],
      loading: false,
      error: null,
      refresh: async () => {},
    };
  }
  return ctx;
}
