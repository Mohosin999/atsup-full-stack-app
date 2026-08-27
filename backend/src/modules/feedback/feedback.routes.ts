import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { generalLimiter } from "../../shared/middlewares/middlewareConfig";
import { submitFeedback, getHomeReviews } from "./feedback.controller";

const router = Router();

router.post("/", authenticate, generalLimiter, submitFeedback);
router.get("/home", getHomeReviews);

export default router;
