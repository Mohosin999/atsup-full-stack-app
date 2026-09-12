import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  geminiApiKey: string;
  frontendUrl: string;
  maxFileSize: number;
  promptVersion: string;
  aiCacheTtl: number;
}

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const env: EnvConfig = {
  port: getEnvNumber('PORT', 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || '',
  maxFileSize: getEnvNumber('MAX_FILE_SIZE', 5 * 1024 * 1024),
  promptVersion: process.env.PROMPT_VERSION || 'v1',
  aiCacheTtl: getEnvNumber('AI_CACHE_TTL', 7 * 24 * 60 * 60),
};
