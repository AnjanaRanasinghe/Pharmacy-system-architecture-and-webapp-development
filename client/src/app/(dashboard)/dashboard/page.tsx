"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { QuickAccess } from "@/components/dashboard/quick-access";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { WeeklyStockChart } from "@/components/dashboard/weekly-stock-chart";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Link2, AlertTriangle, DollarSign, Package } from "lucide-react";

export default function DashboardPage() {
  const { dashboard, loading, error, refetch } = useDashboard();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading dashboard...</p>;
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-500">Couldn't load the dashboard: {error}</p>
        <Button variant="outline" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  const salesDiff = dashboard.salesToday - dashboard.salesYesterday;
  let salesTrend: string;
  let salesTrendDirection: "up" | "down" | "neutral";
  if (dashboard.salesYesterday > 0) {
    const pct = (salesDiff / dashboard.salesYesterday) * 100;
    salesTrend = `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}% vs yesterday`;
    salesTrendDirection = pct >= 0 ? "up" : "down";
  } else if (dashboard.salesToday > 0) {
    salesTrend = "No sales yesterday to compare";
    salesTrendDirection = "neutral";
  } else {
    salesTrend = "No sales yet today";
    salesTrendDirection = "neutral";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your pharmacy operations</p>
      </div>

      <QuickAccess />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Medicines" value={dashboard.totalMedicines.toLocaleString()}
          trend="Active items in catalog" trendDirection="neutral" icon={Link2} iconBg="bg-blue-500"
        />
        <StatCard
          label="Low Stock Items" value={dashboard.lowStockCount.toLocaleString()}
          trend="At or below reorder level" trendDirection="neutral" icon={AlertTriangle} iconBg="bg-orange-500"
        />
        <StatCard
          label="Sales Today" value={formatCurrency(dashboard.salesToday)}
          trend={salesTrend} trendDirection={salesTrendDirection} icon={DollarSign} iconBg="bg-green-500"
        />
        <StatCard
          label="Expiring Soon" value={dashboard.expiringSoonCount.toLocaleString()}
          trend="Within the next 30 days" trendDirection="neutral" icon={Package} iconBg="bg-red-500"
        />
      </div>

      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalesTrendChart data={dashboard.salesVsPurchasesTrend} />
        <CategoryPieChart data={dashboard.categoryDistribution} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <WeeklyStockChart data={dashboard.weeklyStockUsage} />
        <RecentAlerts alerts={dashboard.alerts} />
      </div>
    </div>
  );
}
