import { Response } from "express";
import { AuthRequest, ResumeContent } from "../../shared/types";
import { prisma } from "../../lib/prisma";
import { parseResume as parseResumeService } from "./services/resumeParser.service";
import {
  parseJobDescription as parseJDService,
  mapAIToStructuredJD,
} from "./services/jobDescription.service";
import {
  createAtsScoreHistory,
  getAtsScoreHistory,
  getAtsScoreHistoryById,
  deleteAtsScoreHistory,
  deleteAllAtsScoreHistory,
} from "./services/history.service";

const parseAddress = (raw: string): { city?: string; state?: string } | undefined => {
  if (!raw) return undefined;
  const parts = raw.split(/[,•\-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  if (parts.length === 1) return { city: parts[0] };
  return { city: parts[0], state: parts[1] };
};

const mapAIResearchToResumeContent = (ai: any): ResumeContent | null => {
  if (!ai) return null;

  return {
    personalInfo: {
      fullName: ai.personal_info?.fullName || "",
      jobTitle: ai.personal_info?.jobTitle || "",
      contact: {
        email: ai.personal_info?.contact?.email || "",
        phone: ai.personal_info?.contact?.phone || "",
        address: parseAddress(ai.personal_info?.contact?.address || ""),
      },
    },
    summary: ai.summary || "",
    experience: (ai.experience || []).map((exp: any) => ({
      role: exp.role || "",
      company: exp.company || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      responsibilities: exp.responsibilities || [],
    })),
    education: (ai.education || [])
      .map((edu: any) => ({
        degree: edu.degree || "",
        field: edu.field || "",
        education_level: edu.education_level || "",
      }))
      .filter((e: any) => e.degree || e.field || e.education_level),
    skills: {
      hardSkills: ai.skills?.hardSkills || [],
      softSkills: ai.skills?.softSkills || [],
    },
    projects: (ai.projects || []).map((proj: any) => ({
      name: proj.name || "",
      description: proj.description || [],
    })),
    yearsOfExperience: ai.yearsOfExperience || 0,
    resumeTone: ai.resumeTone || "bad",
    wordCount: ai.wordCount || 0,
    educationSection: ai.educationSection || false,
    experienceSection: ai.experienceSection || false,
    workHistory: ai.workHistory || false,
    dateFormatting: ai.dateFormatting || false,
    layout: {
      isSingleColumn: ai.layout?.isSingleColumn || false,
      hasTables: ai.layout?.hasTables || false,
      hasImages: ai.layout?.hasImages || false,
      hasIcons: ai.layout?.hasIcons || false,
      hasMultiColumn: ai.layout?.hasMultiColumn || false,
    },
    fontCheck: {
      isStandardFont: ai.fontCheck?.isStandardFont || false,
      fontName: ai.fontCheck?.fontName || "",
      isReadableSize: ai.fontCheck?.isReadableSize || false,
    },
  } as ResumeContent;
};

// ─── Resume Parse ────────────────────────────────────────────────────────────

export const parseResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    try {
      const result = await parseResumeService(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (parseError: any) {
      if (req.file && require("fs").existsSync(req.file.path)) {
        require("fs").unlinkSync(req.file.path);
      }
      throw parseError;
    }
  } catch (error: any) {
    console.error("Resume parse error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to parse resume",
    });
  }
};

// ─── Job Description Parse ───────────────────────────────────────────────────

export const parseJobDescription = async (req: AuthRequest, res: Response) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is too short. Please provide a detailed job description.",
      });
    }

    const aiResult = await parseJDService(description);

    res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error: any) {
    console.error("Job description parse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to parse job description",
    });
  }
};

// ─── Analyze ─────────────────────────────────────────────────────────────────

export const analyzeAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeName, jobDescription, structuredJD, aiResearch } = req.body;

    if (!aiResearch) {
      return res.status(400).json({
        success: false,
        message: "Resume research data is required",
      });
    }

    const resumeContent = mapAIResearchToResumeContent(aiResearch) || {
      personalInfo: { fullName: "", jobTitle: "", contact: {} },
      summary: "",
      experience: [],
      education: [],
      skills: { hardSkills: [], softSkills: [] },
      projects: [],
    };

    const finalStructuredJD = structuredJD?.skills
      ? mapAIToStructuredJD(structuredJD)
      : structuredJD;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true },
    });

    const subscription = (user?.subscription as any) || {};
    const today = new Date().toISOString().slice(0, 10);
    const lastReset = subscription?.lastAiScanResetDate ?? "";
    const credits = subscription?.credits ?? 0;

    // Daily credit: every account has exactly 1 credit per day (GMT midnight).
    const effectiveCredits = lastReset !== today ? 1 : credits;

    if (effectiveCredits < 1) {
      return res.status(403).json({
        success: false,
        message:
          "No AI scan credit available. A new credit will be granted at midnight (GMT).",
        code: "AI_SCAN_UNAVAILABLE",
      });
    }

    const score = await createAtsScoreHistory(
      req.user.id,
      resumeName || "Untitled Resume",
      resumeContent,
      finalStructuredJD || null,
      aiResearch || null,
    );

    const remainingCredits = effectiveCredits - 1;
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscription: {
          ...subscription,
          credits: remainingCredits,
          lastAiScanResetDate: today,
        },
      },
      select: { subscription: true },
    });

    res.status(201).json({
      success: true,
      data: score,
      credits: remainingCredits,
      aiScan: {
        available: false,
        credits: remainingCredits,
        lastAiScanResetDate: today,
      },
      message: "AI scan used. A new credit will be available at midnight (GMT).",
    });
  } catch (error: any) {
    console.error("ATS Score analysis error:", error);
    const status = error.message.includes("Insufficient credits") ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message || "Failed to analyze ATS score",
    });
  }
};

// ─── History CRUD ────────────────────────────────────────────────────────────

export const getAtsScores = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;

    const result = await getAtsScoreHistory(req.user.id, page, limit);

    res.json({
      success: true,
      data: result.scores,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Get ATS scores error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get ATS scores",
    });
  }
};

export const getAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const score = await getAtsScoreHistoryById(req.user.id, id);

    res.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    console.error("Get ATS score error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "ATS Score not found",
    });
  }
};

export const deleteAtsScoreController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    await deleteAtsScoreHistory(req.user.id, id);

    res.json({
      success: true,
      message: "ATS Score deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete ATS score error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Failed to delete ATS Score",
    });
  }
};

export const deleteAllAtsScoresController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    await deleteAllAtsScoreHistory(req.user.id);

    res.json({
      success: true,
      message: "All ATS Scores deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete all ATS scores error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete ATS Scores",
    });
  }
};
