import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../config/jwt';

export const createTokens = (userId: string, email: string) => {
  const accessToken = generateAccessToken({
    userId,
    email,
  });

  const refreshToken = generateRefreshToken({
    userId,
    email,
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshTokenAndGetUserId = (refreshToken: string) => {
  return verifyRefreshToken(refreshToken);
};

export const generateNewAccessToken = (userId: string, email: string) => {
  return generateAccessToken({ userId, email });
};
