import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export const metadata = {
  title: "Shop | Colombo PVC Center",
  description:
    "Shop PVC pipes, fittings, solvent cement, taps, and plumbing supplies in Sri Lanka. S-Lon, Anton, National, ERA. Colombo delivery and island-wide.",
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

