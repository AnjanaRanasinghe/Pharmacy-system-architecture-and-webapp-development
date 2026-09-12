export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  categoryId: string;
  category?: { id: string; name: string };
  sellingPrice: number;
  reorderLevel: number;
}

export interface ProductInventoryRow {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  categoryId: string;
  sellingPrice: number;
  reorderLevel: number;
  totalQuantity: number;
  batchCount: number;
  primaryBatchNumber: string | null;
  nearestExpiry: string | null;
}