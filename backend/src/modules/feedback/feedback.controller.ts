import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import { createFeedback } from "./feedback.service";

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
