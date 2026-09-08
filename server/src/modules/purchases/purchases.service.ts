import { prisma } from "../../config/db";

interface PurchaseItemInput {
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
}

interface CreatePurchaseInput {
  supplierId: string;
  orderDate: string;
  expectedDelivery?: string;
  items: PurchaseItemInput[];
}

export const purchasesService = {
  list() {
    return prisma.purchase.findMany({
      include: { supplier: true, items: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(input: CreatePurchaseInput) {
    return prisma.$transaction(async (tx) => {
      // Human-readable PO number: PO-<year>-<count of POs this year + 1>
      const year = new Date(input.orderDate).getFullYear();
      const countThisYear = await tx.purchase.count({
        where: {
          orderDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) },
        },
      });
      const poNumber = `PO-${year}-${String(countThisYear + 1).padStart(3, "0")}`;

      const totalAmount = input.items.reduce((sum, i) => sum + i.quantity * i.costPrice, 0);

      const purchase = await tx.purchase.create({
        data: {
          poNumber,
          supplierId: input.supplierId,
          orderDate: new Date(input.orderDate),
          expectedDelivery: input.expectedDelivery ? new Date(input.expectedDelivery) : null,
          status: "RECEIVED", // stock is created immediately — see note below
          totalAmount,
          items: {
            create: input.items.map((i) => ({
              productId: i.productId,
              batchNumber: i.batchNumber,
              expiryDate: new Date(i.expiryDate),
              quantity: i.quantity,
              costPrice: i.costPrice,
            })),
          },
        },
        include: { items: true },
      });

      // One StockBatch per line item — this is the moment stock actually enters the system
      for (const item of purchase.items) {
        await tx.stockBatch.create({
          data: {
            productId: item.productId,
            purchaseItemId: item.id,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            quantityOnHand: item.quantity,
            costPrice: item.costPrice,
          },
        });
      }

      return purchase;
    });
  },
};