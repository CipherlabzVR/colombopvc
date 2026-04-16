import { SITE_URL } from "@/lib/seo";
import { SHOP_PRODUCTS } from "@/components/shop/shopData";
import { getBlogPosts } from "@/lib/blogApi";

/** @type {import('next').MetadataRoute.Sitemap} */
export default async function sitemap() {
  const base = SITE_URL.replace(/\/$/, "");

  const staticRoutes = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/faqs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/ecom/promotions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const productRoutes = (SHOP_PRODUCTS || []).map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  let blogRoutes = [];
  try {
    const { items } = await getBlogPosts({ skipCount: 0, maxResultCount: 500 });
    if (Array.isArray(items) && items.length > 0) {
      blogRoutes = items
        .filter((p) => p?.slug)
        .map((p) => ({
          url: `${base}/blog/${p.slug}`,
          lastModified: p.publishDate ? new Date(p.publishDate) : new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        }));
    }
  } catch {
    // API may be unavailable at build time; sitemap still works with static + products
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
