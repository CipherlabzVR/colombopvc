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
import { SITE_URL, DEFAULT_OG_IMAGE, SEO, GOOGLE_SITE_VERIFICATION } from "@/lib/seo";

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
    default: SEO.defaultTitle,
    template: "%s",
  },
  description: SEO.defaultDescription,
  keywords: SEO.keywords,
  authors: [{ name: "Colombo PVC Center", url: SITE_URL }],
  creator: "Colombo PVC Center",
  publisher: "Colombo PVC Center",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: SEO.locale,
    url: SITE_URL,
    siteName: SEO.siteName,
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 512,
        height: 512,
        alt: "Colombo PVC Center - PVC Pipes & Plumbing Supplies Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    ...(GOOGLE_SITE_VERIFICATION && { google: GOOGLE_SITE_VERIFICATION }),
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Colombo PVC Center",
  description: "PVC pipes, fittings, solvent cement, and plumbing supplies in Colombo and Sri Lanka. S-Lon, Anton, National, ERA.",
  url: SITE_URL,
  image: DEFAULT_OG_IMAGE,
  telephone: "+94776867877",
  areaServed: { "@type": "Country", name: "Sri Lanka" },
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-LK">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
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
