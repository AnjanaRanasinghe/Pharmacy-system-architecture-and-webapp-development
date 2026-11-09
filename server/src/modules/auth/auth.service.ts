import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../../config/db";

const SALT_ROUNDS = 10;

export const authService = {
  async register(email: string, password: string) {
    // This shop runs on exactly two accounts: the developer's own, and the shop's —
    // no open-ended user management, so open sign-up would otherwise let anyone who
    // finds the login page create themselves extra accounts. Both accounts get full
    // ADMIN access (including Backup/Restore/Factory-reset) since the shop runs this
    // system on its own after delivery, with no on-site developer to fall back on.
    // Registration closes for good after the second account.
    const userCount = await prisma.user.count();
    if (userCount >= 2) throw new Error("Registration is closed. Contact the pharmacy admin for access.");

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

  // No email/SMS infrastructure on this offline, single-PC system, so this can't
  // be a real "reset link" flow — it's a direct reset gated only by knowing the
  // account's email. Acceptable here since there are exactly two trusted accounts
  // on one physically-controlled shop PC; not a pattern to reuse for a networked app.
  async resetPassword(email: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("No account found with that email");

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    return prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
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