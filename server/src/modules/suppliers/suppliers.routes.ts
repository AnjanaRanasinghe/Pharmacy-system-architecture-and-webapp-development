import { Router } from "express";
import { suppliersController } from "./suppliers.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const suppliersRouter = Router();
suppliersRouter.use(requireAuth);
suppliersRouter.get("/", asyncHandler(suppliersController.list));
suppliersRouter.post("/", asyncHandler(suppliersController.create));
suppliersRouter.post("/quick", asyncHandler(suppliersController.quickCreate));
suppliersRouter.put("/:id", asyncHandler(suppliersController.update));
suppliersRouter.delete("/:id", asyncHandler(suppliersController.remove));