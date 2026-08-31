import { Router } from "express";
import { authenticate } from "../../shared/middlewares/auth";

import {
  getProfile,
  updateProfile,
  deleteAccount,
} from "./users.controller";

const router = Router();

router.get("/profile", authenticate, getProfile);

router.put("/profile", authenticate, updateProfile);

router.delete("/account", authenticate, deleteAccount);

export default router;
