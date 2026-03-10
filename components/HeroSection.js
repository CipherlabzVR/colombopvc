"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getAllHeroBanners } from "@/lib/heroApi";

const AUTO_PLAY_INTERVAL = 5000;

const FALLBACK_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1920&q=80",
    title: "Professional Tool Set",
    subtitle: "For Home Repair",
    ctaLink: "/shop",
  },
];

function normalizeBannersToSlides(banners) {
  if (!Array.isArray(banners) || banners.length === 0) return FALLBACK_SLIDES;

  return banners.map((banner) => {
    const images = Array.isArray(banner.bannerImages) ? banner.bannerImages : [];
    const sortedImages = [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const firstImage = sortedImages[0]?.imgUrl ?? "";

    return {
      id: banner.id ?? banner.internalId,
      image: firstImage,
      title: banner.title ?? "",
      subtitle: banner.description ?? "",
      ctaLink: "/shop",
    };
  });
}

export default function HeroSection() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllHeroBanners({ skipCount: 0, maxResultCount: 10 })
      .then((banners) => {
        if (!cancelled) {
          const normalized = normalizeBannersToSlides(banners);
          setSlides(normalized);
          setCurrentIndex(0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? "Failed to load banners");
          setSlides(FALLBACK_SLIDES);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentIndex(index);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  const currentSlide = slides[currentIndex];

  if (slides.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden shrink-0"
      style={{ height: "calc(100vh - 140px)", minHeight: "360px", maxHeight: "720px" }}
      aria-label="Hero banner carousel"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFB000] z-10" />

      {slides.map((slide, index) => (
        <div
          key={slide.id ?? index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
          }`}
          style={{ backgroundImage: slide.image ? `url('${slide.image}')` : undefined }}
          aria-hidden={index !== currentIndex}
        />
      ))}

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent z-[1]"
        aria-hidden
      />

      <button
        type="button"
        onClick={goToPrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1e3a5f]/95 hover:bg-[#1e3a5f] active:scale-95 flex items-center justify-center text-white transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
        aria-label="Previous slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1e3a5f]/95 hover:bg-[#1e3a5f] active:scale-95 flex items-center justify-center text-white transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
        aria-label="Next slide"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-5 h-full flex flex-col justify-center">
        <div className="max-w-xl">
          {error && (
            <p className="text-amber-400 text-xs sm:text-sm mb-2" role="alert">
              {error}
            </p>
          )}
          {currentSlide.title && (
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-1 sm:mb-2">
              {currentSlide.title}
            </h1>
          )}
          {currentSlide.subtitle && (
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4">
              {currentSlide.subtitle}
            </h2>
          )}
          <Link
            href={currentSlide.ctaLink ?? "/shop"}
            className="inline-flex items-center justify-center bg-[#FFB000] hover:bg-[#e69f00] active:scale-[0.98] text-white font-semibold px-6 py-2.5 sm:px-8 sm:py-3 rounded-md uppercase tracking-wide transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
          >
            SHOP NOW
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 md:left-12 z-20 flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id ?? index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors p-1 -m-1 ${
                index === currentIndex ? "bg-white" : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
