import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import { generalLimiter } from "../../shared/middlewares/middlewareConfig";
import { getProfile, updateProfile, deleteAccount, } from "./users.controller";
const router = Router();
router.get("/profile", authenticate, generalLimiter, getProfile);
router.put("/profile", authenticate, generalLimiter, updateProfile);
router.delete("/account", authenticate, generalLimiter, deleteAccount);
export default router;
