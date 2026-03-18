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

function SeoContentBlock() {
  return (
    <section className="bg-slate-50 border-t border-slate-200" aria-labelledby="seo-heading">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 text-center">
        <h2 id="seo-heading" className="sr-only">
          Colombo PVC Center – PVC pipes and plumbing supplies in Sri Lanka
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          <strong className="text-slate-800">Colombo PVC Center</strong> is a leading supplier of{" "}
          <strong className="text-slate-800">PVC pipes, fittings, solvent cement, and plumbing supplies</strong> in{" "}
          <strong className="text-slate-800">Colombo and across Sri Lanka</strong>. We stock S-Lon, Anton, National, ERA, and other trusted brands suitable for residential and commercial projects. From pressure pipes and drainage fittings to CPVC, PPR, and HDPE pipes, we support builders, plumbers, and homeowners with quality products and delivery across the island.
        </p>
      </div>
    </section>
  );
}
