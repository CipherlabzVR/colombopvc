"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";

const STORAGE_KEY = "colombo_pvc_cart";
const TOAST_DURATION = 2500;

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* quota exceeded - silently ignore */ }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.items;

    case "ADD": {
      const { product, qty } = action;
      const idx = state.findIndex((i) => i.slug === product.slug);
      if (idx >= 0) {
        const copy = [...state];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...state, { ...product, qty }];
    }

    case "SET_QTY": {
      const { slug, qty } = action;
      if (qty <= 0) return state.filter((i) => i.slug !== slug);
      return state.map((i) => (i.slug === slug ? { ...i, qty } : i));
    }

    case "REMOVE":
      return state.filter((i) => i.slug !== action.slug);

    case "CLEAR":
      return [];

    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [checkoutSelection, setCheckoutSelectionState] = useState(null);
  const hydrated = useRef(false);
  const toastTimer = useRef(null);

  const setCheckoutSelection = useCallback((slugs) => {
    setCheckoutSelectionState(Array.isArray(slugs) ? slugs : null);
  }, []);

  useEffect(() => {
    dispatch({ type: "HYDRATE", items: loadCart() });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) saveCart(items);
  }, [items]);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addToCart = useCallback((product, qty = 1) => {
    if (product?.isOutOfStock) {
      showToast("This item is out of stock");
      return;
    }
    dispatch({ type: "ADD", product, qty });
    showToast(`${product.name} added to cart`);
    openDrawer();
  }, [showToast, openDrawer]);

  const setQty = useCallback((slug, qty) => {
    dispatch({ type: "SET_QTY", slug, qty });
  }, []);

  const removeFromCart = useCallback((slug) => {
    dispatch({ type: "REMOVE", slug });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const itemsForCheckout = useMemo(() => {
    if (!checkoutSelection || checkoutSelection.length === 0) return items;
    const set = new Set(checkoutSelection);
    return items.filter((i) => set.has(i.slug));
  }, [items, checkoutSelection]);

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      checkoutSelection,
      setCheckoutSelection,
      itemsForCheckout,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      drawerOpen,
      openDrawer,
      closeDrawer,
      toast,
    }),
    [items, totalItems, totalPrice, checkoutSelection, setCheckoutSelection, itemsForCheckout, addToCart, setQty, removeFromCart, clearCart, drawerOpen, openDrawer, closeDrawer, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
