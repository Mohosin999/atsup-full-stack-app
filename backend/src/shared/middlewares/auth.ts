import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../types";
import { applyDailyCreditReset } from "../utils/credits";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  googleId?: string;
  picture?: string;
  preferences?: any;
  subscription?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token = req.cookies.accessToken;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    const subscription = await applyDailyCreditReset(user.id, user.subscription);

    const userRecord: UserRecord = {
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId || undefined,
      picture: user.picture || undefined,
      preferences: user.preferences,
      subscription: user.subscription,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    req.user = userRecord as any;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
    });
  }
};
