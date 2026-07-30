import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { deleteAllResumesByUser } from "../../services/resumes";

export const deleteAllResumes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteAllResumesByUser(req.user.id);

    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} resumes successfully`,
    });
  } catch (error) {
    console.error("Error deleting all resumes:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting all resumes",
    });
  }
};
