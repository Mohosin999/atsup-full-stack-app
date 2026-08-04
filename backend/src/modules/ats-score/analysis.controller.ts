import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import { prisma } from "../../lib/prisma";
import { runResumeAnalysis } from "./atsScore.service";

export const generateAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    const { analysis, credits } = await runResumeAnalysis({
      resumeId,
      jobDescription,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: analysis,
      credits,
      message:
        "✅ Credit deducted successfully! Task: Resume Analysis, Credits deducted: 1",
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Error analyzing resume",
    });
  }
};

export const getAllAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;
    const skip = (page - 1) * limit;

    const analyses = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        resume: {
          select: {
            metadata: true,
            content: true,
          },
        },
      },
    });

    const total = await prisma.analysis.count({
      where: { userId: req.user.id },
    });

    return res.json({
      success: true,
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching analyses",
    });
  }
};

export const getSingleAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { resume: true },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching analysis",
    });
  }
};

export const deleteAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    await prisma.analysis.delete({
      where: { id: req.params.id },
    });

    return res.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting analysis",
    });
  }
};

export const deleteAllAnalyses = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.analysis.deleteMany({
      where: { userId: req.user.id },
    });

    return res.json({
      success: true,
      message: "All analyses deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting all analyses",
    });
  }
};
