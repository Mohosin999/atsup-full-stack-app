import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { getJobById } from "../../services/jobs";

export const getSingleJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await getJobById(req.params.id, req.user.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job description",
    });
  }
};
