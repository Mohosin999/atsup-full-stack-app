import { Response } from "express";
import fs from "fs";
import { AuthRequest, ResumeContent } from "../../shared/types";
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
  renameAtsScoreHistory,
  rescanAtsScoreHistory,
} from "./services/history.service";
import { calculateAtsScore } from "./services/scoring.service";
import { AiQuotaError } from "../../shared/ai/gemini/geminiErrors";

const parseAddress = (
  raw: string,
): { city?: string; state?: string } | undefined => {
  if (!raw) return undefined;
  const parts = raw
    .split(/[,•\-]/)
    .map((p) => p.trim())
    .filter(Boolean);
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
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
      }))
      .filter((e: any) => e.degree || e.field || e.education_level),
    skills: {
      hardSkills: ai.skills?.hardSkills || [],
      softSkills: ai.skills?.softSkills || [],
    },
    projects: (ai.projects || []).map((proj: any) => ({
      name: proj.name || "",
      description: proj.description || [],
      startDate: proj.startDate || "",
      endDate: proj.endDate || "",
    })),
    yearsOfExperience: ai.yearsOfExperience || "",
    measurableResults: ai.measurableResults || [],
    actionVerbs: ai.actionVerbs || [],
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
        data: { ...result, originalPdf: req.file.filename },
      });
    } catch (parseError: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw parseError;
    }
  } catch (error: any) {
    console.error("Resume parse error:", error);
    if (error instanceof AiQuotaError) {
      return res.status(429).json({
        success: false,
        message: error.message,
        code: "AI_QUOTA_EXCEEDED",
      });
    }
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
    if (error instanceof AiQuotaError) {
      return res.status(429).json({
        success: false,
        message: error.message,
        code: "AI_QUOTA_EXCEEDED",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to parse job description",
    });
  }
};

// ─── Analyze ─────────────────────────────────────────────────────────────────

export const analyzeAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeName, jobDescription, structuredJD, aiResearch, originalPdf } = req.body;

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
    if (originalPdf) (resumeContent as any).originalPdf = originalPdf;

    const finalStructuredJD = structuredJD?.skills
      ? mapAIToStructuredJD(structuredJD)
      : structuredJD;

    // Scans are unlimited for everyone — no credit check/deduction
    const score = await createAtsScoreHistory(
      req.user.id,
      resumeName || "Untitled Resume",
      resumeContent,
      finalStructuredJD || null,
      aiResearch || null,
    );

    res.status(201).json({
      success: true,
      data: score,
      message: "AI scan completed.",
    });
  } catch (error: any) {
    console.error("ATS Score analysis error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze ATS score",
    });
  }
};

// ─── Rescan (AI, replace existing) ───────────────────────────────────────────

export const rescanAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resumeName, aiResearch, structuredJD, originalPdf } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "History ID is required" });
    }
    if (!aiResearch) {
      return res.status(400).json({ success: false, message: "Resume research data is required" });
    }

    const resumeContent = mapAIResearchToResumeContent(aiResearch) || {
      personalInfo: { fullName: "", jobTitle: "", contact: {} },
      summary: "",
      experience: [],
      education: [],
      skills: { hardSkills: [], softSkills: [] },
      projects: [],
    };
    if (originalPdf) (resumeContent as any).originalPdf = originalPdf;

    const finalStructuredJD = structuredJD?.skills
      ? mapAIToStructuredJD(structuredJD)
      : structuredJD;

    // Calculate score (same as create)
    const analysis = calculateAtsScore(resumeContent, finalStructuredJD || null);
    const hasContactInfo =
      !!resumeContent.personalInfo?.contact?.email ||
      !!resumeContent.personalInfo?.contact?.phone ||
      !!resumeContent.personalInfo?.contact?.address;
    if (!analysis.sectionScores.contactInfo.hasContactInfo && hasContactInfo) {
      analysis.sectionScores.contactInfo.hasContactInfo = true;
    }

    // Rescans are unlimited for everyone — no credit check/deduction
    const updated = await rescanAtsScoreHistory(
      req.user.id,
      id,
      resumeName || "Untitled Resume",
      resumeContent,
      { ...analysis.sectionScores, categories: analysis.categories } as any,
      analysis.overallScore,
      analysis.atsFriendliness,
      analysis.suggestions,
      analysis.matchBreakdown,
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: "AI rescan completed.",
    });
  } catch (error: any) {
    console.error("ATS rescan error:", error);
    if (error instanceof AiQuotaError) {
      return res.status(429).json({ success: false, message: error.message, code: "AI_QUOTA_EXCEEDED" });
    }
    const status = error.message?.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message || "Failed to rescan ATS score" });
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

export const renameAtsScoreController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { resumeName } = req.body;

    if (!resumeName || !resumeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume name is required",
      });
    }

    await renameAtsScoreHistory(req.user.id, id, resumeName.trim());

    res.json({
      success: true,
      message: "Renamed successfully",
    });
  } catch (error: any) {
    console.error("Rename ATS score error:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Failed to rename",
    });
  }
};
