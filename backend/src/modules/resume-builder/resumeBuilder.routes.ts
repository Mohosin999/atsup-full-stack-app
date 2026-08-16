import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import {
  getAllResumes,
  uploadResume,
  createResumeFromContent,
  deleteAllResumes,
  getSingleResume,
  updateResume,
  deleteResume,
  duplicateResume,
} from "./resumeBuilder.controller";

const router = Router();

router.post("/content", authenticate, createResumeFromContent);

router.delete("/delete-all", authenticate, deleteAllResumes);

router.post("/:id/duplicate", authenticate, duplicateResume);

router.get("/:id", authenticate, getSingleResume);

router.put("/:id", authenticate, updateResume);

router.delete("/:id", authenticate, deleteResume);

router.get("/", authenticate, getAllResumes);

router.post("/", authenticate, uploadResume);

export default router;
