import HeroSection from "@/components/HeroSection";
import ShopByCategory from "@/components/ShopByCategory";
import ShopByProduct from "@/components/ShopByProduct";
import BlogPostSection from "@/components/BlogPostSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import ClientsSection from "@/components/ClientsSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      {/* <ShopByCategory /> */}
      <ShopByProduct />
      <BlogPostSection />
      <WhyChooseUs />
      <ClientsSection />
    </div>
  );
}
