import { Request, Response } from "express";
import { z } from "zod";
import { categoriesService } from "./categories.service";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const categoriesController = {
  async list(_req: Request, res: Response) {
    const categories = await categoriesService.getAll();
    res.json(categories);
  },

  async create(req: Request, res: Response) {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const category = await categoriesService.create(parsed.data);
    res.status(201).json(category);
  },

  async update(req: Request, res: Response) {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const category = await categoriesService.update(req.params.id, parsed.data);
    res.json(category);
  },

  async remove(req: Request, res: Response) {
    await categoriesService.remove(req.params.id);
    res.status(204).send();
  },
};