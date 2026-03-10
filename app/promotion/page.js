"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

// Fixed end date: 48 hours from a fixed reference (e.g. sale ends March 6, 2025 23:59:59)
const SALE_END_DATE = new Date("2025-03-06T23:59:59");

const saleProducts = [
  {
    slug: "flash-power-drill",
    name: "Professional Power Drill",
    price: 64.99,
    originalPrice: 99.99,
    image: "https://loremflickr.com/400/500/power,drill,tool?lock=0",
    href: "/shop/professional-power-drill",
    discountPercent: 35,
    stockUrgency: "Only 3 left!",
  },
  {
    slug: "flash-angle-grinder",
    name: "Angle Grinder Set",
    price: 54.99,
    originalPrice: 79.99,
    image: "https://images.pexels.com/photos/162625/grinder-hitachi-power-tool-flexible-162625.jpeg?auto=compress&cs=tinysrgb&w=400",
    href: "/shop/angle-grinder-set",
    discountPercent: 31,
    stockUrgency: "Only 5 left!",
  },
  {
    slug: "flash-circular-saw",
    name: "Cordless Circular Saw",
    price: 99.0,
    originalPrice: 149.0,
    image: "https://loremflickr.com/400/500/circular,saw,tool?lock=2",
    href: "/shop/cordless-circular-saw",
    discountPercent: 34,
    stockUrgency: "Only 2 left!",
  },
  {
    slug: "flash-wood-router",
    name: "Wood Router Kit",
    price: 59.99,
    originalPrice: 89.0,
    image: "https://loremflickr.com/400/500/wood,router,tool?lock=3",
    href: "/shop/wood-router-kit",
    discountPercent: 33,
    stockUrgency: "Only 4 left!",
  },
  {
    slug: "flash-chainsaw",
    name: "Heavy Duty Chainsaw",
    price: 149.0,
    originalPrice: 199.0,
    image: "https://images.pexels.com/photos/209229/pexels-photo-209229.jpeg?auto=compress&cs=tinysrgb&w=400",
    href: "/shop/heavy-duty-chainsaw",
    discountPercent: 25,
    stockUrgency: "Only 1 left!",
  },
  {
    slug: "flash-pvc-cutter",
    name: "PVC Pipe Cutter",
    price: 17.99,
    originalPrice: 24.99,
    image: "https://images.pexels.com/photos/28169591/pexels-photo-28169591.jpeg?auto=compress&cs=tinysrgb&w=400",
    href: "/shop/pvc-pipe-cutter",
    discountPercent: 28,
    stockUrgency: "Only 6 left!",
  },
  {
    slug: "flash-tool-set",
    name: "Professional Tool Set",
    price: 69.99,
    originalPrice: 99.0,
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=80",
    href: "/shop",
    discountPercent: 29,
    stockUrgency: "Only 4 left!",
  },
  {
    slug: "flash-power-saw",
    name: "Power Saw Pro",
    price: 119.0,
    originalPrice: 179.0,
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80",
    href: "/shop",
    discountPercent: 34,
    stockUrgency: "Only 2 left!",
  },
];

function getTimeLeft(endDate) {
  const now = new Date();
  const diff = Math.max(0, endDate.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isExpired: diff <= 0 };
}

function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDate));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(endDate));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (timeLeft.isExpired) {
    return (
      <p className="text-white text-lg sm:text-xl font-semibold">
        Sale has ended. Check back soon for more deals!
      </p>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
      {units.map(({ value, label }) => (
        <div
          key={label}
          className="flex flex-col items-center bg-slate-900/60 backdrop-blur rounded-xl border border-white/20 min-w-[64px] sm:min-w-[72px] py-3 px-2"
        >
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FFB000] tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-xs sm:text-sm text-white/80 uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function PromotionPage() {
  const { addToCart, openDrawer } = useCart();

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      1
    );
    openDrawer();
  };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        @keyframes pulse-urgency {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        .animate-pulse-urgency {
          animation: pulse-urgency 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Flash Sale Hero Banner */}
      <section
        className="relative w-full overflow-hidden bg-[#0D1B3E]"
        style={{ minHeight: "min(420px, 50vh)" }}
        aria-labelledby="flash-sale-heading"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFB000] z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0D1B3E]/95 via-[#0D1B3E]/80 to-[#0D1B3E]/60" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16 flex flex-col items-center justify-center text-center">
          <div className="animate-pulse-urgency inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/90 text-white text-sm font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Sale ends in...
          </div>
          <h1
            id="flash-sale-heading"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-poppins mb-2"
          >
            ⚡ Flash Sale — Today Only!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-6 max-w-xl">
            Massive discounts on top hardware brands. Don&apos;t miss out.
          </p>
          <CountdownTimer endDate={SALE_END_DATE} />
        </div>
      </section>

      {/* 2. Featured Sale Products Grid */}
      <section
        id="featured-sale-products"
        className="py-12 md:py-16 bg-white font-poppins"
        aria-labelledby="sale-products-heading"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            id="sale-products-heading"
            className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center mb-2"
          >
            Featured Sale Products
          </h2>
          <p className="text-slate-600 mb-8 sm:mb-10 text-center text-sm sm:text-base max-w-xl mx-auto">
            Limited stock at unbeatable prices. Add to cart before they&apos;re gone.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {saleProducts.map((product) => (
              <div
                key={product.slug}
                className="group flex flex-col bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-amber-200 hover:scale-[1.02] transition-all duration-300"
              >
                <Link href={product.href} className="flex flex-col flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-xl">
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <img
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      src={product.image}
                      alt={product.name}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white bg-rose-500 rounded-md shadow-sm z-10">
                      -{product.discountPercent}%
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium text-slate-900 bg-[#FFB000] rounded-md shadow-sm z-10">
                      {product.stockUrgency}
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-amber-700 transition-colors flex-1">
                      {product.name}
                    </p>
                    <div className="flex items-baseline gap-2 flex-wrap mt-2">
                      <span className="text-base font-semibold text-slate-800">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-3 sm:p-4 pt-0">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full inline-flex items-center justify-center font-semibold bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2.5 sm:py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 active:scale-[0.98] touch-manipulation text-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Sale Footer Strip */}
      <section
        className="py-4 bg-slate-50 border-t border-slate-200"
        aria-label="Promotion offers"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-slate-700 text-sm sm:text-base font-poppins">
            Free shipping on all orders over $50 · Use code{" "}
            <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
              FLASH10
            </span>{" "}
            for extra 10% off
          </p>
        </div>
      </section>
    </div>
  );
}
