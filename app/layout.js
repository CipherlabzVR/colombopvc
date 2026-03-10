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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Colombo PVC",
  description: "",
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
    <html lang="en">
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
