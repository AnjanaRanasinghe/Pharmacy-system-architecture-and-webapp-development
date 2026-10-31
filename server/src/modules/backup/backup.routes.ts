import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { backupController } from "./backup.controller";
import { asyncHandler } from "../../common/middleware/async-handler";
import { requireAuth, AuthedRequest } from "../../common/middleware/auth.middleware";
import { AppError } from "../../common/errors/app-error";

// Backups contain every row in the database, including password hashes — only an
// admin should be able to create, download, or restore one.
function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  if (req.userRole !== "ADMIN") {
    return next(new AppError("Only an admin can manage backups.", 403));
  }
  next();
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

export const backupRouter = Router();

backupRouter.use(requireAuth, requireAdmin);

backupRouter.get("/", asyncHandler(backupController.list));
backupRouter.post("/", asyncHandler(backupController.create));
backupRouter.get("/:filename/download", asyncHandler(backupController.download));
backupRouter.delete("/:filename", asyncHandler(backupController.remove));
backupRouter.post("/restore/upload", upload.single("file"), asyncHandler(backupController.restoreUpload));
backupRouter.post("/restore/:filename", asyncHandler(backupController.restoreExisting));
backupRouter.post("/factory-reset", asyncHandler(backupController.factoryReset));
