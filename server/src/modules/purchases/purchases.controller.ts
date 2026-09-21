import { Request, Response } from "express";
import { z } from "zod";
import { purchasesService } from "./purchases.service";

const purchaseItemSchema = z
  .object({
    productId: z.string().uuid().optional(),
    newProduct: z
      .object({
        name: z.string().min(1, "Name is required"),
        brand: z.string().min(1, "Brand is required"),
        barcode: z.string().optional(),
        categoryId: z.string().uuid("Select a category"),
      })
      .optional(),
    productUpdates: z
      .object({
        name: z.string().min(1).optional(),
        brand: z.string().min(1).optional(),
      })
      .optional(),
    batchNumber: z.string().min(1, "Batch number is required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
    quantity: z.number().int().positive("Quantity must be greater than 0"),
    purchasedAmount: z.number().nonnegative(),
    sellingAmount: z.number().nonnegative(),
  })
  .refine((item) => Boolean(item.productId) !== Boolean(item.newProduct), {
    message: "Provide either productId or newProduct for each item",
    path: ["productId"],
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