"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* Top accent */}
      <div className="h-1 bg-[#FACC15]" />

      {/* Compact mobile footer (< md) */}
      <div className="md:hidden max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/logo.png"
            alt="Colombo PVC Center"
            width={40}
            height={40}
            className="rounded-lg shrink-0"
          />
          <div className="min-w-0">
            <p className="text-base font-bold text-white font-poppins leading-tight">
              Colombo <span className="text-[#FACC15]">PVC</span> Center
            </p>
            <p className="text-[11px] text-slate-400 font-poppins">PVC pipes, fittings & plumbing supplies</p>
          </div>
        </div>

        {/* Inline quick links */}
        <ul className="flex flex-wrap gap-x-4 gap-y-2 mb-5 font-poppins">
          <li><Link href="/" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors">Home</Link></li>
          <li><Link href="/shop" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors">Shop</Link></li>
          <li><Link href="/ecom/promotions" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors">Promotion</Link></li>
          <li><Link href="/about" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors">About</Link></li>
          <li><Link href="/contact" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors">Contact</Link></li>
          <li><Link href="/faqs" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors">FAQs</Link></li>
        </ul>

        {/* Compact contact */}
        <div className="space-y-2 mb-5 font-poppins">
          <a href="tel:94776867877" className="flex items-center gap-2 text-sm text-slate-300 hover:text-[#FACC15] transition-colors">
            <svg className="w-4 h-4 text-[#FACC15] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            077 686 7877
          </a>
          <a href="mailto:sales.colombopvc@gmail.com" className="flex items-center gap-2 text-sm text-slate-300 hover:text-[#FACC15] transition-colors break-all">
            <svg className="w-4 h-4 text-[#FACC15] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            sales.colombopvc@gmail.com
          </a>
          <p className="flex items-start gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            No. 192/4, Srimath Bandaranayaka Mw, Colombo 12
          </p>
        </div>

        {/* Social + policies */}
        <div className="flex items-center justify-between mb-4">
          <a
            href="https://www.facebook.com/share/1CfDuyt7Bo/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 hover:bg-[#FACC15] hover:text-slate-900 transition-all"
            aria-label="Facebook"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <div className="flex gap-3 text-[11px] font-poppins">
            <Link href="/privacy" className="text-slate-400 hover:text-[#FACC15] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#FACC15] transition-colors">Terms</Link>
            <Link href="/refund" className="text-slate-400 hover:text-[#FACC15] transition-colors">Refund</Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/50 text-center">
          <p className="text-[11px] text-slate-500 font-poppins">
            © {new Date().getFullYear()} Colombo PVC Center
          </p>
          <p className="text-[10px] text-slate-600 font-poppins mt-0.5">
            Powered by{" "}
            <a
              href="https://www.clovesis.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#FACC15] transition-colors"
            >
              Clovesis Labz
            </a>
          </p>
        </div>
      </div>

      {/* Full footer (md and up) */}
      <div className="hidden md:block max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        {/* Main footer content */}
        <div className="py-10 sm:py-14 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12">
            {/* Logo & Company - spans 2 cols on large */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                <Image
                  src="/logo.png"
                  alt="Colombo PVC Center"
                  width={44}
                  height={44}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-white font-poppins">
                  Colombo <span className="text-[#FACC15]">PVC</span> Center
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6 font-poppins">
                Your trusted partner for PVC pipes, fittings, and plumbing supplies in Colombo and Sri Lanka. Quality brands, reliable delivery. Est. 2025.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/share/1CfDuyt7Bo/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-[#FACC15] hover:text-slate-900 transition-all"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 font-poppins">
                Quick Links
              </h4>
              <ul className="space-y-3 font-poppins">
                <li><Link href="/" className="text-sm text-slate-400 hover:text-[#FACC15] transition-colors">Home</Link></li>
                <li><Link href="/shop" className="text-sm text-slate-400 hover:text-[#FACC15] transition-colors">Shop</Link></li>
                <li><Link href="/ecom/promotions" className="text-sm text-slate-400 hover:text-[#FACC15] transition-colors">Promotion</Link></li>
                <li><Link href="/about" className="text-sm text-slate-400 hover:text-[#FACC15] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-400 hover:text-[#FACC15] transition-colors">Contact Us</Link></li>
                <li><Link href="/faqs" className="text-sm text-slate-400 hover:text-[#FACC15] transition-colors">FAQs</Link></li>
                <li><Link href="/refund" className="text-sm text-slate-400 hover:text-[#FACC15] transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 font-poppins">
                Contact
              </h4>
              <ul className="space-y-4 font-poppins">
                <li className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-[#FACC15] shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Phone</p>
                    <a href="tel:94776867877" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors block">Hot line: 077 686 7877</a>
                    <a href="tel:94777264913" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors block">077 726 4913</a>
                    <a href="tel:94764627447" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors block">076 462 7447</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-[#FACC15] shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                    <a href="mailto:sales.colombopvc@gmail.com" className="text-sm text-slate-300 hover:text-[#FACC15] transition-colors">
                      sales.colombopvc@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-[#FACC15] shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Address</p>
                    <span className="text-sm text-slate-300">No. 192/4, Srimath Bandaranayaka Mawatha, Colombo 12</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Business Hours */}
            <div className="min-w-0">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 font-poppins">
                Business Hours
              </h4>
              <ul className="space-y-4 text-sm font-poppins">
                <li className="space-y-1">
                  <p className="text-slate-300 leading-snug">Monday – Saturday</p>
                  <p className="text-slate-400 tabular-nums leading-snug whitespace-nowrap">
                    9:00 AM – 6:00 PM
                  </p>
                </li>
                <li className="space-y-1">
                  <p className="text-slate-300 leading-snug">Sunday</p>
                  <p className="text-slate-400 tabular-nums leading-snug whitespace-nowrap">
                    10:00 AM – 1:00 PM
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 sm:py-5 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-slate-500 text-xs sm:text-sm font-poppins">
                © {new Date().getFullYear()} Colombo PVC Center. All rights reserved.
              </p>
              <p className="text-slate-600 text-xs font-poppins tracking-wide">
                Powered by{" "}
                <a
                  href="https://www.clovesis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#FACC15] transition-colors"
                >
                  Clovesis Labz
                </a>
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm justify-center">
              <Link href="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors font-poppins">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-500 hover:text-slate-300 transition-colors font-poppins">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-slate-500 hover:text-slate-300 transition-colors font-poppins">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
