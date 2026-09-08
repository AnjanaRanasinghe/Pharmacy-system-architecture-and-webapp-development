import { Router } from "express";
import { purchasesController } from "./purchases.controller";
import { asyncHandler } from "../../common/middleware/async-handler";

export const purchasesRouter = Router();

purchasesRouter.get("/", asyncHandler(purchasesController.list));
purchasesRouter.post("/", asyncHandler(purchasesController.create));