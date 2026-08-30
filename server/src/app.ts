import express from "express";
import cors from "cors";
import helmet from "helmet";
import { categoriesRouter } from "./modules/categories/categories.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/categories", categoriesRouter);

// Global error handler — must have 4 args to be recognized by Express as error middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});