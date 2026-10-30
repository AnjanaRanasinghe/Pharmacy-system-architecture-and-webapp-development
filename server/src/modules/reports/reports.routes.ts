import { Router } from "express";
import { reportsController } from "./reports.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const reportsRouter = Router();

reportsRouter.use(requireAuth);
reportsRouter.get("/sales", asyncHandler(reportsController.sales));
reportsRouter.get("/purchases", asyncHandler(reportsController.purchases));
reportsRouter.get("/stock", asyncHandler(reportsController.stock));
reportsRouter.get("/expiry", asyncHandler(reportsController.expiry));
