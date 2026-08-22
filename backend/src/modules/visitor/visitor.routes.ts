import { Router } from "express";
import { track, getCount } from "./visitor.controller";

const router = Router();

router.post("/track", track);
router.get("/count", getCount);

export default router;
