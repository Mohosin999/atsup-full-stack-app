import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import path from "path";
import { configureGoogleStrategy } from "../config/passport";
import { env } from "../config/env";

export const applyMiddleware = (app: Application): void => {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin: [
        env.frontendUrl,
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  const uploadsDir = path.join(__dirname, "..", "..", "uploads");
  app.use("/uploads", express.static(uploadsDir));

  passport.use(configureGoogleStrategy());

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/", apiLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
};
