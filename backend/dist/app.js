import express from "express";
import dotenv from "dotenv";
import { moduleRoutes } from "./modules";
import { errorHandler } from "./shared/middlewares/errorHandler";
import { applyMiddleware } from "./shared/middlewares/middlewareConfig";
dotenv.config();
const app = express();
// Trust the first proxy (useful when running behind reverse proxies like Nginx, Heroku, etc.)
app.set("trust proxy", 1);
// Apply all global middlewares (cors, json parser, helmet, morgan, etc.)
applyMiddleware(app);
app.get("/", (_req, res) => {
    res.send("CVCoach - Welcome to the API");
});
app.get("/health", (_req, res) => {
    res.json({
        status: "OK",
        message: "CVCoach is healthy",
    });
});
moduleRoutes.forEach(({ path, router }) => {
    app.use(path, router);
});
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({
        message: "Route not found",
    });
});
// Global Error Handler
app.use(errorHandler);
export default app;
