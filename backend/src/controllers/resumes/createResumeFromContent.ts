import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { createResumeFromContent as createResumeFromContentService } from "../../services/resumes";

export const createResumeFromContent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const result = await createResumeFromContentService(
      req.user.id,
      content
    );

    res.status(201).json({
      success: true,
      data: result.resume,
      remainingCredits: result.remainingCredits,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating resume",
    });
  }
};
