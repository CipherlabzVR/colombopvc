import { notFound } from "next/navigation";
import { getShopProductBySlug, SHOP_PRODUCTS } from "@/components/shop/shopData";
import ProductDetail from "@/components/shop/ProductDetail";

export function generateStaticParams() {
  return SHOP_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const product = getShopProductBySlug(params.slug);
  const title = product ? `${product.name} | Colombo PVC Center` : "Product | Colombo PVC Center";
  const description =
    product?.description?.slice(0, 160) ||
    "PVC pipes and plumbing supplies in Sri Lanka. Colombo PVC Center.";
  return {
    title,
    description,
  };
}

export default function ProductPage({ params }) {
  const product = getShopProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
