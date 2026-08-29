import { StatCard } from "@/components/dashboard/stat-card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { WeeklyStockChart } from "@/components/dashboard/weekly-stock-chart";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { Link2, AlertTriangle, DollarSign, Package } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your pharmacy operations</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Medicines" value="1,247" trend="+12% from last week" trendDirection="up" icon={Link2} iconBg="bg-blue-500" />
        <StatCard label="Low Stock Items" value="23" trend="+5 from last week" trendDirection="up" icon={AlertTriangle} iconBg="bg-orange-500" />
        <StatCard label="Sales Today" value="$4,832" trend="+18% from last week" trendDirection="up" icon={DollarSign} iconBg="bg-green-500" />
        <StatCard label="Expiring Soon" value="15" trend="-3 from last week" trendDirection="down" icon={Package} iconBg="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SalesTrendChart />
        <CategoryPieChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <WeeklyStockChart />
        <RecentAlerts />
      </div>
    </div>
  );
}