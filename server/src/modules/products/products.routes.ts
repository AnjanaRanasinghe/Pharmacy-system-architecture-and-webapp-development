import { Router } from "express";
import { productsController } from "./products.controller";
import { asyncHandler } from "../../common/middleware/async-handler";

export const productsRouter = Router();

productsRouter.get("/", asyncHandler(productsController.search));
productsRouter.get("/inventory", asyncHandler(productsController.listInventory));
productsRouter.get("/barcode/:code", asyncHandler(productsController.findByBarcode));
productsRouter.post("/", asyncHandler(productsController.create));
productsRouter.put("/:id", asyncHandler(productsController.update));
productsRouter.delete("/:id", asyncHandler(productsController.remove));