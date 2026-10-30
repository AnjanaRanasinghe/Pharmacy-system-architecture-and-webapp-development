import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);
categoriesRouter.get("/", asyncHandler(categoriesController.list));
categoriesRouter.post("/", asyncHandler(categoriesController.create));
categoriesRouter.put("/:id", asyncHandler(categoriesController.update));
categoriesRouter.delete("/:id", asyncHandler(categoriesController.remove));