import { Request, Response } from "express";
import Stripe from "stripe";
import { createCheckoutSession, handleWebhookEvent } from "./payment.service";
import { prisma } from "../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20" as any,
});

const PRO_PLAN_CREDITS = 500;
const ENTERPRISE_PLAN_CREDITS = 1500;

export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { planId } = req.body;

    if (!planId || !["pro", "enterprise"].includes(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const userId = (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const successUrl = `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/payment/cancel`;

    const { url } = await createCheckoutSession({
      userId,
      planId,
      successUrl,
      cancelUrl,
    });

    if (!url) {
      return res
        .status(500)
        .json({ message: "Failed to create checkout session" });
    }

    res.json({ url });
  } catch (error: any) {
    console.error("Checkout session error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create checkout session" });
  }
};

export const stripeWebhookController = async (req: any, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({ message: "Missing signature" });
    }

    const result = await handleWebhookEvent(signature, req.body as Buffer);
    res.json(result);
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: error.message || "Webhook error" });
  }
};

export const verifyPaymentController = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      console.error("No session_id provided");
      return res.status(400).json({ message: "Session ID required" });
    }

    const session = await stripe.checkout.sessions.retrieve(
      session_id as string,
    );

    if (!session || !session.metadata) {
      console.error("Session not found or no metadata");
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.payment_status !== "paid") {
      console.error("Payment not completed. Status:", session.payment_status);
      return res.status(400).json({ message: "Payment not completed" });
    }

    const { userId, planId, email, credits } = session.metadata || {};

    if (!userId || !planId) {
      console.error("Invalid metadata:", { userId, planId });
      return res.status(400).json({ message: "Invalid session metadata" });
    }

    const planKey = planId.toLowerCase();
    const creditsNum =
      planKey === "enterprise"
        ? ENTERPRISE_PLAN_CREDITS
        : planKey === "pro"
          ? PRO_PLAN_CREDITS
          : 100;

    const existingPayment = await prisma.payment.findFirst({
      where: { stripeSessionId: session_id as string },
    });
    if (existingPayment) {
      return res.json({
        success: true,
        alreadyProcessed: true,
        credits: creditsNum,
        plan: planId,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: true,
        email: true,
      },
    });
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const amount = session.amount_total ? session.amount_total / 100 : 0;

    const oldCredits = (user.subscription as any)?.credits ?? 0;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          ...((user.subscription as any) || {}),
          plan: planKey as "free" | "pro" | "enterprise",
          credits: oldCredits + creditsNum,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        subscription: true,
      },
    });

    const newCredits = (updated.subscription as any)?.credits ?? 0;

    await prisma.payment.create({
      data: {
        user: { connect: { id: userId } },
        email: email || user.email,
        amount,
        currency: session.currency || "usd",
        status: "completed",
        paymentMethod: "stripe",
        planId,
        credits: creditsNum,
        stripeSessionId: session_id as string,
      },
    });

    res.json({ success: true, credits: creditsNum, plan: planId });
  } catch (error: any) {
    console.error("❌ Payment verification error:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ message: error.message || "Payment verification failed" });
  }
};
