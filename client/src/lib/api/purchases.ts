import { api } from "./client";
import { Purchase } from "@/types/purchase";

interface CreatePurchaseItemInput {
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasedAmount: number;
  sellingAmount: number;
}

interface CreatePurchaseInput {
  supplierId: string;
  orderDate: string;
  expectedDelivery?: string;
  items: CreatePurchaseItemInput[];
}

export const purchasesApi = {
  list: () => api.get<Purchase[]>("/purchases"),
  create: (data: CreatePurchaseInput) => api.post<Purchase>("/purchases", data),
};