import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { updateResumeById } from "../../services/resumes";

export const updateResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await updateResumeById(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating resume",
    });
  }
};
