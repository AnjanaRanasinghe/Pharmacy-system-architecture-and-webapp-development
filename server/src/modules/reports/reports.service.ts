import { prisma } from "../../config/db";

const CRITICAL_STOCK_RATIO = 0.3;
const EXPIRY_CRITICAL_DAYS = 30;
const DEFAULT_RANGE_DAYS = 30;
const DEFAULT_EXPIRY_LOOKAHEAD_DAYS = 90;

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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Resolves a from/to query pair to a concrete [start, endExclusive) window, defaulting to a
 * trailing window ending today ("past") or a leading window starting today ("future"). */
function resolveRange(from: string | undefined, to: string | undefined, defaultDays: number, direction: "past" | "future" = "past") {
  const today = startOfDay(new Date());
  let start: Date;
  let end: Date;

  if (from && to) {
    start = parseLocalDate(from);
    end = addDays(parseLocalDate(to), 1);
  } else if (direction === "past") {
    end = addDays(today, 1);
    start = addDays(today, -(defaultDays - 1));
  } else {
    start = today;
    end = addDays(today, defaultDays + 1);
  }

  return { start, end, fromLabel: toDateInputValue(start), toLabel: toDateInputValue(addDays(end, -1)) };
}

async function getSalesReport(from?: string, to?: string) {
  const { start, end, fromLabel, toLabel } = resolveRange(from, to, DEFAULT_RANGE_DAYS, "past");

  const sales = await prisma.sale.findMany({
    where: { soldAt: { gte: start, lt: end } },
    include: { items: { include: { batch: { include: { product: true } } } } },
    orderBy: { soldAt: "asc" },
  });

  const dailyMap = new Map<string, { transactions: number; revenue: number; profit: number }>();
  const paymentMap = new Map<string, { count: number; amount: number }>();
  const productMap = new Map<string, { name: string; brand: string; quantity: number; revenue: number }>();

  let totalRevenue = 0;
  let totalProfit = 0;

  for (const sale of sales) {
    const dateKey = toDateInputValue(sale.soldAt);
    const revenue = Number(sale.totalAmount);
    const cost = sale.items.reduce((sum, item) => sum + Number(item.batch.purchasePrice) * item.quantity, 0);
    const profit = revenue - cost;

    totalRevenue += revenue;
    totalProfit += profit;

    const dayEntry = dailyMap.get(dateKey) ?? { transactions: 0, revenue: 0, profit: 0 };
    dayEntry.transactions += 1;
    dayEntry.revenue += revenue;
    dayEntry.profit += profit;
    dailyMap.set(dateKey, dayEntry);

    const payEntry = paymentMap.get(sale.paymentMethod) ?? { count: 0, amount: 0 };
    payEntry.count += 1;
    payEntry.amount += revenue;
    paymentMap.set(sale.paymentMethod, payEntry);

    for (const item of sale.items) {
      const product = item.batch.product;
      const entry = productMap.get(product.id) ?? { name: product.name, brand: product.brand, quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += Number(item.price) * item.quantity;
      productMap.set(product.id, entry);
    }
  }

  const daily = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, transactions: v.transactions, revenue: round2(v.revenue), profit: round2(v.profit) }));

  const byPayment = Array.from(paymentMap.entries()).map(([method, v]) => ({ method, count: v.count, amount: round2(v.amount) }));

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((p) => ({ ...p, revenue: round2(p.revenue) }));

  return {
    from: fromLabel,
    to: toLabel,
    summary: {
      totalRevenue: round2(totalRevenue),
      totalProfit: round2(totalProfit),
      marginPercent: totalRevenue > 0 ? round2((totalProfit / totalRevenue) * 100) : 0,
      totalTransactions: sales.length,
    },
    daily,
    byPayment,
    topProducts,
  };
}

