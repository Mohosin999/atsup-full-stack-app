import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import { createFeedback } from "./feedback.service";
import { prisma } from "../../lib/prisma";
import { getCache, setCache, delCache } from "../../lib/redis";

export const HOME_REVIEWS_CACHE_KEY = "feedback:home";
const HOME_REVIEWS_TTL_SEC = 3600; // 1 hour

export const invalidateHomeReviewsCache = () =>
  delCache(HOME_REVIEWS_CACHE_KEY);

interface HomeReview {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

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
    await invalidateHomeReviewsCache();

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
    const cached = await getCache<HomeReview[]>(HOME_REVIEWS_CACHE_KEY);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const reviews = await prisma.feedback.findMany({
      where: { showOnHome: true },
      include: {
        user: { select: { id: true, name: true, picture: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped: HomeReview[] = reviews.map((r) => ({
      id: r.id,
      name: r.user.name || "Anonymous",
      role: "",
      content: r.message,
      rating: r.rating,
    }));

    await setCache(HOME_REVIEWS_CACHE_KEY, mapped, HOME_REVIEWS_TTL_SEC);

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error("Error fetching home reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching home reviews",
    });
  }
};
