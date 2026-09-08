export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  categoryId: string;
  category?: { id: string; name: string };
  sellingPrice: number;
}