import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { generalLimiter } from "../../shared/middlewares/middlewareConfig";
import {
  getMetrics,
  getGrowth,
  getUsers,
  toggleBan,
  updateUser,
  deleteUser,
  getSupportTickets,
  updateSupportTicket,
  deleteSupportTicket,
  getAllResumes,
  deleteResume,
  deleteAllResumes,
  getAllAtsScores,
  deleteAtsScore,
  deleteAllAtsScores,
} from "./admin-dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/metrics", getMetrics);
router.get("/growth", getGrowth);
router.get("/users", generalLimiter, getUsers);
router.patch("/users/:id/ban", generalLimiter, toggleBan);
router.patch("/users/:id", generalLimiter, updateUser);
router.delete("/users/:id", generalLimiter, deleteUser);
router.get("/support", getSupportTickets);
router.patch("/support/:id", generalLimiter, updateSupportTicket);
router.delete("/support/:id", generalLimiter, deleteSupportTicket);

router.get("/resumes", getAllResumes);
router.delete("/resumes/:id", generalLimiter, deleteResume);
router.delete("/resumes", generalLimiter, deleteAllResumes);

router.get("/ats-scores", getAllAtsScores);
router.delete("/ats-scores/:id", generalLimiter, deleteAtsScore);
router.delete("/ats-scores", generalLimiter, deleteAllAtsScores);

export default router;
