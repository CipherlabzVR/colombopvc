import { redirect } from "next/navigation";

/** Legacy URL — promotions live under /ecom/promotions */
export default function PromotionPageRedirect() {
  redirect("/ecom/promotions");
}
