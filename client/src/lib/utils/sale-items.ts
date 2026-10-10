import { SaleItemDto } from "@/types/sale";

export interface GroupedSaleLine {
  key: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  discountPercent: number;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// A product's stock can be split across several batches (FEFO), producing one
// SaleItem per batch actually used. Same product + same price + same item-level
// discount -> one invoice line.
export function groupSaleItemsForDisplay(items: SaleItemDto[]): GroupedSaleLine[] {
  const map = new Map<string, GroupedSaleLine>();
  for (const item of items) {
    const product = item.batch?.product;
    if (!product) continue;
    const key = `${product.id}-${item.price}-${item.discountPercent}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      map.set(key, {
        key, name: product.name, brand: product.brand,
        price: item.price, quantity: item.quantity, discountPercent: item.discountPercent,
      });
    }
  }
  return Array.from(map.values());
}

export function lineGrossAmount(line: GroupedSaleLine) {
  return line.price * line.quantity;
}

export function lineDiscountAmount(line: GroupedSaleLine) {
  return round2(lineGrossAmount(line) * (line.discountPercent / 100));
}

export function lineNetAmount(line: GroupedSaleLine) {
  return round2(lineGrossAmount(line) - lineDiscountAmount(line));
}
