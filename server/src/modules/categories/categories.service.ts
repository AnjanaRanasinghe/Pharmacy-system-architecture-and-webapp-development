import { prisma } from "../../config/db";

interface CategoryInput {
  name: string;
  description?: string;
}

export const categoriesService = {
  async getAll() {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { medicines: true } } },
      orderBy: { createdAt: "asc" },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      medicineCount: c._count.medicines,
    }));
  },

  create(data: CategoryInput) {
    return prisma.category.create({ data });
  },

  update(id: string, data: CategoryInput) {
    return prisma.category.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};