import { prisma } from "../../config/db";
import { AppError } from "../../common/errors/app-error";

interface CategoryInput {
  name: string;
  description?: string;
}

export const categoriesService = {
  async getAll() {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "asc" },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      medicineCount: c._count.products,
    }));
  },

  create(data: CategoryInput) {
    return prisma.category.create({ data });
  },

  update(id: string, data: CategoryInput) {
    return prisma.category.update({ where: { id }, data });
  },

  async remove(id: string) {
    try {
      return await prisma.category.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === "P2003") throw new AppError("This category still has medicines in it. Move or remove them first.");
      throw err;
    }
  },
};