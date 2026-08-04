import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import {
  getAllJobs,
  createJob,
  getSingleJob,
  updateJob,
  deleteJob,
  fetchFromUrl,
  parseJobDescription,
} from "./jobMatch.controller";

const router = Router();

router.post("/parse", authenticate, parseJobDescription);

router.post("/fetch-from-url", authenticate, fetchFromUrl);

router.get("/:id", authenticate, getSingleJob);

router.put("/:id", authenticate, updateJob);

router.delete("/:id", authenticate, deleteJob);

router.get("/", authenticate, getAllJobs);

router.post("/", authenticate, createJob);

export default router;
