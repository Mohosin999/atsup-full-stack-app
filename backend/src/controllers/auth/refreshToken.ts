import { Response } from 'express';
import { AuthRequest } from '../../types';
import {
  verifyRefreshTokenAndGetUserId,
  generateNewAccessToken,
} from '../../services/auth';
import { findUserById } from '../../services/auth';
import { env } from '../../config/env';

export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshTokenValue) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided',
      });
    }

    const decoded = verifyRefreshTokenAndGetUserId(refreshTokenValue);

    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const newAccessToken = generateNewAccessToken(
      user.id,
      user.email,
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Token refreshed',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};
