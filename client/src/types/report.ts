export interface SalesReportDailyPoint {
  date: string;
  transactions: number;
  revenue: number;
  profit: number;
}

export interface SalesReportPaymentBreakdown {
  method: string;
  count: number;
  amount: number;
}

export interface SalesReportTopProduct {
  name: string;
  brand: string;
  quantity: number;
  revenue: number;
}

export interface SalesReport {
  from: string;
  to: string;
  summary: {
    totalRevenue: number;
    totalProfit: number;
    marginPercent: number;
    totalTransactions: number;
  };
  daily: SalesReportDailyPoint[];
  byPayment: SalesReportPaymentBreakdown[];
  topProducts: SalesReportTopProduct[];
}

export interface PurchaseReportDailyPoint {
  date: string;
  orders: number;
  amount: number;
  items: number;
}

export interface PurchaseReportSupplierBreakdown {
  supplier: string;
  orders: number;
  amount: number;
  items: number;
}

export interface PurchaseReport {
  from: string;
  to: string;
  summary: {
    totalAmount: number;
    totalOrders: number;
    totalItemsReceived: number;
  };
  daily: PurchaseReportDailyPoint[];
  bySupplier: PurchaseReportSupplierBreakdown[];
}

export type StockReportStatus = "OUT_OF_STOCK" | "CRITICAL" | "LOW_STOCK";

export interface StockReportItem {
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  status: StockReportStatus;
}

export interface StockReport {
  summary: {
    totalFlagged: number;
    outOfStock: number;
    critical: number;
    lowStock: number;
  };
  items: StockReportItem[];
}

export type ExpiryReportStatus = "EXPIRED" | "CRITICAL" | "EXPIRING_SOON";

export interface ExpiryReportItem {
  name: string;
  brand: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  status: ExpiryReportStatus;
}

export interface ExpiryReport {
  from: string;
  to: string;
  summary: {
    total: number;
    expired: number;
    critical: number;
    expiringSoon: number;
  };
  items: ExpiryReportItem[];
}
