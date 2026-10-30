import { Router } from "express";
import { settingsController } from "./settings.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth } from "../../common/middleware/auth.middleware";

export const settingsRouter = Router();

// Pharmacy name/address/contact is printed on receipts customers take home, so it's
// not sensitive — GET is public (login page, print preview) while PUT stays protected.
settingsRouter.get("/", asyncHandler(settingsController.get));
settingsRouter.put("/", requireAuth, asyncHandler(settingsController.update));
