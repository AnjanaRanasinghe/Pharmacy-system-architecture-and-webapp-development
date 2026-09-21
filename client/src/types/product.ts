export interface ProductInventoryRow {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  categoryId: string;
  sellingPrice: number;
  purchasePrice: number | null;
  reorderLevel: number;
  totalQuantity: number;
  batchCount: number;
  primaryBatchNumber: string | null;
  nearestExpiry: string | null;
}