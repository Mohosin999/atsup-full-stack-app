import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import express, { Application, Request } from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import path from "path";
import { configureGoogleStrategy } from "../config/passport";
import { env } from "../config/env";
import { getRedisClient } from "../../lib/redis";

/** -------------------------------------------------
 * Real client IP extraction
 * Behind nginx/Cloudflare, req.ip is unreliable.
 * Priority: cf-connecting-ip -> x-forwarded-for -> req.ip
 ----------------------------------------------------*/
export const getClientIp = (req: Request): string => {
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (typeof cfConnectingIp === "string" && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
};

/** -------------------------------------------------
 * Rate limit key: user ID when authenticated,
 * otherwise the real client IP.
 ----------------------------------------------------*/
const getRateLimitKey = (req: Request): string => {
  const userId = (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${getClientIp(req)}`;
};

/** -------------------------------------------------
 * Redis-backed store factory
 * Shared store instance for all rate limiters.
 * Falls back gracefully if Redis is unavailable.
 ----------------------------------------------------*/
const redisStore = new RedisStore({
  sendCommand: (...args: string[]) => getRedisClient().call(args[0], ...args.slice(1)) as any,
  prefix: "rl:",
});

/** -------------------------------------------------
 * General limiter for light/normal endpoints
 * (auth/me, profile, history, resumes, etc.)
 ----------------------------------------------------*/
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 15 minutes
  max: 3000,
  keyGenerator: getRateLimitKey,
  store: redisStore,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** -------------------------------------------------
 * Tight limiter for public auth endpoints
 ----------------------------------------------------*/
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `ip:${getClientIp(req)}`,
  store: redisStore,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const applyMiddleware = (app: Application): void => {
  app.use(
    /** ----------------------------------------------
     * Security Headers (Helmet)
     * Protects against common web vulnerabilities
     ------------------------------------------------*/
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  /** --------------------------------------------------
   * CORS Configuration
   * Allows requests only from trusted frontend origins
   ----------------------------------------------------*/
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

  /** -------------------------------------------------
   * Rate Limiting
   * Only public auth endpoints are limited here.
   * General/AI limiters are applied per-route so they
   * run after authentication and key by user ID.
   ----------------------------------------------------*/
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
};
