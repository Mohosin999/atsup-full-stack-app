import { Router, Response } from "express";
import passport from "passport";
import { authenticate } from "../../shared/middlewares/auth";
import { generalLimiter } from "../../shared/middlewares/middlewareConfig";
import { AuthRequest } from "../../shared/types";
import { generateAccessToken, generateRefreshToken } from "../../shared/config/jwt";
import { storeRefreshToken } from "../../lib/redis";
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from "./auth.controller";
import { env } from "../../shared/config/env";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// ========================================================
// OAuth Callback (Google)
// ========================================================
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=auth_failed",
  }),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      await storeRefreshToken(refreshToken, user.id, 7 * 24 * 60 * 60);

      const isProduction = env.nodeEnv === "production";

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(env.frontendUrl);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/login?error=callback_failed");
    }
  },
);

router.get("/me", authenticate, getMe);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

export default router;
