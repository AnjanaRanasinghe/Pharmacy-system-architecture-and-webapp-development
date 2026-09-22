import { Router } from "express";
import { salesController } from "./sales.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const salesRouter = Router();

salesRouter.use(requireAuth);
salesRouter.get("/", asyncHandler(salesController.list));
salesRouter.get("/:id", asyncHandler(salesController.get));
salesRouter.post("/", asyncHandler(salesController.create));
