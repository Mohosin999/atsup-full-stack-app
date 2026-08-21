import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env';
const isVercel = process.env.VERCEL === '1';
let uploadsDir;
if (isVercel) {
    uploadsDir = '/tmp/uploads';
}
else {
    uploadsDir = path.join(__dirname, '..', '..', 'uploads');
}
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
export const getUploadsDir = () => uploadsDir;
/** ================================================
 * Configure Multer to handle file uploads
 =================================================*/
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
/** ================================================
 * Multer file filter
 =================================================*/
const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
/** ================================================
 * Multer middleware
 =================================================*/
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.maxFileSize,
    },
});
/** ================================================
 * Multer error handler
 =================================================*/
export const uploadErrorHandler = (err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size is ${env.maxFileSize / (1024 * 1024)}MB.`,
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
    next();
};
