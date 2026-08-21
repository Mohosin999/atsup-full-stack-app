import { createUser, findUserByEmail, findUserById, validatePassword, createTokens, verifyRefreshTokenAndGetUserId, generateNewAccessToken, } from "./auth.service";
import { env } from "../../shared/config/env";
import { applyDailyCreditReset } from "../../shared/utils/credits";
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        sameSite: env.nodeEnv === "production" ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }
        const user = await createUser({ name, email, password });
        const { accessToken, refreshToken } = createTokens(user.id, user.email);
        setAuthCookies(res, accessToken, refreshToken);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    preferences: user.preferences,
                    subscription: user.subscription,
                },
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "Please login with Google",
            });
        }
        const isMatch = await validatePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. Contact support.",
            });
        }
        const subscription = await applyDailyCreditReset(user.id, user.subscription);
        const { accessToken, refreshToken } = createTokens(user.id, user.email);
        setAuthCookies(res, accessToken, refreshToken);
        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    preferences: user.preferences,
                    subscription,
                },
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Error logging in",
        });
    }
};
export const getMe = async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
        });
    }
};
export const refreshToken = async (req, res) => {
    try {
        const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshTokenValue) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not provided",
            });
        }
        const decoded = verifyRefreshTokenAndGetUserId(refreshTokenValue);
        const user = await findUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        const newAccessToken = generateNewAccessToken(user.id, user.email);
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: env.nodeEnv === "production",
            sameSite: env.nodeEnv === "production" ? "none" : "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            message: "Token refreshed",
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid refresh token",
        });
    }
};
export const logout = async (_req, res) => {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.json({
        success: true,
        message: "Logged out successfully",
    });
};
