import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import {
  deleteAllAnalyses,
  deleteAnalysis,
  generateAnalysis,
  getAllAnalysis,
  getSingleAnalysis,
} from "./analysis.controller";

const router = Router();

router.delete("/delete-all", authenticate, deleteAllAnalyses);

router.get("/:id", authenticate, getSingleAnalysis);

router.delete("/:id", authenticate, deleteAnalysis);

router.post("/", authenticate, generateAnalysis);

router.get("/", authenticate, getAllAnalysis);

export default router;
