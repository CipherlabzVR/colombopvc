import { SITE_URL } from "@/lib/seo";

export default function robots() {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/order-success", "/order-status", "/signin", "/signup", "/forgot-password"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/checkout", "/order-success", "/order-status", "/signin", "/signup", "/forgot-password"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
