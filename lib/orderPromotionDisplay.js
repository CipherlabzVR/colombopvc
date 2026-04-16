/**
 * Map API order line (OnlineOrderLineResponse) to a shape used on receipt / order status UIs.
 */
export function mapApiLineToReceiptItem(line) {
  const qty = Number(line.quantity ?? line.Quantity ?? 1);
  const price = Number(line.price ?? line.Price ?? 0);
  const lineTotalRaw = line.lineTotal ?? line.LineTotal;
  const gross = Number.isFinite(Number(lineTotalRaw)) ? Number(lineTotalRaw) : price * qty;
  const subRaw = line.subTotal ?? line.SubTotal;
  const subNum = subRaw != null && subRaw !== "" ? Number(subRaw) : null;
  const td = Number(line.totalDiscount ?? line.TotalDiscount ?? 0);
  const promotionId = line.promotionId ?? line.PromotionId ?? null;
  const hasPromo = Number.isFinite(td) && td > 0 && subNum != null && Number.isFinite(subNum);
  return {
    lineId: line.lineId ?? line.LineId ?? null,
    name: line.productName ?? line.ProductName ?? "Item",
    qty,
    price,
    lineGross: gross,
    lineNet: hasPromo ? subNum : gross,
    totalDiscount: hasPromo ? td : 0,
    hasPromo,
    promotionId,
  };
}

/** Order-level promotion discount (sum of line promos) from API. */
export function getOrderDiscountAmount(order) {
  const v = Number(order?.discountAmount ?? order?.DiscountAmount ?? 0);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/** Sum of line LineTotal (before promo) for breakdown rows. */
export function sumOrderLinesGross(lines) {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((s, line) => {
    const qty = Number(line.quantity ?? line.Quantity ?? 1);
    const price = Number(line.price ?? line.Price ?? 0);
    const lt = line.lineTotal ?? line.LineTotal;
    const g = Number.isFinite(Number(lt)) ? Number(lt) : price * qty;
    return s + (Number.isFinite(g) ? g : 0);
  }, 0);
}
