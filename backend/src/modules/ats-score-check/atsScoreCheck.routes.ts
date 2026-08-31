import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";

import { atsLimiter } from "../../shared/middlewares/middlewareConfig";
import { upload } from "../../shared/config/multer";
import {
  parseResume,
  parseJobDescription,
  analyzeAtsScore,
  getAtsScores,
  getAtsScore,
  deleteAtsScoreController,
  deleteAllAtsScoresController,
  renameAtsScoreController,
} from "./atsScoreCheck.controller";

const router = Router();

router.use(authenticate);

router.post("/parse-resume", atsLimiter, upload.single("resume"), parseResume);
router.post("/parse-jd", atsLimiter, parseJobDescription);
router.post("/analyze", atsLimiter, analyzeAtsScore);
router.get("/history", getAtsScores); // TODO: start revision from here
router.get("/history/:id", getAtsScore);
router.delete("/history/:id", deleteAtsScoreController);
router.put("/history/:id/rename", renameAtsScoreController);
router.delete("/history", deleteAllAtsScoresController);

export default router;
