export interface PurchaseItemDto {
  id: string;
  productId: string;
  product?: { name: string; brand: string };
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasedAmount: number;
  purchasePrice: number;
  sellingAmount: number;
  sellingPrice: number;
}

export interface Purchase {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: { id: string; name: string };
  orderDate: string;
  expectedDelivery?: string | null;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  items: PurchaseItemDto[];
}