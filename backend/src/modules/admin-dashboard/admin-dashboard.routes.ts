import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import {
  getMetrics,
  getGrowth,
  getUsers,
  toggleBan,
  updateUser,
  deleteUser,
} from "./admin-dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/metrics", getMetrics);
router.get("/growth", getGrowth);
router.get("/users", getUsers);
router.patch("/users/:id/ban", toggleBan);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
