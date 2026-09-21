import { prisma } from "../../config/db";
import { generateInternalBarcode } from "../products/products.service";

interface NewProductInput {
  name: string;
  brand: string;
  barcode?: string;
  categoryId: string;
}

interface ProductUpdatesInput {
  name?: string;
  brand?: string;
}

interface PurchaseItemInput {
  productId?: string;
  newProduct?: NewProductInput;
  productUpdates?: ProductUpdatesInput;
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

      // Resolve each item's product first: create new products, or apply edits to
      // existing ones, so every item ends up with a real productId before the
      // purchase itself (and its nested items) is created.
      const resolvedItems = [];
      for (const item of input.items) {
        let productId = item.productId;
        const sellingPrice = round2(item.sellingAmount / item.quantity);

        if (item.newProduct) {
          const created = await tx.product.create({
            data: {
              name: item.newProduct.name,
              brand: item.newProduct.brand,
              barcode: item.newProduct.barcode?.trim() || generateInternalBarcode(),
              categoryId: item.newProduct.categoryId,
              sellingPrice,
            },
          });
          productId = created.id;
        } else if (item.productUpdates && Object.keys(item.productUpdates).length > 0) {
          await tx.product.update({ where: { id: productId! }, data: item.productUpdates });
        }

        resolvedItems.push({
          productId: productId!,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          quantity: item.quantity,
          purchasedAmount: item.purchasedAmount,
          purchasePrice: round2(item.purchasedAmount / item.quantity),
          sellingAmount: item.sellingAmount,
          sellingPrice,
        });
      }

      const totalAmount = resolvedItems.reduce((sum, i) => sum + i.purchasedAmount, 0);

      const purchase = await tx.purchase.create({
        data: {
          poNumber,
          supplierId: input.supplierId,
          orderDate: new Date(input.orderDate),
          expectedDelivery: input.expectedDelivery ? new Date(input.expectedDelivery) : null,
          status: "RECEIVED",
          totalAmount,
          items: {
            create: resolvedItems.map((i) => ({
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
        include: { supplier: true, items: { include: { product: true } } },
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
