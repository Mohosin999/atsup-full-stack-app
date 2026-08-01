import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { parseJobDescriptionToStructured } from "../../services/jdParser";

export const parseJobDescription = async (req: AuthRequest, res: Response) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is too short. Please provide a detailed job description.",
      });
    }

    const structured = parseJobDescriptionToStructured(description);

    res.status(200).json({
      success: true,
      data: structured,
    });
  } catch (error: any) {
    console.error("Job description parse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to parse job description",
    });
  }
};
