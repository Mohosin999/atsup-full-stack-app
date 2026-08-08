import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";
import {
  getProfile,
  updateProfile,
  deleteAccount,
  useCredit,
} from "./users.controller";

const router = Router();

router.get("/profile", authenticate, getProfile);

router.put("/profile", authenticate, updateProfile);

router.delete("/account", authenticate, deleteAccount);

router.post("/use-credit", authenticate, useCredit);

export default router;
