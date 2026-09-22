export interface SaleItemDto {
  id: string;
  batchId: string;
  quantity: number;
  price: number;
  batch?: {
    id: string;
    expiryDate: string;
    product: { id: string; name: string; brand: string };
  };
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  userId: string;
  user?: { id: string; name: string | null; email: string };
  customerId?: string | null;
  customer?: { id: string; name: string } | null;
  soldAt: string;
  subtotalAmount: number;
  discountPercent: number;
  totalAmount: number;
  paymentMethod: "CASH" | "CARD" | "OTHER";
  items: SaleItemDto[];
}
