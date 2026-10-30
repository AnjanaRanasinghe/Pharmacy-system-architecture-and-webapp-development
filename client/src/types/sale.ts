export interface SaleItemDto {
  id: string;
  batchId: string;
  quantity: number;
  price: number;
  discountPercent: number;
  batch?: {
    id: string;
    batchNumber: string;
    expiryDate: string;
    product: { id: string; name: string; brand: string };
  };
}

export interface SaleReturnItemDto {
  id: string;
  saleItemId: string;
  quantity: number;
  restocked: boolean;
}

export interface SaleReturn {
  id: string;
  returnNumber: string;
  saleId: string;
  userId: string;
  user?: { id: string; name: string | null; email: string };
  reason?: string | null;
  refundAmount: number;
  createdAt: string;
  items: SaleReturnItemDto[];
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
  cashTendered?: number | null;
  items: SaleItemDto[];
  returns: SaleReturn[];
}
