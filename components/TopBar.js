"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllTopBarNotifications } from "@/lib/topBarApi";

const FALLBACK_MESSAGE = "Get Upto 25% Cashback: GET25OFF";
const ROTATE_INTERVAL_MS = 5000;

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "";
  const format = (d) => {
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };
  const start = startDate ? format(startDate) : "";
  const end = endDate ? format(endDate) : "";
  if (start && end) return ` (${start} – ${end})`;
  if (end) return ` (Valid till ${end})`;
  if (start) return ` (From ${start})`;
  return "";
}

export default function TopBar() {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fallback, setFallback] = useState(FALLBACK_MESSAGE);

  useEffect(() => {
    let cancelled = false;

    getAllTopBarNotifications({ skipCount: 0, maxResultCount: 10, isCurrentDate: true })
      .then((list) => {
        if (!cancelled) {
          setNotifications(list);
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) setFallback(FALLBACK_MESSAGE);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (notifications.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [notifications.length]);

  const hasNotifications = notifications.length > 0;
  const current = hasNotifications ? notifications[currentIndex] : null;
  const message = current ? (current.message ?? "").trim() : fallback;
  const timeFrame = current ? formatDateRange(current.startDate, current.endDate) : "";

  return (
    <div className="bg-[#1e3a5f] text-[#7eb8da] px-2 sm:px-3 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
      <p className="flex items-center justify-center sm:justify-start gap-1 text-center flex-wrap">
        {notifications.length > 1 && (
          <span className="flex items-center gap-1 mr-1" aria-hidden>
            {notifications.map((_, i) => (
              <span
                key={i}
                className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-[#7eb8da]" : "bg-[#7eb8da]/40"
                }`}
              />
            ))}
          </span>
        )}
        <span>{message}{timeFrame && <span className="text-[#9ecce8] opacity-90">{timeFrame}</span>}</span>
        {" - "}
        <Link
          href="/shop"
          className="underline hover:text-[#9ecce8] transition-colors whitespace-nowrap"
        >
          SHOP NOW
        </Link>
      </p>
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
        <a
          href="tel:94776867877"
          className="flex items-center gap-2 text-white hover:text-[#F5C518] transition-colors whitespace-nowrap"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F5C518] shrink-0">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          <span className="text-sm font-medium">
            Call Now: <span className="text-[#F5C518]">077 686 7877</span>
          </span>
        </a>
        <span className="text-gray-400 hidden sm:inline">|</span>
        <nav className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
          <Link href="/about" className="hover:text-[#9ecce8] transition-colors px-1">
            About Us
          </Link>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <Link href="/contact" className="hover:text-[#9ecce8] transition-colors px-1">
            Contact Us
          </Link>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <Link href="/faqs" className="hover:text-[#9ecce8] transition-colors px-1">
            FAQs
          </Link>
        </nav>
      </div>
    </div>
  );
}
