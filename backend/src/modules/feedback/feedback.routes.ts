import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";

import { submitFeedback, getHomeReviews } from "./feedback.controller";

const router = Router();

router.post("/", authenticate, submitFeedback);
router.get("/home", getHomeReviews);

export default router;
