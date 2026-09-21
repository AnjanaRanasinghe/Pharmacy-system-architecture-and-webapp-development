export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string | null;
  categoryId: string;
  category?: { id: string; name: string };
  defaultSupplierId?: string | null;
  sellingPrice: number;
  reorderLevel: number;
  isActive?: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

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