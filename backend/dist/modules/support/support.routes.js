import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../../shared/middlewares/auth";
import { generalLimiter } from "../../shared/middlewares/middlewareConfig";
import { getUploadsDir } from "../../shared/config/multer";
import { env } from "../../shared/config/env";
import { createTicket, getMyTicketsController } from "./support.controller";
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, getUploadsDir()),
    filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const uploadScreenshot = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
            "application/pdf",
        ];
        cb(null, allowed.includes(file.mimetype));
    },
    limits: { fileSize: env.maxFileSize },
});
const router = Router();
router.use(authenticate);
router.post("/", generalLimiter, uploadScreenshot.single("attachment"), createTicket);
router.get("/mine", generalLimiter, getMyTicketsController);
export default router;
