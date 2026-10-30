import { prisma } from "../../config/db";

const EXPIRY_LOOKAHEAD_DAYS = 30;
const CRITICAL_STOCK_RATIO = 0.3;

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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Reconciles the persisted Notification feed against live stock/expiry state: creates
 * a row the first time a condition is seen, and removes rows whose condition no longer
 * holds (restocked, batch used up) — so the feed never shows a stale alert, and a
 * dismissed-but-still-true condition only resurfaces on a later sync, not instantly. */
async function sync() {
  const today = startOfDay(new Date());
  const expiryCutoff = addDays(today, EXPIRY_LOOKAHEAD_DAYS);

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { stockBatches: { where: { quantityOnHand: { gt: 0 } } } },
  });

  const productNotifications: { productId: string; type: "LOW_STOCK" | "OUT_OF_STOCK"; message: string }[] = [];
  const batchNotifications: { batchId: string; message: string }[] = [];

  for (const product of products) {
    const qty = product.stockBatches.reduce((sum, b) => sum + b.quantityOnHand, 0);
    const label = `${product.name} (${product.brand})`;

    if (qty === 0) {
      productNotifications.push({ productId: product.id, type: "OUT_OF_STOCK", message: `${label} is out of stock. Reorder immediately.` });
    } else if (qty <= product.reorderLevel) {
      const critical = qty <= product.reorderLevel * CRITICAL_STOCK_RATIO;
      productNotifications.push({
        productId: product.id,
        type: "LOW_STOCK",
        message: critical
          ? `${label} has only ${qty} unit${qty === 1 ? "" : "s"} remaining. Reorder immediately.`
          : `${label} stock is running low (${qty} units remaining).`,
      });
    }

    for (const batch of product.stockBatches) {
      if (batch.expiryDate > expiryCutoff) continue;
      const daysLeft = Math.round((batch.expiryDate.getTime() - today.getTime()) / 86400000);
      const message =
        daysLeft < 0
          ? `${label} batch ${batch.batchNumber} expired on ${toDateInputValue(batch.expiryDate)}.`
          : daysLeft === 0
          ? `${label} batch ${batch.batchNumber} expires today.`
          : `${label} batch ${batch.batchNumber} will expire in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`;
      batchNotifications.push({ batchId: batch.id, message });
    }
  }

  const activeProductIds = new Set(productNotifications.map((n) => n.productId));
  const activeBatchIds = new Set(batchNotifications.map((n) => n.batchId));

  await prisma.notification.deleteMany({
    where: {
      type: { in: ["LOW_STOCK", "OUT_OF_STOCK"] },
      ...(activeProductIds.size > 0 ? { productId: { notIn: Array.from(activeProductIds) } } : {}),
    },
  });
  await prisma.notification.deleteMany({
    where: {
      type: "EXPIRING_SOON",
      ...(activeBatchIds.size > 0 ? { batchId: { notIn: Array.from(activeBatchIds) } } : {}),
    },
  });

  for (const n of productNotifications) {
    const exists = await prisma.notification.findFirst({ where: { productId: n.productId, type: n.type } });
    if (exists) {
      if (exists.message !== n.message) await prisma.notification.update({ where: { id: exists.id }, data: { message: n.message } });
    } else {
      await prisma.notification.create({ data: { productId: n.productId, type: n.type, message: n.message } });
    }
  }

  for (const n of batchNotifications) {
    const exists = await prisma.notification.findFirst({ where: { batchId: n.batchId, type: "EXPIRING_SOON" } });
    if (exists) {
      if (exists.message !== n.message) await prisma.notification.update({ where: { id: exists.id }, data: { message: n.message } });
    } else {
      await prisma.notification.create({ data: { batchId: n.batchId, type: "EXPIRING_SOON", message: n.message } });
    }
  }
}

export const notificationsService = {
  async list() {
    await sync();
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);
    return { items, unreadCount };
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  markAllRead() {
    return prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  },

  dismiss(id: string) {
    return prisma.notification.delete({ where: { id } });
  },
};
