import { api } from "./client";
import { Product } from "@/types/product";

export const productsApi = {
  search: (query: string) => api.get<Product[]>(`/products?search=${encodeURIComponent(query)}`),
  findByBarcode: (barcode: string) => api.get<Product>(`/products/barcode/${encodeURIComponent(barcode)}`),
  create: (data: Partial<Product>) => api.post<Product>("/products", data),
};