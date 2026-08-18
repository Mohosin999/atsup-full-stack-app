import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { getMetrics, getGrowth } from "./admin-dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/metrics", getMetrics);
router.get("/growth", getGrowth);

export default router;
