import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { getAllJobsByUser } from "../../services/jobs";

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllJobsByUser(req.user.id, {
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.jobs,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job descriptions",
    });
  }
};
