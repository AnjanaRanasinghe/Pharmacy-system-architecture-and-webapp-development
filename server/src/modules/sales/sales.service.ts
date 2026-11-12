import { prisma } from "../../config/db";
import { AppError } from "../../common/errors/app-error";

interface SaleItemInput {
  productId: string;
  quantity: number;
  discountPercent?: number;
}

interface CreateSaleInput {
  userId: string;
  paymentMethod: "CASH" | "CARD" | "OTHER";
  discountPercent?: number;
  cashTendered?: number;
  // Cash-register rounding: cashiers often charge a tidier round number (e.g. Rs.
  // 520 instead of an exact Rs. 536.22) rather than deal with small change. When
  // set, this replaces the computed total; the gap between the two just widens
  // what the invoice already shows as "Discount" (subtotal - total), with no
  // separate line item or stored field needed for it.
  totalOverride?: number;
  items: SaleItemInput[];
}

interface CreateReturnInput {
  userId: string;
  reason?: string;
  items: { saleItemId: string; quantity: number; restock: boolean }[];
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const saleInclude = {
  user: { select: { id: true, name: true, email: true, role: true } },
  customer: true,
  items: { include: { batch: { include: { product: true } } } },
  returns: {
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  },
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
        discountPercent: number;
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

        lineAllocations.push({
          unitPrice: Number(product.sellingPrice),
          discountPercent: item.discountPercent ?? 0,
          allocations,
        });
      }

      // Gross total, before any discount.
      const subtotalAmount = lineAllocations.reduce(
        (sum, line) => sum + line.allocations.reduce((s, a) => s + a.quantity, 0) * line.unitPrice,
        0
      );
      // Each item's own discount is applied first...
      const itemDiscountTotal = lineAllocations.reduce((sum, line) => {
        const lineGross = line.allocations.reduce((s, a) => s + a.quantity, 0) * line.unitPrice;
        return sum + round2(lineGross * (line.discountPercent / 100));
      }, 0);
      const afterItemDiscount = subtotalAmount - itemDiscountTotal;
      // ...then the overall bill discount applies on what's left.
      const discountPercent = input.discountPercent ?? 0;
      const billDiscountAmount = round2(afterItemDiscount * (discountPercent / 100));
      const computedTotal = round2(afterItemDiscount - billDiscountAmount);

      if (input.totalOverride !== undefined && input.totalOverride < 0) {
        throw new AppError("Total can't be negative.");
      }
      const totalAmount = input.totalOverride !== undefined ? round2(input.totalOverride) : computedTotal;

      if (input.paymentMethod === "CASH" && input.cashTendered !== undefined && input.cashTendered < totalAmount) {
        throw new AppError(`Cash tendered (${input.cashTendered}) is less than the total (${totalAmount}).`);
      }

      // The invoice number is just the sale's own running sequenceNumber (1, 2, 3...),
      // so the shop can tell at a glance how many invoices it has ever issued. That
      // number only exists once the row is created, but invoiceNumber is a required,
      // unique column — so create with a collision-proof placeholder, then stamp the
      // real number on right after, inside the same transaction.
      const placeholderInvoiceNumber = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const created = await tx.sale.create({
        data: {
          invoiceNumber: placeholderInvoiceNumber,
          userId: input.userId,
          paymentMethod: input.paymentMethod,
          subtotalAmount: round2(subtotalAmount),
          discountPercent,
          totalAmount,
          cashTendered: input.cashTendered,
          items: {
            create: lineAllocations.flatMap((line) =>
              line.allocations.map((a) => ({
                batchId: a.batchId,
                quantity: a.quantity,
                price: line.unitPrice,
                discountPercent: line.discountPercent,
              }))
            ),
          },
        },
      });

      const sale = await tx.sale.update({
        where: { id: created.id },
        data: { invoiceNumber: String(created.sequenceNumber) },
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

  async createReturn(saleId: string, input: CreateReturnInput) {
    if (input.items.length === 0) throw new AppError("Select at least one item to return.");

    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: { include: { returnItems: true } } },
      });
      if (!sale) throw new AppError("Sale not found", 404);

      let refundAmount = 0;
      const returnItemsData: { saleItemId: string; quantity: number; restocked: boolean }[] = [];
      const restockOps: { batchId: string; quantity: number }[] = [];

      for (const requested of input.items) {
        const saleItem = sale.items.find((i) => i.id === requested.saleItemId);
        if (!saleItem) throw new AppError(`Sale item ${requested.saleItemId} does not belong to this invoice.`);
        if (requested.quantity <= 0) throw new AppError("Return quantity must be greater than 0.");

        const alreadyReturned = saleItem.returnItems.reduce((sum, ri) => sum + ri.quantity, 0);
        const returnable = saleItem.quantity - alreadyReturned;
        if (requested.quantity > returnable) {
          throw new AppError(
            `Only ${returnable} unit(s) of this item can still be returned (already returned ${alreadyReturned} of ${saleItem.quantity}).`
          );
        }

        const netUnitPrice =
          Number(saleItem.price) * (1 - Number(saleItem.discountPercent) / 100) * (1 - Number(sale.discountPercent) / 100);
        refundAmount += netUnitPrice * requested.quantity;

        returnItemsData.push({ saleItemId: saleItem.id, quantity: requested.quantity, restocked: requested.restock });
        if (requested.restock) restockOps.push({ batchId: saleItem.batchId, quantity: requested.quantity });
      }

      const year = new Date().getFullYear();
      const countThisYear = await tx.saleReturn.count({
        where: { createdAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
      });
      const returnNumber = `RET-${year}-${String(countThisYear + 1).padStart(4, "0")}`;

      const saleReturn = await tx.saleReturn.create({
        data: {
          returnNumber,
          saleId,
          userId: input.userId,
          reason: input.reason?.trim() || undefined,
          refundAmount: round2(refundAmount),
          items: { create: returnItemsData },
        },
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
      });

      for (const op of restockOps) {
        await tx.stockBatch.update({ where: { id: op.batchId }, data: { quantityOnHand: { increment: op.quantity } } });
      }

      return saleReturn;
    });
  },
};
