import { Request, Response } from "express";
import { z } from "zod";
import { purchasesService } from "./purchases.service";

const purchaseItemSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string().min(1, "Batch number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  purchasedAmount: z.number().nonnegative(),
  sellingAmount: z.number().nonnegative(),
});

const purchaseSchema = z.object({
  supplierId: z.string().uuid("Select a supplier"),
  orderDate: z.string().min(1),
  expectedDelivery: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
});

export const purchasesController = {
  async list(_req: Request, res: Response) {
    res.json(await purchasesService.list());
  },
  async create(req: Request, res: Response) {
    const parsed = purchaseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await purchasesService.create(parsed.data));
  },
};