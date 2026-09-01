import { Router } from "express";
import { authController } from "./auth.controller";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { asyncHandler } from "../../common/middleware/async-handler";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, asyncHandler(authController.me));