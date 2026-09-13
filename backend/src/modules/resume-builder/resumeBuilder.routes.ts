import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { resumeLimiter } from "../../shared/middlewares/middlewareConfig";
import {
  getAllResumes,
  uploadResume,
  createResumeFromContent,
  deleteAllResumes,
  getSingleResume,
  updateResume,
  deleteResume,
  duplicateResume,
  rewriteResumeWithAI,
  parseResumePdf,
} from "./resumeBuilder.controller";

const router = Router();

router.post("/content", authenticate, resumeLimiter, createResumeFromContent);

router.delete("/delete-all", authenticate, deleteAllResumes);

router.post("/parse", authenticate, resumeLimiter, ...parseResumePdf);

router.post("/:id/duplicate", authenticate, duplicateResume);

router.get("/:id", authenticate, getSingleResume);

router.put("/:id", authenticate, updateResume);

router.delete("/:id", authenticate, deleteResume);

router.get("/", authenticate, getAllResumes);

router.post("/", authenticate, resumeLimiter, uploadResume);

router.post("/ai-rewrite", authenticate, resumeLimiter, rewriteResumeWithAI);

export default router;
