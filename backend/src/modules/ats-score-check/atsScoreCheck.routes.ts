import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { generalLimiter } from "../../shared/middlewares/middlewareConfig";
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

router.post("/parse-resume", generalLimiter, upload.single("resume"), parseResume);
router.post("/parse-jd", generalLimiter, parseJobDescription);
router.post("/analyze", generalLimiter, analyzeAtsScore);
router.get("/history", getAtsScores); // TODO: start revision from here
router.get("/history/:id", generalLimiter, getAtsScore);
router.delete("/history/:id", generalLimiter, deleteAtsScoreController);
router.put("/history/:id/rename", generalLimiter, renameAtsScoreController);
router.delete("/history", generalLimiter, deleteAllAtsScoresController);

export default router;
