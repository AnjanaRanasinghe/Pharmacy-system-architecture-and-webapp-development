import { Request, Response } from "express";
import { reportsService } from "./reports.service";

function dateParam(v: unknown): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

export const reportsController = {
  async sales(req: Request, res: Response) {
    res.json(await reportsService.getSalesReport(dateParam(req.query.from), dateParam(req.query.to)));
  },
  async purchases(req: Request, res: Response) {
    res.json(await reportsService.getPurchaseReport(dateParam(req.query.from), dateParam(req.query.to)));
  },
  async stock(_req: Request, res: Response) {
    res.json(await reportsService.getStockReport());
  },
  async expiry(req: Request, res: Response) {
    res.json(await reportsService.getExpiryReport(dateParam(req.query.from), dateParam(req.query.to)));
  },
};
