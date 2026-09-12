import { Request, Response } from "express";
import { z } from "zod";
import { productsService } from "./products.service";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  barcode: z.string().optional(),
  categoryId: z.string().uuid("Select a category"),
  defaultSupplierId: z.string().uuid().optional(),
  sellingPrice: z.number().nonnegative(),
  reorderLevel: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
});

export const productsController = {
  async search(req: Request, res: Response) {
    const query = typeof req.query.search === "string" ? req.query.search : undefined;
    res.json(await productsService.search(query));
  },

  async findByBarcode(req: Request, res: Response) {
    const product = await productsService.findByBarcode(req.params.code);
    if (!product) return res.status(404).json({ error: "No product found for this barcode" });
    res.json(product);
  },

  async create(req: Request, res: Response) {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await productsService.create(parsed.data));
  },

  async listInventory(_req: Request, res: Response) {
    res.json(await productsService.listWithStock());
  },

  async update(req: Request, res: Response) {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await productsService.update(req.params.id, parsed.data));
  },

  async remove(req: Request, res: Response) {
    const result = await productsService.remove(req.params.id);
    if (result.archived) {
      return res.status(200).json({
        archived: true,
        message: "This product has purchase or sale history, so it was archived instead of permanently deleted.",
      });
    }
    res.status(204).send();
  },
};