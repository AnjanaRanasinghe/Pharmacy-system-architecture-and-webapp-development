import { Router } from "express";
import { suppliersController } from "./suppliers.controller";
import { asyncHandler } from "../../common/middleware/async-handler";

export const suppliersRouter = Router();
suppliersRouter.get("/", asyncHandler(suppliersController.list));
suppliersRouter.post("/", asyncHandler(suppliersController.create));
suppliersRouter.put("/:id", asyncHandler(suppliersController.update));
suppliersRouter.delete("/:id", asyncHandler(suppliersController.remove));