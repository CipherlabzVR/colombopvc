import ShopClient from "@/components/shop/ShopClient";
import { Suspense } from "react";

export const metadata = {
  title: "Shop PVC Pipes & Fittings",
  description:
    "Shop PVC pipes, fittings, solvent cement, and plumbing supplies in Sri Lanka. Anton, S-Lon, Arpico, Phoenix brands. SLS standards, Colombo delivery.",
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

