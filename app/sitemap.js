import { SHOP_PRODUCTS } from "@/components/shop/shopData";
import { getBlogPosts } from "@/lib/blogApi";
import { SITE_URL } from "@/lib/seo";

const staticRoutes = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faqs", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/refund", priority: 0.4, changeFrequency: "yearly" },
  { path: "/promotion", priority: 0.7, changeFrequency: "weekly" },
];

export default async function sitemap() {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const entries = [
    ...staticRoutes.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path || "/"}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...SHOP_PRODUCTS.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];

  try {
    const { items } = await getBlogPosts({ skipCount: 0, maxResultCount: 500 });
    const blogSlugs = (items || []).filter((p) => p?.slug).map((p) => p.slug);
    blogSlugs.forEach((slug) => {
      entries.push({
        url: `${base}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    });
  } catch {
    // Blog API may be unavailable at build time; static + shop URLs still work
  }

  return entries;
}
