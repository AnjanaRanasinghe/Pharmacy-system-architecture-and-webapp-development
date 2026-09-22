import { SaleItemDto } from "@/types/sale";

export interface GroupedSaleLine {
  key: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
}

// A product's stock can be split across several batches (FEFO), producing one
// SaleItem per batch actually used. Same product + same price -> one invoice line.
export function groupSaleItemsForDisplay(items: SaleItemDto[]): GroupedSaleLine[] {
  const map = new Map<string, GroupedSaleLine>();
  for (const item of items) {
    const product = item.batch?.product;
    if (!product) continue;
    const key = `${product.id}-${item.price}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      map.set(key, { key, name: product.name, brand: product.brand, price: item.price, quantity: item.quantity });
    }
  }
  return Array.from(map.values());
}
