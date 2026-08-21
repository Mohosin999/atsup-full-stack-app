import { generateAccessToken, generateRefreshToken, verifyRefreshToken, } from '../config/jwt';
export const createTokens = (userId, email) => {
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
export const verifyRefreshTokenAndGetUserId = (refreshToken) => {
    return verifyRefreshToken(refreshToken);
};
export const generateNewAccessToken = (userId, email) => {
    return generateAccessToken({ userId, email });
};
