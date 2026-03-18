/**
 * SEO config for Colombo PVC Center — Sri Lanka.
 * Set NEXT_PUBLIC_SITE_URL in .env (e.g. https://colombopvc.lk) for production.
 */
const SITE_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://colombopvc.lk";

const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

const SEO = {
  siteName: "Colombo PVC Center",
  defaultTitle: "Colombo PVC Center | PVC Pipes, Fittings & Plumbing Supplies in Sri Lanka",
  defaultDescription:
    "Colombo PVC Center is your trusted supplier of PVC pipes, fittings, solvent cement, and plumbing supplies in Colombo and across Sri Lanka. S-Lon, Anton, National, ERA brands. Delivery island-wide.",
  keywords: [
    "PVC pipes Sri Lanka",
    "PVC fittings Colombo",
    "Colombo PVC Center",
    "Hardware Store Colombo",
    "Hardware Colombo",
    "Hardware in Colombo",
    "Colombo PVC Center",
    "plumbing supplies Sri Lanka",
    "S-Lon pipes",
    "Anton PVC",
    "water pipes Colombo",
    "solvent cement Sri Lanka",
    "Colombo PVC",
    "plumbing tools Sri Lanka",
    "CPVC PPR pipes Sri Lanka",
  ],
  locale: "en_LK",
  localeAlternates: ["en"],
  twitterHandle: "",
  facebookUrl: "https://www.facebook.com/share/1CfDuyt7Bo/",
};

// Google Search Console: add GOOGLE_SITE_VERIFICATION to .env (content value only, e.g. abc123xyz)
const GOOGLE_SITE_VERIFICATION =
  typeof process !== "undefined" ? process.env?.GOOGLE_SITE_VERIFICATION : undefined;

export { SITE_URL, DEFAULT_OG_IMAGE, SEO, GOOGLE_SITE_VERIFICATION };
