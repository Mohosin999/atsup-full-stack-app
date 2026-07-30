import { Response } from 'express';
import { AuthRequest } from '../../types';
import { createUser, findUserByEmail } from '../../services/auth';
import { createTokens } from '../../services/auth';
import { env } from '../../config/env';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await createUser({ name, email, password });

    const { accessToken, refreshToken } = createTokens(
      user.id,
      user.email,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
    });
  }
};
