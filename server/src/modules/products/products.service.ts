import { prisma } from "../../config/db";

interface ProductInput {
  name: string;
  brand: string;
  barcode?: string;
  categoryId: string;
  defaultSupplierId?: string;
  sellingPrice: number;
  reorderLevel?: number;
  description?: string;
}

export function generateInternalBarcode() {
  // Timestamp alone can collide when several new products are created within the
  // same millisecond (e.g. multiple new brands in one purchase order submission).
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INT-${Date.now()}-${random}`;
}

export const productsService = {
  async search(query?: string) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } },
                { barcode: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
      take: 20,
    });
  },

  findByBarcode(barcode: string) {
    return prisma.product.findFirst({ where: { barcode, isActive: true } });
  },

  create(data: ProductInput) {
    return prisma.product.create({
      data: { ...data, barcode: data.barcode?.trim() || generateInternalBarcode() },
    });
  },

  async listWithStock() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      stockBatches: { where: { quantityOnHand: { gt: 0 } }, orderBy: { expiryDate: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => {
    const totalQuantity = p.stockBatches.reduce((sum, b) => sum + b.quantityOnHand, 0);
    const earliestBatch = p.stockBatches[0];
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      barcode: p.barcode,
      category: p.category.name,
      categoryId: p.categoryId,
      sellingPrice: Number(p.sellingPrice),
      purchasePrice: earliestBatch ? Number(earliestBatch.purchasePrice) : null,
      reorderLevel: p.reorderLevel,
      totalQuantity,
      batchCount: p.stockBatches.length,
      primaryBatchNumber: earliestBatch?.batchNumber ?? null,
      nearestExpiry: earliestBatch?.expiryDate ?? null,
    };
  });
},

  update(id: string, data: ProductInput) {
    return prisma.product.update({
      where: { id },
      data: { ...data, barcode: data.barcode?.trim() || undefined },
    });
  },

  async remove(id: string) {
    try {
      await prisma.product.delete({ where: { id } });
      return { archived: false };
    } catch (err: any) {
      if (err.code === "P2003") {
        // Has stock batches or transaction history — archive instead of destroying data
        await prisma.product.update({ where: { id }, data: { isActive: false } });
        return { archived: true };
      }
      throw err;
    }
  },
};

