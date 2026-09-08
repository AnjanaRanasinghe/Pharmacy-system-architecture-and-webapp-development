import { api } from "./client";
import { Supplier } from "@/types/supplier";

type SupplierInput = Omit<Supplier, "id" | "totalPurchases">;

export const suppliersApi = {
  list: () => api.get<Supplier[]>("/suppliers"),
  create: (data: SupplierInput) => api.post<Supplier>("/suppliers", data),
  update: (id: string, data: SupplierInput) => api.put<Supplier>(`/suppliers/${id}`, data),
  remove: (id: string) => api.delete<void>(`/suppliers/${id}`),
};