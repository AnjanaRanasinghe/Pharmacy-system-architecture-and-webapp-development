import { Request, Response } from "express";
import { reportsService } from "./reports.service";
import { AppError } from "../../common/errors/app-error";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function dateParam(v: unknown): string | undefined {
  if (typeof v !== "string" || !v) return undefined;
  if (!DATE_RE.test(v)) throw new AppError(`"${v}" isn't a valid date — expected YYYY-MM-DD.`);
  return v;
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
