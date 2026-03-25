/**
 * Generates public/sitemap.xml for SEO.
 * Run: node scripts/generate-sitemap.mjs (or via npm run generate-sitemap)
 */
import { writeFileSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://colombopvc.lk").replace(/\/$/, "");

const staticRoutes = [
  { path: "", changeFreq: "weekly", priority: "1.00" },
  { path: "/shop", changeFreq: "weekly", priority: "0.90" },
  { path: "/about", changeFreq: "monthly", priority: "0.80" },
  { path: "/contact", changeFreq: "monthly", priority: "0.80" },
  { path: "/blog", changeFreq: "weekly", priority: "0.80" },
  { path: "/faqs", changeFreq: "monthly", priority: "0.70" },
  { path: "/ecom/promotions", changeFreq: "weekly", priority: "0.70" },
  { path: "/refund", changeFreq: "yearly", priority: "0.40" },
  { path: "/privacy", changeFreq: "yearly", priority: "0.40" },
  { path: "/terms", changeFreq: "yearly", priority: "0.40" },
];

let productSlugs = [];
try {
  const mod = await import(pathToFileURL(join(root, "components/shop/shopData.js")).href);
  productSlugs = (mod.SHOP_PRODUCTS || []).map((p) => p.slug).filter(Boolean);
} catch {
  // ignore if shopData unavailable
}

const now = new Date().toISOString().slice(0, 10);

function urlEntry(path, changeFreq, priority) {
  const loc = base + (path.startsWith("/") ? path : "/" + path);
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const urls = [
  ...staticRoutes.map((r) => urlEntry(r.path, r.changeFreq, r.priority)),
  ...productSlugs.map((slug) => urlEntry(`/shop/${slug}`, "weekly", "0.70")),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

const outPath = join(root, "public", "sitemap.xml");
writeFileSync(outPath, xml, "utf8");
console.log("Generated:", outPath);
