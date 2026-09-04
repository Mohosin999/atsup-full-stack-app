import { Router, Response } from "express";
import passport from "passport";
import { authenticate } from "../../shared/middlewares/auth";
import { authLimiter } from "../../shared/middlewares/middlewareConfig";

import { AuthRequest } from "../../shared/types";
import { generateAccessToken, generateRefreshToken } from "../../shared/config/jwt";
import { storeRefreshToken, deleteAllRefreshTokensForUser } from "../../lib/redis";
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
  authLimiter,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);

// ========================================================
// OAuth Callback (Google)
// ========================================================
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.frontendUrl}/login?error=auth_failed`,
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

      await deleteAllRefreshTokensForUser(user.id);
      await storeRefreshToken(refreshToken, user.id, 1 * 24 * 60 * 60);

      // Plan A: redirect directly to / with tokens (skip /auth/callback page to avoid double navbar flash)
      const redirectUrl = new URL(`${env.frontendUrl}/`);
      redirectUrl.searchParams.set("accessToken", accessToken);
      redirectUrl.searchParams.set("refreshToken", refreshToken);
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${env.frontendUrl}/login?error=callback_failed`);
    }
  },
);

router.get("/me", authenticate, getMe);

router.post("/refresh", refreshToken);

router.post("/logout", logout);

export default router;
