import { verifyAccessToken } from "../config/jwt";
import { prisma } from "../../lib/prisma";
import { applyDailyCreditReset } from "../utils/credits";
export const authenticate = async (req, res, next) => {
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
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned",
            });
        }
        const subscription = await applyDailyCreditReset(user.id, user.subscription);
        const userRecord = {
            id: user.id,
            email: user.email,
            name: user.name,
            googleId: user.googleId || undefined,
            picture: user.picture || undefined,
            preferences: user.preferences,
            subscription: user.subscription,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: user.role,
        };
        req.user = userRecord;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid token",
        });
    }
};
