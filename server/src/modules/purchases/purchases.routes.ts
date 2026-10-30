import { Router } from "express";
import { purchasesController } from "./purchases.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const purchasesRouter = Router();

purchasesRouter.use(requireAuth);
purchasesRouter.get("/", asyncHandler(purchasesController.list));
purchasesRouter.post("/", asyncHandler(purchasesController.create));