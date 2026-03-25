"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { formatRs } from "@/components/shop/shopData";
import { useCart } from "@/context/CartContext";
import { useCategoryPromotions } from "@/context/CategoryPromotionContext";
import { effectiveUnitPriceAfterPromotion } from "@/lib/categoryPromotionPricing";
import { OutOfStockOverlay } from "@/components/shop/OutOfStockOverlay";

/**
 * Build ordered list of all product images: main productImage first, then itemSubImages.
 * Each entry includes id, url, description, price (from itemSubImage when available).
 */
function getAllImages(product) {
  if (!product) return [];
  const main = product.image
    ? [
        {
          id: "main",
          url: product.image,
          description: product.name,
          price: null,
          isOutOfStock: !!product.isOutOfStock,
        },
      ]
    : [];
  const sub = Array.isArray(product.itemSubImages)
    ? product.itemSubImages.filter((s) => s?.url).map((s) => ({
        id: s.id ?? `sub-${s.url}`,
        url: s.url,
        description: s.description ?? "",
        price: s.price != null && Number.isFinite(Number(s.price)) ? Number(s.price) : null,
        isOutOfStock: !!s.isOutOfStock,
      }))
    : [];
  return [...main, ...sub];
}

function getFirstInStockImageIndex(images) {
  const i = images.findIndex((img) => !img.isOutOfStock);
  return i >= 0 ? i : 0;
}

export default function ProductQuickView({ product, onClose }) {
  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { rules, productRules } = useCategoryPromotions();

  const allImages = useMemo(() => getAllImages(product), [product]);

  useEffect(() => {
    if (!product) return;
    const images = getAllImages(product);
    setSelectedImageIndex(getFirstInStockImageIndex(images));
    setQty(1);
  }, [product]);

  const handleEsc = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [handleEsc]);

  if (!product) return null;

  const safeIndex = Math.min(selectedImageIndex, Math.max(0, allImages.length - 1));
  const currentImage = allImages[safeIndex];
  const hasMultipleImages = allImages.length > 1;

  /** Effective price: sub-image price when selected and available, else product price */
  const effectivePrice = currentImage?.price != null ? currentImage.price : product.price;
  const promoUnit = effectiveUnitPriceAfterPromotion(
    effectivePrice,
    1,
    product.categoryId,
    rules,
    product.id,
    productRules,
  );
  const showPromoPrice = promoUnit < effectivePrice - 0.001;
  /** Effective description: sub-image description when selected (not main slot), else product description */
  const effectiveDescription =
    currentImage?.id !== "main" && currentImage?.description
      ? currentImage.description
      : product.description;

  const allGalleryOptionsOutOfStock =
    allImages.length > 0 && allImages.every((img) => img.isOutOfStock);

  function handleAddToCart() {
    if (currentImage?.isOutOfStock) return;
    const isVariant = currentImage && currentImage.id !== "main";
    const variantId =
      typeof currentImage.id === "number" ? currentImage.id : safeIndex;
    const cartProduct = isVariant
      ? {
          ...product,
          id: product.id,
          price: effectivePrice,
          image: currentImage.url,
          name: currentImage.description
            ? `${product.name} — ${currentImage.description}`
            : product.name,
          slug: `${product.slug}-variant-${variantId}`,
          baseSlug: product.slug,
          variantDescription: currentImage.description,
          itemSubImageId: typeof currentImage.id === "number" ? currentImage.id : undefined,
          isOutOfStock: false,
        }
      : {
          ...product,
          image: currentImage?.url || product.image,
          price: effectivePrice,
          isOutOfStock: false,
        };
    addToCart(cartProduct, qty);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Product Details</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
            {/* Image gallery: main image + thumbnails when itemSubImages available */}
            <div className="sm:w-2/5 shrink-0 flex flex-col gap-3">
              <div className="relative bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center aspect-square overflow-hidden">
                {currentImage ? (
                  <>
                    <img
                      key={currentImage.id}
                      src={currentImage.url}
                      alt={currentImage.description || product.name}
                      className={`w-full h-full object-contain transition-opacity duration-200 ${
                        currentImage.isOutOfStock ? "opacity-55" : ""
                      }`}
                    />
                    {currentImage.isOutOfStock && <OutOfStockOverlay />}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    No image
                  </div>
                )}
              </div>
              {hasMultipleImages && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${
                        safeIndex === idx
                          ? "border-slate-800 ring-2 ring-slate-800 ring-offset-1"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                      aria-label={`View image ${idx + 1}${img.isOutOfStock ? " (out of stock)" : ""}`}
                      aria-pressed={safeIndex === idx}
                    >
                      <img
                        src={img.url}
                        alt={img.description || ""}
                        className={`w-full h-full object-contain bg-white ${
                          img.isOutOfStock ? "opacity-50 grayscale-[0.35]" : ""
                        }`}
                      />
                      {img.isOutOfStock && (
                        <span className="absolute inset-x-0 bottom-0 bg-rose-700/95 text-white text-[8px] font-extrabold leading-tight py-0.5 px-0.5 text-center uppercase tracking-tighter">
                          OOS
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h3>

              <p className="text-sm text-slate-500 mt-1.5">
                Product Code: <span className="font-medium text-slate-600">{product.productCode}</span>
              </p>

              <div className="mt-4 border-t border-slate-100 pt-4">
                {showPromoPrice ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-lg font-semibold text-slate-400 line-through">
                      {formatRs(effectivePrice)}
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                      {formatRs(promoUnit)}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                    {formatRs(effectivePrice)}
                  </p>
                )}
                {currentImage?.isOutOfStock && (
                  <p className="text-sm font-semibold text-rose-600 mt-2">
                    {allGalleryOptionsOutOfStock
                      ? "This product is out of stock."
                      : "This Product is out of stock."}
                  </p>
                )}
                {currentImage?.id !== "main" && currentImage?.description && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">{currentImage.description}</p>
                )}
              </div>

              {/* Category / Brand */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <span className="inline-flex items-center bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {product.subcategory}
                </span>
              </div>

              {/* Description: product description or selected sub-image description */}
              {(effectiveDescription || product.description) && (
                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-800 mb-1.5">Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {effectiveDescription || product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Quantity + Add to Cart */}
        <div className="shrink-0 border-t border-slate-200 px-5 sm:px-6 py-4 bg-white rounded-b-xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Decrease quantity"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
              </button>
              <span className="w-12 h-11 flex items-center justify-center text-base font-semibold text-slate-800 border-x border-slate-300">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((prev) => prev + 1)}
                className="w-10 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Increase quantity"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!!currentImage?.isOutOfStock}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-semibold py-3.5 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {currentImage?.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
