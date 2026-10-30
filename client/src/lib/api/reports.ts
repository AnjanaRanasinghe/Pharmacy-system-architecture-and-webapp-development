import { api } from "./client";
import { ExpiryReport, PurchaseReport, SalesReport, StockReport } from "@/types/report";

function rangeQuery(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const reportsApi = {
  getSales: (from?: string, to?: string) => api.get<SalesReport>(`/reports/sales${rangeQuery(from, to)}`),
  getPurchases: (from?: string, to?: string) => api.get<PurchaseReport>(`/reports/purchases${rangeQuery(from, to)}`),
  getStock: () => api.get<StockReport>("/reports/stock"),
  getExpiry: (from?: string, to?: string) => api.get<ExpiryReport>(`/reports/expiry${rangeQuery(from, to)}`),
};
