import { Router, Response } from "express";
import passport from "passport";
import { authenticate } from "../middlewares/auth";
import { AuthRequest } from "../types";
import { generateAccessToken, generateRefreshToken } from "../config/jwt";
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from "../controllers/auth";
import { env } from "../config/env";

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

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "lax",
        path: "/",
        maxAge: 10 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // res.redirect(env.frontendUrl || "http://localhost:4173");
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
