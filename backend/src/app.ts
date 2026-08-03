import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { routes } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { applyMiddleware } from "./middlewares/middlewareConfig";

dotenv.config();

const app: Application = express();

// Trust the first proxy (useful when running behind reverse proxies like Nginx, Heroku, etc.)
app.set("trust proxy", 1);

// Apply all global middlewares (cors, json parser, helmet, morgan, etc.)
applyMiddleware(app);

app.get("/", (_req: Request, res: Response) => {
  res.send("CVCoach - Welcome to the API");
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "CVCoach is healthy",
  });
});

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
