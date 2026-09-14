import { Router, Response } from "express";
import passport from "passport";
import { authenticate } from "../../shared/middlewares/auth";
import { authLimiter } from "../../shared/middlewares/middlewareConfig";

import { AuthRequest } from "../../shared/types";
import { prisma } from "../../lib/prisma";
import { generateAccessToken, generateRefreshToken } from "../../shared/config/jwt";
import { storeRefreshToken, deleteAllRefreshTokensForUser } from "../../lib/redis";
import { checkDuplicateDevice, isGmail } from "../../shared/utils/deviceCheck";
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

      // Only @gmail.com allowed
      if (!isGmail(user.email)) {
        res.redirect(`${env.frontendUrl}/login?error=not_gmail&reason=${encodeURIComponent("Only Gmail addresses are accepted")}`);
        return;
      }

      // One account per device (Google OAuth)
      const fingerprint = (req.query?.fingerprint as string) || null;
      const deviceCheck = await checkDuplicateDevice(fingerprint);
      if (deviceCheck.blocked) {
        // If blocked but user already exists (same email linked), allow login
        const existingByEmail = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (!existingByEmail || existingByEmail.id !== user.id) {
          const reason = encodeURIComponent(deviceCheck.reason || "An account already exists on this device.");
          res.redirect(`${env.frontendUrl}/login?error=device_blocked&reason=${reason}`);
          return;
        }
      }

      // Store fingerprint on new Google users
      if (fingerprint) {
        await prisma.user.update({
          where: { id: user.id },
          data: { fingerprint },
        }).catch(() => {});
      }

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
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastActiveAt: new Date() },
      }).catch(() => {});

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
