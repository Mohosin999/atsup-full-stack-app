import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { generalLimiter } from "../../shared/middlewares/middlewareConfig";
import { upload } from "../../shared/config/multer";
import {
  analyzeUnlimitedAts,
  rescanUnlimitedAts,
} from "./unlimitedAts.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/analyze",
  generalLimiter,
  upload.single("resume"),
  analyzeUnlimitedAts,
);

router.post(
  "/rescan/:id",
  generalLimiter,
  upload.single("resume"),
  rescanUnlimitedAts,
);

export default router;