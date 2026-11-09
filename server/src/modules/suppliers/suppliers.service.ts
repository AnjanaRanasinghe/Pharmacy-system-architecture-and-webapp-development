import { prisma } from "../../config/db";
import { AppError } from "../../common/errors/app-error";

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
  // Used when a supplier is typed in on the fly (e.g. mid purchase-order entry,
  // before there's time to fill in the full supplier record). The rest of the
  // required-by-schema fields are left blank and filled in later from the
  // Suppliers page.
  // email/address are stored as "" rather than left null — the client types
  // every supplier field as a plain string (and the edit form calls
  // .trim() on them), so a null here would crash the edit dialog later.
  quickCreate: (name: string) =>
    prisma.supplier.create({
      data: { name, contactPerson: "", phone: "", email: "", address: "", paymentTerms: "" },
    }),
  update: (id: string, data: SupplierInput) => prisma.supplier.update({ where: { id }, data }),
  async remove(id: string) {
    try {
      return await prisma.supplier.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === "P2003") {
        throw new AppError("This supplier has purchase history or linked medicines. It can't be deleted.");
      }
      throw err;
    }
  },
};