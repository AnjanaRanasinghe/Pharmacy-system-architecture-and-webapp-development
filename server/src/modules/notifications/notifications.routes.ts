import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get("/", asyncHandler(notificationsController.list));
notificationsRouter.post("/read-all", asyncHandler(notificationsController.markAllRead));
notificationsRouter.patch("/:id/read", asyncHandler(notificationsController.markRead));
notificationsRouter.delete("/:id", asyncHandler(notificationsController.dismiss));
