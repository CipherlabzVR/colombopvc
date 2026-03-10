import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export const metadata = {
  title: "Shop | Colombo PVC",
  description: "Browse Colombo PVC products by category and brand.",
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-50 px-2 sm:px-3 lg:px-4 py-8" />}
    >
      <ShopClient />
    </Suspense>
  );
}

