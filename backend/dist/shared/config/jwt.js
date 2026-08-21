import jwt from "jsonwebtoken";
import { env } from "./env";
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, env.jwtSecret, {
        expiresIn: "1d",
    });
};
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.jwtRefreshSecret, {
        expiresIn: "7d",
    });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, env.jwtSecret);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.jwtRefreshSecret);
};
