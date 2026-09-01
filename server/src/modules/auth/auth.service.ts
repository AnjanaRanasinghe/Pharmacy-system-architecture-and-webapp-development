import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../../config/db";

const SALT_ROUNDS = 10;

export const authService = {
  async register(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("An account with this email already exists");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    return prisma.user.create({ data: { email, passwordHash, role: Role.ADMIN } });
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");
    return user;
  },

  generateToken(user: { id: string; role: string }) {
    return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d",
    });
  },

  sanitize(user: { id: string; email: string; name: string | null; role: string }) {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },
};