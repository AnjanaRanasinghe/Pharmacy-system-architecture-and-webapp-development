import { prisma } from "../../config/db";

interface SupplierInput {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  paymentTerms: string;
}

export const suppliersService = {
  async getAll() {
    const suppliers = await prisma.supplier.findMany({
      include: { purchases: { select: { totalAmount: true } } },
      orderBy: { createdAt: "asc" },
    });
    return suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      address: s.address,
      paymentTerms: s.paymentTerms,
      totalPurchases: s.purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0),
    }));
  },
  create: (data: SupplierInput) => prisma.supplier.create({ data }),
  update: (id: string, data: SupplierInput) => prisma.supplier.update({ where: { id }, data }),
  remove: (id: string) => prisma.supplier.delete({ where: { id } }),
};