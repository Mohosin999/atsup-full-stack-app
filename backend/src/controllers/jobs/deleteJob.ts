import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { deleteJobById } from "../../services/jobs";

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await deleteJobById(req.params.id, req.user.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    res.json({
      success: true,
      message: "Job description deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting job description",
    });
  }
};
