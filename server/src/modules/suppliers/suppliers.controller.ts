import { Request, Response } from "express";
import { z } from "zod";
import { suppliersService } from "./suppliers.service";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Enter a valid email"),
  address: z.string().optional(),
  paymentTerms: z.string().min(1, "Payment terms are required"),
});

export const suppliersController = {
  async list(_req: Request, res: Response) {
    res.json(await suppliersService.getAll());
  },
  async create(req: Request, res: Response) {
    const parsed = supplierSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await suppliersService.create(parsed.data));
  },
  async update(req: Request, res: Response) {
    const parsed = supplierSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await suppliersService.update(String(req.params.id), parsed.data));
  },
  async remove(req: Request, res: Response) {
    await suppliersService.remove(String(req.params.id));
    res.status(204).send();
  },
};