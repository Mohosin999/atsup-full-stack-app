import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";


import { upload } from "../../shared/config/multer";
import {
  parseResume,
  parseJobDescription,
  analyzeAtsScore,
  rescanAtsScore,
  getAtsScores,
  getAtsScore,
  deleteAtsScoreController,
  deleteAllAtsScoresController,
  renameAtsScoreController,
} from "./atsScoreCheck.controller";

const router = Router();

router.use(authenticate);

router.post("/parse-resume", upload.single("resume"), parseResume);
router.post("/parse-jd", parseJobDescription);
router.post("/analyze", analyzeAtsScore);
router.post("/rescan/:id", rescanAtsScore);
router.get("/history", getAtsScores); // TODO: start revision from here
router.get("/history/:id", getAtsScore);
router.delete("/history/:id", deleteAtsScoreController);
router.put("/history/:id/rename", renameAtsScoreController);
router.delete("/history", deleteAllAtsScoresController);

export default router;
