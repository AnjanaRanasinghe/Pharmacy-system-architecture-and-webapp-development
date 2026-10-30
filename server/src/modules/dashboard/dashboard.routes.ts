import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get("/", asyncHandler(dashboardController.get));
