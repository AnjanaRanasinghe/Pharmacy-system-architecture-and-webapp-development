import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { asyncHandler } from "../../common/middleware/async-handler";

export const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(categoriesController.list));
categoriesRouter.post("/", asyncHandler(categoriesController.create));
categoriesRouter.put("/:id", asyncHandler(categoriesController.update));
categoriesRouter.delete("/:id", asyncHandler(categoriesController.remove));