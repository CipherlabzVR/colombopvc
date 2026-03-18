import { SITE_URL } from "@/lib/seo";

/** @type {import('next').MetadataRoute.Robots} */
export default function robots() {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/order-status", "/order-success", "/signin", "/signup", "/forgot-password", "/cart"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
