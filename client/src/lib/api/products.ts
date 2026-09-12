import { api } from "./client";
import { Product, ProductInventoryRow } from "@/types/product";

type ProductInput = {
  name: string; brand: string; barcode?: string; categoryId: string;
  sellingPrice: number; reorderLevel?: number;
};

export const productsApi = {
  search: (query: string) => api.get<Product[]>(`/products?search=${encodeURIComponent(query)}`),
  findByBarcode: (barcode: string) => api.get<Product>(`/products/barcode/${encodeURIComponent(barcode)}`),
  inventory: () => api.get<ProductInventoryRow[]>("/products/inventory"),
  create: (data: ProductInput) => api.post<Product>("/products", data),
  update: (id: string, data: ProductInput) => api.put<Product>(`/products/${id}`, data),
  remove: (id: string) => api.delete<{ archived?: boolean; message?: string } | void>(`/products/${id}`),
};