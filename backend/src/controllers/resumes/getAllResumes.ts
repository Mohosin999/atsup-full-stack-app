import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { getAllResumesByUser } from "../../services/resumes";

export const getAllResumes = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sourceType = req.query.sourceType as 'uploaded' | 'builder' | undefined;

    const result = await getAllResumesByUser(req.user.id, {
      page,
      limit,
      sourceType,
    });

    res.json({
      success: true,
      data: result.resumes,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching resumes",
    });
  }
};
