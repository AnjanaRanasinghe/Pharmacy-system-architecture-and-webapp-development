import { Request, Response } from "express";
import { notificationsService } from "./notifications.service";

export const notificationsController = {
  async list(_req: Request, res: Response) {
    res.json(await notificationsService.list());
  },

  async markRead(req: Request, res: Response) {
    res.json(await notificationsService.markRead(String(req.params.id)));
  },

  async markAllRead(_req: Request, res: Response) {
    await notificationsService.markAllRead();
    res.status(204).send();
  },

  async dismiss(req: Request, res: Response) {
    await notificationsService.dismiss(String(req.params.id));
    res.status(204).send();
  },
};
