import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";

import { atsLimiter } from "../../shared/middlewares/middlewareConfig";
import { upload } from "../../shared/config/multer";
import {
  analyzeUnlimitedAts,
  rescanUnlimitedAts,
} from "./unlimitedAts.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/analyze",
  atsLimiter,
  upload.single("resume"),
  analyzeUnlimitedAts,
);

router.post(
  "/rescan/:id",
  atsLimiter,
  upload.single("resume"),
  rescanUnlimitedAts,
);

export default router;