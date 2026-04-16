import HeroSection from "@/components/HeroSection";
import ShopByCategory from "@/components/ShopByCategory";
import ShopByProduct from "@/components/ShopByProduct";
import BlogPostSection from "@/components/BlogPostSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import ClientsSection from "@/components/ClientsSection";
import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.defaultTitle,
  description: SEO.defaultDescription,
  openGraph: {
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
  },
};

export default function Home() {
  return (
    <div>
      <HeroSection />
      {/* <ShopByCategory /> */}
      <ShopByProduct />
      <BlogPostSection />
      <WhyChooseUs />
      <SeoContentBlock />
      <ClientsSection />
    </div>
  );
}

const BRAND_CHIPS = ["S-Lon", "Anton", "National", "ERA"];

function SeoContentBlock() {
  return (
    <section
      className="relative overflow-hidden border-t border-slate-800/40"
      aria-labelledby="seo-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        aria-hidden
        style={{ backgroundImage: "url('/cvc.jpeg')" }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-950/88 via-slate-900/82 to-slate-950/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(245, 197, 24, 0.15), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#F5C518]">
            Trusted in Sri Lanka
          </p>
          <h2
            id="seo-heading"
            className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2rem] lg:leading-tight"
          >
            Colombo PVC Center
          </h2>
          <div
            className="mx-auto mt-4 h-1 w-14 rounded-full bg-linear-to-r from-[#F5C518] to-[#E0B415]"
            aria-hidden
          />
          <p className="mt-6 text-base font-medium leading-relaxed text-slate-200 sm:text-lg">
            A leading supplier of{" "}
            <span className="text-white">
              PVC pipes, fittings, solvent cement, and plumbing supplies
            </span>{" "}
            in <span className="text-white">Colombo and across Sri Lanka</span>.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-slate-300/95 sm:text-base">
            We stock S-Lon, Anton, National, ERA, and other trusted brands suitable for residential
            and commercial projects. From pressure pipes and drainage fittings to CPVC, PPR, and
            HDPE pipes, we support builders, plumbers, and homeowners with quality products and
            delivery across the island.
          </p>
        </div>

        <ul
          className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-2 sm:mt-10"
          aria-label="Featured brands"
        >
          {BRAND_CHIPS.map((name) => (
            <li key={name}>
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                {name}
              </span>
            </li>
          ))}
          <li>
            <span className="inline-flex items-center rounded-full border border-dashed border-white/35 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-slate-200 backdrop-blur-sm">
              + more brands
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
