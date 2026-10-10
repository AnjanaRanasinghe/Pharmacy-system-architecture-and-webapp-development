import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  async get(_req: Request, res: Response) {
    res.json(await dashboardService.getDashboard());
  },
};
