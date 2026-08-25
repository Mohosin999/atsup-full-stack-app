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

export default router;
