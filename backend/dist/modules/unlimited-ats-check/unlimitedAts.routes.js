import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { aiLimiter } from "../../shared/middlewares/middlewareConfig";
import { upload } from "../../shared/config/multer";
import { analyzeUnlimitedAts } from "./unlimitedAts.controller";
const router = Router();
router.use(authenticate);
router.post("/analyze", aiLimiter, upload.single("resume"), analyzeUnlimitedAts);
export default router;
