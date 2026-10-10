import { prisma } from "../../config/db";

const CATEGORY_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];
const EXPIRING_SOON_DAYS = 30;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

async function getOverview() {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const expiryCutoff = addDays(today, EXPIRING_SOON_DAYS);

  const [products, salesTodayAgg, salesYesterdayAgg] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, stockBatches: { where: { quantityOnHand: { gt: 0 } } } },
    }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { soldAt: { gte: today, lt: tomorrow } } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { soldAt: { gte: yesterday, lt: today } } }),
  ]);

  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringSoonCount = 0;
  const categoryCounts = new Map<string, number>();
  const lowStockAlerts: { name: string; brand: string; totalQuantity: number }[] = [];
  const outOfStockAlerts: { name: string; brand: string }[] = [];
  const expiringAlerts: { name: string; brand: string; batchNumber: string; expiryDate: Date }[] = [];

  for (const product of products) {
    const totalQuantity = product.stockBatches.reduce((sum, b) => sum + b.quantityOnHand, 0);
    categoryCounts.set(product.category.name, (categoryCounts.get(product.category.name) ?? 0) + 1);

    if (totalQuantity === 0) {
      outOfStockCount += 1;
      outOfStockAlerts.push({ name: product.name, brand: product.brand });
    } else if (totalQuantity <= product.reorderLevel) {
      lowStockCount += 1;
      lowStockAlerts.push({ name: product.name, brand: product.brand, totalQuantity });
    }

    for (const batch of product.stockBatches) {
      if (batch.expiryDate <= expiryCutoff) {
        expiringSoonCount += 1;
        expiringAlerts.push({ name: product.name, brand: product.brand, batchNumber: batch.batchNumber, expiryDate: batch.expiryDate });
      }
    }
  }

  const totalMedicines = products.length;
  const categoryDistribution = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      name,
      value: totalMedicines > 0 ? round2((count / totalMedicines) * 100) : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

  expiringAlerts.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  const alerts = [
    ...outOfStockAlerts.slice(0, 3).map((a) => ({
      type: "out-of-stock" as const,
      title: "Out of Stock",
      detail: `${a.name} (${a.brand})`,
    })),
    ...lowStockAlerts.slice(0, 3).map((a) => ({
      type: "low-stock" as const,
      title: "Low Stock",
      detail: `${a.name} (${a.brand}) — ${a.totalQuantity} left`,
    })),
    ...expiringAlerts.slice(0, 3).map((a) => ({
      type: "expiring" as const,
      title: "Expiring Soon",
      detail: `${a.name} (${a.brand}) — batch ${a.batchNumber}, ${a.expiryDate.toISOString().slice(0, 10)}`,
    })),
  ].slice(0, 6);

  return {
    totalMedicines,
    lowStockCount,
    outOfStockCount,
    expiringSoonCount,
    salesToday: Number(salesTodayAgg._sum.totalAmount ?? 0),
    salesYesterday: Number(salesYesterdayAgg._sum.totalAmount ?? 0),
    categoryDistribution,
    alerts,
  };
}

async function getSalesVsPurchasesTrend() {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const offset = 5 - i;
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    return { label: start.toLocaleDateString("en-US", { month: "short" }), start, end };
  });

  const results = await Promise.all(
    months.map(async (m) => {
      const [salesAgg, purchasesAgg] = await Promise.all([
        prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { soldAt: { gte: m.start, lt: m.end } } }),
        prisma.purchase.aggregate({ _sum: { totalAmount: true }, where: { orderDate: { gte: m.start, lt: m.end } } }),
      ]);
      return {
        month: m.label,
        sales: Number(salesAgg._sum.totalAmount ?? 0),
        purchases: Number(purchasesAgg._sum.totalAmount ?? 0),
      };
    })
  );

  return results;
}

async function getWeeklyStockUsage() {
  const today = startOfDay(new Date());
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = addDays(today, -dayOfWeek);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const results = await Promise.all(
    labels.map(async (label, i) => {
      const dayStart = addDays(monday, i);
      const dayEnd = addDays(dayStart, 1);
      const agg = await prisma.saleItem.aggregate({
        _sum: { quantity: true },
        where: { sale: { soldAt: { gte: dayStart, lt: dayEnd } } },
      });
      return { day: label, usage: agg._sum.quantity ?? 0 };
    })
  );

  return results;
}

export const dashboardService = {
  async getDashboard() {
    const [overview, salesVsPurchasesTrend, weeklyStockUsage] = await Promise.all([
      getOverview(),
      getSalesVsPurchasesTrend(),
      getWeeklyStockUsage(),
    ]);

    return { ...overview, salesVsPurchasesTrend, weeklyStockUsage };
  },
};
