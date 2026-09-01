import { Request, Response } from "express";
import { z } from "zod";
import { authService } from "./auth.service";
import { AuthedRequest } from "../../common/middleware/auth.middleware";
import { prisma } from "../../config/db";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const user = await authService.register(parsed.data.email, parsed.data.password);
      res.cookie("token", authService.generateToken(user), COOKIE_OPTIONS);
      res.status(201).json(authService.sanitize(user));
    } catch (err) {
      res.status(409).json({ error: err instanceof Error ? err.message : "Registration failed" });
    }
  },

  async login(req: Request, res: Response) {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const user = await authService.login(parsed.data.email, parsed.data.password);
      res.cookie("token", authService.generateToken(user), COOKIE_OPTIONS);
      res.json(authService.sanitize(user));
    } catch (err) {
      res.status(401).json({ error: err instanceof Error ? err.message : "Login failed" });
    }
  },

  async me(req: AuthedRequest, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    res.json(authService.sanitize(user));
  },

  logout(_req: Request, res: Response) {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.status(204).send();
  },
};