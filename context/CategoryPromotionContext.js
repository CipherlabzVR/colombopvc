"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCategoryDiscountRules,
  fetchProductDiscountRules,
  fetchTotalAmountDiscountRules,
} from "@/lib/promotionsApi";

const CategoryPromotionContext = createContext(null);

export function CategoryPromotionProvider({ children }) {
  const [rules, setRules] = useState([]);
  const [productRules, setProductRules] = useState([]);
  const [totalAmountRules, setTotalAmountRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cat, prod, totalAmt] = await Promise.all([
        fetchCategoryDiscountRules(),
        fetchProductDiscountRules(),
        fetchTotalAmountDiscountRules(),
      ]);
      setRules(Array.isArray(cat) ? cat : []);
      setProductRules(Array.isArray(prod) ? prod : []);
      setTotalAmountRules(Array.isArray(totalAmt) ? totalAmt : []);
    } catch (e) {
      setRules([]);
      setProductRules([]);
      setTotalAmountRules([]);
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
      totalAmountRules,
      loading,
      error,
      refresh,
    }),
    [rules, productRules, totalAmountRules, loading, error, refresh],
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
      totalAmountRules: [],
      loading: false,
      error: null,
      refresh: async () => {},
    };
  }
  return ctx;
}
