import { Router } from "express";
import { productsController } from "./products.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const productsRouter = Router();

productsRouter.use(requireAuth);
productsRouter.get("/", asyncHandler(productsController.search));
productsRouter.get("/inventory", asyncHandler(productsController.listInventory));
productsRouter.get("/barcode/:code", asyncHandler(productsController.findByBarcode));
productsRouter.post("/", asyncHandler(productsController.create));
productsRouter.put("/:id", asyncHandler(productsController.update));
productsRouter.delete("/:id", asyncHandler(productsController.remove));