import jwt from "jsonwebtoken";
import { env } from "./env";
import { JWTPayload } from "../types";

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d",
  });
};


export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: "7d",
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.jwtSecret) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as JWTPayload;
};
