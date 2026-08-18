import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { aiLimiter, generalLimiter } from "../../shared/middlewares/middlewareConfig";
import { upload } from "../../shared/config/multer";
import {
  parseResume,
  parseJobDescription,
  analyzeAtsScore,
  getAtsScores,
  getAtsScore,
  deleteAtsScoreController,
  deleteAllAtsScoresController,
} from "./atsScoreCheck.controller";

const router = Router();

router.use(authenticate);

router.post("/parse-resume", aiLimiter, upload.single("resume"), parseResume);
router.post("/parse-jd", aiLimiter, parseJobDescription);
router.post("/analyze", aiLimiter, analyzeAtsScore);
router.get("/history", generalLimiter, getAtsScores); // TODO: start revision from here
router.get("/history/:id", generalLimiter, getAtsScore);
router.delete("/history/:id", generalLimiter, deleteAtsScoreController);
router.delete("/history", generalLimiter, deleteAllAtsScoresController);

export default router;
