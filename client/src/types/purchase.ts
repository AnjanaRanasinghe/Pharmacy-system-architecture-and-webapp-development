export interface PurchaseItemDto {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
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