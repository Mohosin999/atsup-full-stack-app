import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../shared/config/jwt';

export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);

  const userCount = await prisma.user.count();

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userCount === 0 ? "admin" : "user",
      preferences: {
        theme: 'system',
        notifications: true,
      },
      subscription: {
        plan: 'free',
        credits: 3,
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

export const findUserByEmail = async (email: string) => {
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

export const findUserById = async (userId: string) => {
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

export const validatePassword = async (
  plainPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

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
