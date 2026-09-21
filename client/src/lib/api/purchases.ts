import { api } from "./client";
import { Purchase } from "@/types/purchase";

interface CreatePurchaseItemInput {
  productId?: string;
  newProduct?: { name: string; brand: string; barcode?: string; categoryId: string };
  productUpdates?: { name?: string; brand?: string };
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasedAmount: number;
  sellingAmount: number;
}

export interface CreatePurchaseInput {
  supplierId: string;
  orderDate: string;
  expectedDelivery?: string;
  items: CreatePurchaseItemInput[];
}

export const purchasesApi = {
  list: () => api.get<Purchase[]>("/purchases"),
  create: (data: CreatePurchaseInput) => api.post<Purchase>("/purchases", data),
};
