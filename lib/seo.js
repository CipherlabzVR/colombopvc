/**
 * SEO config shared across layout, sitemap, and robots.
 * Set NEXT_PUBLIC_SITE_URL in .env.local to your production URL (e.g. https://www.colombopvc.com).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.colombopvc.lk";

export const DEFAULT_SEO = {
  title: "Colombo PVC | PVC Pipes, Fittings & Plumbing Supplies in Sri Lanka",
  description:
    "Colombo PVC is your trusted supplier of PVC pipes, fittings, solvent cement, and plumbing supplies in Colombo and across Sri Lanka. SLS-standard products, local delivery, and expert advice for builders and homeowners.",
  keywords: [
    "PVC pipes Sri Lanka",
    "Hardware Store Sri Lanka",
    "Hardware Store Colombo",
    "Hardware Store in Sri Lanka",
    "Hardware Colombo",
    "Hardware in Colombo",
    "PVC fittings Colombo",
    "plumbing supplies Sri Lanka",
    "SLS PVC pipes",
    "water pipes Colombo",
    "Anton pipes",
    "S-Lon PVC",
    "solvent cement Sri Lanka",
    "building materials Colombo",
    "Colombo PVC",
  ],
};
