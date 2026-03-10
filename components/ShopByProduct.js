"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllItemsForWeb } from "@/lib/shopApi";
import { mapApiItemToProduct, formatRs } from "@/components/shop/shopData";

const FEATURED_COUNT = 6;

function SaleBadge() {
  return (
    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white bg-amber-500 rounded-md shadow-sm z-10">
      Sale
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function ShopByProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllItemsForWeb({ pageNumber: 1, pageSize: FEATURED_COUNT })
      .then(({ items }) => {
        if (!cancelled) {
          setProducts(items.map((item) => mapApiItemToProduct(item)).filter(Boolean));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <section id="shop-by-product" className="py-12 md:py-16 bg-white" aria-labelledby="product-heading">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 id="product-heading" className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center mb-2 font-poppins">
          Shop By Product
        </h2>
        <p className="text-slate-600 mb-8 sm:mb-10 font-poppins text-center text-sm sm:text-base max-w-xl mx-auto">
          Browse our best-selling tools and equipment for your projects.
        </p>

        {error && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 font-poppins">
          {loading
            ? Array.from({ length: FEATURED_COUNT }, (_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop?q=${encodeURIComponent(product.name)}`}
                  className="group flex flex-col bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.99] transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <img
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      src={product.image}
                      alt={product.name}
                    />
                    {product.badge && <SaleBadge />}
                    <span className="absolute bottom-2 left-2 right-2 py-1.5 text-center text-xs font-medium text-white bg-slate-900/80 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View details
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-amber-700 transition-colors flex-1">
                      {product.name}
                    </p>
                    <div className="flex items-baseline gap-2 flex-wrap mt-2">
                      <span className="text-base font-semibold text-slate-800">
                        {formatRs(product.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 font-poppins font-semibold bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-3 sm:px-8 rounded-lg shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.98] transition-all duration-200 touch-manipulation"
          >
            View All Products
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
