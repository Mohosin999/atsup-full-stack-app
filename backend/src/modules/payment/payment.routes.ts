import express from "express";
import {
  createCheckoutSessionController,
  stripeWebhookController,
  verifyPaymentController,
} from "./payment.controller";
import { authenticate } from "../../shared/middlewares/auth";

const router = express.Router();

// Webhook route must use raw body parser - defined first
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhookController);

// Other routes use JSON parser (inherited from app)
router.post("/create-checkout-session", authenticate, createCheckoutSessionController);
router.get("/verify", verifyPaymentController);

export default router;
