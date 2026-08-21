import { env } from '../config/env';
export const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';
    console.error(`[Error] ${err.message}`, {
        statusCode,
        path: req.path,
        method: req.method,
        stack: err.stack,
    });
    res.status(statusCode).json({
        success: false,
        message,
        ...(env.nodeEnv === 'development' && { stack: err.stack }),
    });
};
export const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
export const notFound = (req, _res, next) => {
    const error = createError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
