import { Response } from "express";
import fs from "fs";
import { AuthRequest } from "../../shared/types";
import { runUnlimitedAtsCheck } from "./unlimitedAts.service";

export const analyzeUnlimitedAts = async (
  req: AuthRequest,
  res: Response,
) => {
  let filePath: string | undefined;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF file is required",
      });
    }

    filePath = req.file.path;

    const jobDescription = (req.body.jobDescription || req.body.description || "").trim();

    if (!jobDescription || jobDescription.length < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is too short. Please provide a detailed job description.",
      });
    }

    const result = await runUnlimitedAtsCheck(
      filePath,
      req.file.mimetype,
      jobDescription,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Unlimited ATS check error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze resume",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};