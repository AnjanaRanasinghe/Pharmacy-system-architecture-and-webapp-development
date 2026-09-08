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

function generateInternalBarcode() {
  return `INT-${Date.now().toString().slice(-9)}`;
}

export const productsService = {
  async search(query?: string) {
    return prisma.product.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { barcode: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { category: true },
      orderBy: { name: "asc" },
      take: 20,
    });
  },

  findByBarcode(barcode: string) {
    return prisma.product.findUnique({ where: { barcode } });
  },

  create(data: ProductInput) {
    return prisma.product.create({
      data: { ...data, barcode: data.barcode?.trim() || generateInternalBarcode() },
    });
  },
};