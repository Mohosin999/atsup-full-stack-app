import { Response } from "express";
import fs from "fs";
import { AuthRequest } from "../../shared/types";
import { prisma } from "../../lib/prisma";
import { runUnlimitedAtsCheck } from "./unlimitedAts.service";
import { rescanAtsScoreHistory } from "../ats-score-check/services/history.service";

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

    const resumeName = (
      req.body.resumeName ||
      req.file.originalname ||
      "Untitled Resume"
    ).trim();

    const score = result.score;

    const saved = await prisma.atsScoreHistory.create({
      data: {
        userId: req.user.id,
        title: resumeName,
        resumeName,
        overallScore: score.overallScore,
        sectionScores: {
          ...score.sectionScores,
          ...(score.matchBreakdown
            ? { matchBreakdown: score.matchBreakdown }
            : {}),
          categories: score.categories,
        } as any,
        atsFriendliness: score.atsFriendliness,
        suggestions: score.suggestions,
        resumeContent: result.resumeContent as any,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ...result,
        history: saved,
      },
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

export const rescanUnlimitedAts = async (req: AuthRequest, res: Response) => {
  let filePath: string | undefined;
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "History ID is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF file is required",
      });
    }

    filePath = req.file.path;

    const jobDescription = (
      req.body.jobDescription ||
      req.body.description ||
      ""
    ).trim();

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

    const resumeName = (
      req.body.resumeName ||
      req.file.originalname ||
      "Untitled Resume"
    ).trim();

    const score = result.score;

    const updated = await rescanAtsScoreHistory(
      req.user.id,
      id,
      resumeName,
      result.resumeContent as any,
      {
        ...score.sectionScores,
        ...(score.matchBreakdown ? { matchBreakdown: score.matchBreakdown } : {}),
        categories: score.categories,
      },
      score.overallScore,
      score.atsFriendliness,
      score.suggestions,
      score.matchBreakdown,
    );

    res.status(200).json({
      success: true,
      data: {
        ...result,
        history: updated,
      },
    });
  } catch (error: any) {
    console.error("Unlimited ATS rescan error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to rescan resume",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};