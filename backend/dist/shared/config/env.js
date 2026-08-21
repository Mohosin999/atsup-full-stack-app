import dotenv from 'dotenv';
dotenv.config();
const getEnvNumber = (key, defaultValue) => {
    const value = process.env[key];
    if (!value)
        return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
};
export const env = {
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
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 10 * 1024 * 1024),
};
