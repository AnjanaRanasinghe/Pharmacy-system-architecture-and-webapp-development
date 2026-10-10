import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { asyncHandler } from "../../common/middleware/async-handler";

export const dashboardRouter = Router();

dashboardRouter.get("/", asyncHandler(dashboardController.get));
