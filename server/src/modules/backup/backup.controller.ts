import { Response } from "express";
import { AuthedRequest } from "../../common/middleware/auth.middleware";
import { AppError } from "../../common/errors/app-error";
import { COOKIE_OPTIONS } from "../auth/auth.controller";
import { backupService } from "./backup.service";

export const backupController = {
  list(_req: AuthedRequest, res: Response) {
    res.json(backupService.listBackups());
  },

  async create(_req: AuthedRequest, res: Response) {
    const meta = await backupService.createBackup();
    res.status(201).json(meta);
  },

  download(req: AuthedRequest, res: Response) {
    const filename = String(req.params.filename);
    const file = backupService.getBackupFileForDownload(filename);
    res.download(file.path, file.filename);
  },

  remove(req: AuthedRequest, res: Response) {
    backupService.deleteBackup(String(req.params.filename));
    res.status(204).send();
  },

  async restoreUpload(req: AuthedRequest & { file?: Express.Multer.File }, res: Response) {
    if (!req.file) throw new AppError("No backup file was uploaded.");
    const result = await backupService.restoreFromUpload(req.file.buffer);
    res.json(result);
  },

  async restoreExisting(req: AuthedRequest, res: Response) {
    const result = await backupService.restoreFromExisting(String(req.params.filename));
    res.json(result);
  },

  async factoryReset(req: AuthedRequest, res: Response) {
    const { password } = req.body as { password?: string };
    if (!password) throw new AppError("Password is required.");
    await backupService.factoryResetWithPassword(req.userId as string, password);
    res.clearCookie("token", COOKIE_OPTIONS);
    res.status(204).send();
  },
};
