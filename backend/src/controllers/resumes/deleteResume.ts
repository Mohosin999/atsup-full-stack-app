import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { deleteResumeById } from "../../services/resumes";

export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await deleteResumeById(
      req.params.id,
      req.user.id
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting resume",
    });
  }
};
