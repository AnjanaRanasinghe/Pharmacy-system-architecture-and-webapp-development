import { prisma } from "../../config/db";

interface PurchaseItemInput {
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasedAmount: number;
  sellingAmount: number;
}

interface CreatePurchaseInput {
  supplierId: string;
  orderDate: string;
  expectedDelivery?: string;
  items: PurchaseItemInput[];
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const purchasesService = {
  list() {
    return prisma.purchase.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(input: CreatePurchaseInput) {
    return prisma.$transaction(async (tx) => {
      const year = new Date(input.orderDate).getFullYear();
      const countThisYear = await tx.purchase.count({
        where: { orderDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
      });
      const poNumber = `PO-${year}-${String(countThisYear + 1).padStart(3, "0")}`;

      const computedItems = input.items.map((i) => ({
        ...i,
        purchasePrice: round2(i.purchasedAmount / i.quantity),
        sellingPrice: round2(i.sellingAmount / i.quantity),
      }));

      const totalAmount = computedItems.reduce((sum, i) => sum + i.purchasedAmount, 0);

      const purchase = await tx.purchase.create({
        data: {
          poNumber,
          supplierId: input.supplierId,
          orderDate: new Date(input.orderDate),
          expectedDelivery: input.expectedDelivery ? new Date(input.expectedDelivery) : null,
          status: "RECEIVED",
          totalAmount,
          items: {
            create: computedItems.map((i) => ({
              productId: i.productId,
              batchNumber: i.batchNumber,
              expiryDate: new Date(i.expiryDate),
              quantity: i.quantity,
              purchasedAmount: i.purchasedAmount,
              purchasePrice: i.purchasePrice,
              sellingAmount: i.sellingAmount,
              sellingPrice: i.sellingPrice,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of purchase.items) {
        await tx.stockBatch.create({
          data: {
            productId: item.productId,
            purchaseItemId: item.id,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            quantityOnHand: item.quantity,
            purchasePrice: item.purchasePrice,
          },
        });

        // Shelf price always reflects the most recently purchased selling price
        await tx.product.update({
          where: { id: item.productId },
          data: { sellingPrice: item.sellingPrice },
        });
      }

      return purchase;
    });
  },
};