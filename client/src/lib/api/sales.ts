import { api } from "./client";
import { Sale, SaleReturn } from "@/types/sale";

interface CreateSaleItemInput {
  productId: string;
  quantity: number;
  discountPercent?: number;
}

export interface CreateSaleInput {
  paymentMethod: "CASH" | "CARD" | "OTHER";
  discountPercent?: number;
  cashTendered?: number;
  totalOverride?: number;
  items: CreateSaleItemInput[];
}

export interface CreateReturnInput {
  reason?: string;
  items: { saleItemId: string; quantity: number; restock: boolean }[];
}

export const salesApi = {
  list: () => api.get<Sale[]>("/sales"),
  get: (id: string) => api.get<Sale>(`/sales/${id}`),
  create: (data: CreateSaleInput) => api.post<Sale>("/sales", data),
  createReturn: (saleId: string, data: CreateReturnInput) => api.post<SaleReturn>(`/sales/${saleId}/returns`, data),
};
