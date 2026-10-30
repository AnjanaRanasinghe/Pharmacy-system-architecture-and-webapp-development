import { Request, Response } from "express";
import { z } from "zod";
import { settingsService } from "./settings.service";

const updateSettingsSchema = z.object({
  name: z.string().min(1, "Pharmacy name is required"),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  licenseNumber: z.string().optional().nullable(),
});

export const settingsController = {
  async get(_req: Request, res: Response) {
    res.json(await settingsService.get());
  },

  async update(req: Request, res: Response) {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { email, ...rest } = parsed.data;
    const updated = await settingsService.update({ ...rest, email: email || null });
    res.json(updated);
  },
};
