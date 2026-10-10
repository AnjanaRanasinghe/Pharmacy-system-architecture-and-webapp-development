export interface DashboardAlert {
  type: "low-stock" | "expiring" | "out-of-stock";
  title: string;
  detail: string;
}

export interface CategoryDistributionEntry {
  name: string;
  value: number;
  color: string;
}

export interface SalesVsPurchasesPoint {
  month: string;
  sales: number;
  purchases: number;
}

export interface WeeklyStockUsagePoint {
  day: string;
  usage: number;
}

export interface Dashboard {
  totalMedicines: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  salesToday: number;
  salesYesterday: number;
  categoryDistribution: CategoryDistributionEntry[];
  alerts: DashboardAlert[];
  salesVsPurchasesTrend: SalesVsPurchasesPoint[];
  weeklyStockUsage: WeeklyStockUsagePoint[];
}
