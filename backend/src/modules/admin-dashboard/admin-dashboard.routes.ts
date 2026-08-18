import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
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
router.get("/users", getUsers);
router.patch("/users/:id/ban", toggleBan);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/support", getSupportTickets);
router.patch("/support/:id", updateSupportTicket);
router.delete("/support/:id", deleteSupportTicket);

export default router;
