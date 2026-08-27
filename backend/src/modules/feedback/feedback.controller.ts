import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import { createFeedback } from "./feedback.service";
import { prisma } from "../../lib/prisma";

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, message } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const feedback = await createFeedback(req.user.id, rating, message.trim());

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
    });
  }
};

export const getHomeReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.feedback.findMany({
      where: { showOnHome: true },
      include: {
        user: { select: { id: true, name: true, picture: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = reviews.map((r) => ({
      id: r.id,
      name: r.user.name || "Anonymous",
      role: "",
      content: r.message,
      rating: r.rating,
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error("Error fetching home reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching home reviews",
    });
  }
};