async function getPurchaseReport(from?: string, to?: string) {
  const { start, end, fromLabel, toLabel } = resolveRange(from, to, DEFAULT_RANGE_DAYS, "past");

  const purchases = await prisma.purchase.findMany({
    where: { orderDate: { gte: start, lt: end } },
    include: { items: true, supplier: true },
    orderBy: { orderDate: "asc" },
  });

  const dailyMap = new Map<string, { orders: number; amount: number; items: number }>();
  const supplierMap = new Map<string, { supplier: string; orders: number; amount: number; items: number }>();

  let totalAmount = 0;
  let totalItems = 0;

  for (const p of purchases) {
    const dateKey = toDateInputValue(p.orderDate);
    const amount = Number(p.totalAmount);
    const items = p.items.reduce((sum, i) => sum + i.quantity, 0);

    totalAmount += amount;
    totalItems += items;

    const dayEntry = dailyMap.get(dateKey) ?? { orders: 0, amount: 0, items: 0 };
    dayEntry.orders += 1;
    dayEntry.amount += amount;
    dayEntry.items += items;
    dailyMap.set(dateKey, dayEntry);

    const supEntry = supplierMap.get(p.supplierId) ?? { supplier: p.supplier.name, orders: 0, amount: 0, items: 0 };
    supEntry.orders += 1;
    supEntry.amount += amount;
    supEntry.items += items;
    supplierMap.set(p.supplierId, supEntry);
  }

  const daily = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, orders: v.orders, amount: round2(v.amount), items: v.items }));

  const bySupplier = Array.from(supplierMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((s) => ({ ...s, amount: round2(s.amount) }));

  return {
    from: fromLabel,
    to: toLabel,
    summary: {
      totalAmount: round2(totalAmount),
      totalOrders: purchases.length,
      totalItemsReceived: totalItems,
    },
    daily,
    bySupplier,
  };
}

async function getStockReport() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { stockBatches: { where: { quantityOnHand: { gt: 0 } } }, category: true },
    orderBy: { name: "asc" },
  });

  const items = products
    .map((product) => {
      const currentStock = product.stockBatches.reduce((sum, b) => sum + b.quantityOnHand, 0);
      const reorderLevel = product.reorderLevel;
      let status: "OUT_OF_STOCK" | "CRITICAL" | "LOW_STOCK" | null = null;
      if (currentStock === 0) status = "OUT_OF_STOCK";
      else if (currentStock <= reorderLevel * CRITICAL_STOCK_RATIO) status = "CRITICAL";
      else if (currentStock <= reorderLevel) status = "LOW_STOCK";

      return status
        ? { name: product.name, brand: product.brand, category: product.category.name, currentStock, reorderLevel, status }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.currentStock - b.currentStock);

  return {
    summary: {
      totalFlagged: items.length,
      outOfStock: items.filter((i) => i.status === "OUT_OF_STOCK").length,
      critical: items.filter((i) => i.status === "CRITICAL").length,
      lowStock: items.filter((i) => i.status === "LOW_STOCK").length,
    },
    items,
  };
}

async function getExpiryReport(from?: string, to?: string) {
  const { start, end, fromLabel, toLabel } = resolveRange(from, to, DEFAULT_EXPIRY_LOOKAHEAD_DAYS, "future");
  const today = startOfDay(new Date());
  const criticalCutoff = addDays(today, EXPIRY_CRITICAL_DAYS);

  const batches = await prisma.stockBatch.findMany({
    where: { expiryDate: { gte: start, lt: end }, quantityOnHand: { gt: 0 } },
    include: { product: true },
    orderBy: { expiryDate: "asc" },
  });

  const items = batches.map((b) => {
    const status: "EXPIRED" | "CRITICAL" | "EXPIRING_SOON" =
      b.expiryDate < today ? "EXPIRED" : b.expiryDate <= criticalCutoff ? "CRITICAL" : "EXPIRING_SOON";
    return {
      name: b.product.name,
      brand: b.product.brand,
      batchNumber: b.batchNumber,
      quantity: b.quantityOnHand,
      expiryDate: toDateInputValue(b.expiryDate),
      status,
    };
  });

  return {
    from: fromLabel,
    to: toLabel,
    summary: {
      total: items.length,
      expired: items.filter((i) => i.status === "EXPIRED").length,
      critical: items.filter((i) => i.status === "CRITICAL").length,
      expiringSoon: items.filter((i) => i.status === "EXPIRING_SOON").length,
    },
    items,
  };
}

export const reportsService = {
  getSalesReport,
  getPurchaseReport,
  getStockReport,
  getExpiryReport,
};
