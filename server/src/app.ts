import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { productsRouter } from "./modules/products/products.routes";
import { purchasesRouter } from "./modules/purchases/purchases.routes";
import { suppliersRouter } from "./modules/suppliers/suppliers.routes";
import { salesRouter } from "./modules/sales/sales.routes";
import { AppError } from "./common/errors/app-error";

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/purchases", purchasesRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/sales", salesRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});