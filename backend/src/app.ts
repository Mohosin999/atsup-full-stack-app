import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";

import { applyMiddleware } from "./middlewares";
import { routes } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();

app.set("trust proxy", 1);

applyMiddleware(app);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Server is running..." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
