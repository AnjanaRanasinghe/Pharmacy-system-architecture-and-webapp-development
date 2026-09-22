import { prisma } from "../../config/db";
import { AppError } from "../../common/errors/app-error";

interface SaleItemInput {
  productId: string;
  quantity: number;
}

interface CreateSaleInput {
  userId: string;
  paymentMethod: "CASH" | "CARD" | "OTHER";
  discountPercent?: number;
  items: SaleItemInput[];
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const saleInclude = {
  user: { select: { id: true, name: true, email: true, role: true } },
  customer: true,
  items: { include: { batch: { include: { product: true } } } },
} as const;

export const salesService = {
  list() {
    return prisma.sale.findMany({
      include: saleInclude,
      orderBy: { soldAt: "desc" },
    });
  },

  async get(id: string) {
    const sale = await prisma.sale.findUnique({ where: { id }, include: saleInclude });
    if (!sale) throw new AppError("Sale not found", 404);
    return sale;
  },

  async create(input: CreateSaleInput) {
    if (input.items.length === 0) throw new AppError("Add at least one item.");

    return prisma.$transaction(async (tx) => {
      // Resolve each product to its FEFO batch allocation before writing anything,
      // so an out-of-stock line fails the whole sale before any stock is touched.
      const lineAllocations: {
        unitPrice: number;
        allocations: { batchId: string; quantity: number }[];
      }[] = [];

      for (const item of input.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new AppError(`Product ${item.productId} not found`);

        const batches = await tx.stockBatch.findMany({
          where: { productId: item.productId, quantityOnHand: { gt: 0 } },
          orderBy: { expiryDate: "asc" },
        });

        let remaining = item.quantity;
        const allocations: { batchId: string; quantity: number }[] = [];
        for (const batch of batches) {
          if (remaining <= 0) break;
          const take = Math.min(batch.quantityOnHand, remaining);
          allocations.push({ batchId: batch.id, quantity: take });
          remaining -= take;
        }

        if (remaining > 0) {
          const available = item.quantity - remaining;
          throw new AppError(
            `Only ${available} of "${product.name}" (${product.brand}) in stock — requested ${item.quantity}.`
          );
        }

        lineAllocations.push({ unitPrice: Number(product.sellingPrice), allocations });
      }

      const subtotalAmount = lineAllocations.reduce(
        (sum, line) => sum + line.allocations.reduce((s, a) => s + a.quantity, 0) * line.unitPrice,
        0
      );
      const discountPercent = input.discountPercent ?? 0;
      const totalAmount = round2(subtotalAmount * (1 - discountPercent / 100));

      const year = new Date().getFullYear();
      const countThisYear = await tx.sale.count({
        where: { soldAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
      });
      const invoiceNumber = `INV-${year}-${String(countThisYear + 1).padStart(4, "0")}`;

      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          userId: input.userId,
          paymentMethod: input.paymentMethod,
          subtotalAmount: round2(subtotalAmount),
          discountPercent,
          totalAmount,
          items: {
            create: lineAllocations.flatMap((line) =>
              line.allocations.map((a) => ({
                batchId: a.batchId,
                quantity: a.quantity,
                price: line.unitPrice,
              }))
            ),
          },
        },
        include: saleInclude,
      });

      for (const line of lineAllocations) {
        for (const a of line.allocations) {
          await tx.stockBatch.update({
            where: { id: a.batchId },
            data: { quantityOnHand: { decrement: a.quantity } },
          });
        }
      }

      return sale;
    });
  },
};
