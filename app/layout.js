import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CartToast from "@/components/cart/CartToast";
import MobileNav from "@/components/MobileNav";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Colombo PVC | PVC Pipes, Fittings & Plumbing Supplies in Sri Lanka",
    template: "%s | Colombo PVC",
  },
  description:
    "Colombo PVC is your trusted supplier of PVC pipes, fittings, solvent cement, and plumbing supplies in Colombo and across Sri Lanka. SLS-standard products, local delivery, and expert advice for builders and homeowners.",
  keywords: [
    "PVC pipes Sri Lanka",
    "PVC fittings Colombo",
    "plumbing supplies Sri Lanka",
    "SLS PVC pipes",
    "water pipes Colombo",
    "Anton pipes",
    "S-Lon PVC",
    "solvent cement Sri Lanka",
    "building materials Colombo",
    "Colombo PVC",
  ],
  authors: [{ name: "Colombo PVC", url: SITE_URL }],
  creator: "Colombo PVC",
  publisher: "Colombo PVC",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: SITE_URL,
    siteName: "Colombo PVC",
    title: "Colombo PVC | PVC Pipes, Fittings & Plumbing Supplies in Sri Lanka",
    description:
      "Quality PVC pipes, fittings, and plumbing supplies in Colombo and Sri Lanka. SLS standards, local delivery, expert advice.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Colombo PVC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colombo PVC | PVC Pipes & Plumbing Supplies in Sri Lanka",
    description: "Your trusted supplier of PVC pipes, fittings, and plumbing supplies in Colombo and across Sri Lanka.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: SITE_URL },
  category: "Building Materials",
  other: {
    "geo.region": "LK",
    "geo.placename": "Colombo",
    "geo.position": "6.9271;79.8612",
    "ICBM": "6.9271, 79.8612",
  },
  icons: {
    icon: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-LK">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <TopBar />
          <Suspense fallback={<div className="bg-[#0D1B3E] min-h-[72px] md:min-h-[88px]" />}>
            <Navbar />
          </Suspense>
          <main className="pb-14 md:pb-0">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <CartToast />
          <MobileNav />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
