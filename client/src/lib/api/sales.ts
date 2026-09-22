import { api } from "./client";
import { Sale } from "@/types/sale";

interface CreateSaleItemInput {
  productId: string;
  quantity: number;
}

export interface CreateSaleInput {
  paymentMethod: "CASH" | "CARD" | "OTHER";
  discountPercent?: number;
  items: CreateSaleItemInput[];
}

export const salesApi = {
  list: () => api.get<Sale[]>("/sales"),
  get: (id: string) => api.get<Sale>(`/sales/${id}`),
  create: (data: CreateSaleInput) => api.post<Sale>("/sales", data),
};
