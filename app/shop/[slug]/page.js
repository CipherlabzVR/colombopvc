import { notFound } from "next/navigation";
import { getShopProductBySlug, SHOP_PRODUCTS } from "@/components/shop/shopData";
import ProductDetail from "@/components/shop/ProductDetail";

export function generateStaticParams() {
  return SHOP_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const product = getShopProductBySlug(params.slug);
  return {
    title: product ? `${product.name} | Colombo PVC` : "Product | Colombo PVC",
  };
}

export default function ProductPage({ params }) {
  const product = getShopProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
