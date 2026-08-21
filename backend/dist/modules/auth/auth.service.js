import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, } from '../../shared/config/jwt';
export const createUser = async (userData) => {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            preferences: {
                theme: 'system',
                notifications: true,
            },
            subscription: {
                plan: 'free',
                credits: 5,
            },
        },
        select: {
            id: true,
            email: true,
            name: true,
            googleId: true,
            picture: true,
            preferences: true,
            role: true,
            subscription: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
};
export const findUserByEmail = async (email) => {
    return prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
            googleId: true,
            picture: true,
            preferences: true,
            role: true,
            isBanned: true,
            subscription: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
export const findUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            googleId: true,
            picture: true,
            preferences: true,
            role: true,
            subscription: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
export const validatePassword = async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};
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
