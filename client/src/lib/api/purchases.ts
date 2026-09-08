import { api } from "./client";
import { Purchase } from "@/types/purchase";

interface CreatePurchaseInput {
  supplierId: string;
  orderDate: string;
  expectedDelivery?: string;
  items: { productId: string; batchNumber: string; expiryDate: string; quantity: number; costPrice: number }[];
}

export const purchasesApi = {
  list: () => api.get<Purchase[]>("/purchases"),
  create: (data: CreatePurchaseInput) => api.post<Purchase>("/purchases", data),
};