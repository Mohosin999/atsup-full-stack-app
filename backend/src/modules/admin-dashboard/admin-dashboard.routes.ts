import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";

import {
  getMetrics,
  getGrowth,
  getUsers,
  toggleBan,
  updateUser,
  deleteUser,
  deleteInactiveUsers,
  getSupportTickets,
  updateSupportTicket,
  deleteSupportTicket,
  getAllResumes,
  deleteResume,
  deleteAllResumes,
  getAllAtsScores,
  deleteAtsScore,
  deleteAllAtsScores,
  getReviews,
  deleteReview,
  deleteAllReviews,
  toggleReviewHome,
  markSupportSeen,
  markReviewsSeen,
  getUnreadCounts,
} from "./admin-dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/metrics", getMetrics);
router.get("/growth", getGrowth);
router.get("/users", getUsers);
router.delete("/users/inactive", deleteInactiveUsers);
router.patch("/users/:id/ban", toggleBan);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/support", getSupportTickets);
router.patch("/support/:id", updateSupportTicket);
router.delete("/support/:id", deleteSupportTicket);

router.get("/resumes", getAllResumes);
router.delete("/resumes/:id", deleteResume);
router.delete("/resumes", deleteAllResumes);

router.get("/ats-scores", getAllAtsScores);
router.delete("/ats-scores/:id", deleteAtsScore);
router.delete("/ats-scores", deleteAllAtsScores);

router.get("/reviews", getReviews);
router.delete("/reviews/:id", deleteReview);
router.delete("/reviews", deleteAllReviews);
router.patch("/reviews/:id/toggle-home", toggleReviewHome);

router.get("/unread-counts", getUnreadCounts);
router.patch("/last-seen/support", markSupportSeen);
router.patch("/last-seen/reviews", markReviewsSeen);

export default router;
