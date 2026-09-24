import { Response } from "express";
import { z } from "zod";
import { salesService } from "./sales.service";
import { AuthedRequest } from "../../common/middleware/auth.middleware";
import { serializeDecimals } from "../../common/utils/serialize-decimals";

const saleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

const createSaleSchema = z.object({
  paymentMethod: z.enum(["CASH", "CARD", "OTHER"]).default("CASH"),
  discountPercent: z.number().min(0).max(100).optional(),
  cashTendered: z.number().nonnegative().optional(),
  items: z.array(saleItemSchema).min(1, "Add at least one item"),
});

export const salesController = {
  async list(_req: AuthedRequest, res: Response) {
    res.json(serializeDecimals(await salesService.list()));
  },

  async get(req: AuthedRequest, res: Response) {
    res.json(serializeDecimals(await salesService.get(String(req.params.id))));
  },

  async create(req: AuthedRequest, res: Response) {
    const parsed = createSaleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const sale = await salesService.create({ ...parsed.data, userId: req.userId! });
    res.status(201).json(serializeDecimals(sale));
  },
};
