import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Promotions",
  description: "Current offers, discounts, and promotions at Colombo PVC.",
  openGraph: {
    title: "Promotions | Colombo PVC",
    description: "Current offers, discounts, and promotions.",
    url: `${SITE_URL.replace(/\/$/, "")}/ecom/promotions`,
  },
};

export default function EcomPromotionsLayout({ children }) {
  return children;
}
