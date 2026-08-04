import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import { prisma } from "../../lib/prisma";
import {
  createAtsScoreHistory,
  getAtsScoreHistory,
  getAtsScoreHistoryById,
  deleteAtsScoreHistory,
  deleteAllAtsScoreHistory,
} from "./subservices/history.service";

const mapAIJobToStructuredJD = (aiJD: any) => {
  if (!aiJD || !aiJD.skills) return null;

  const educationParts = [aiJD.education?.field, aiJD.education?.degree].filter(Boolean);
  const educationRequirement = educationParts.length > 0 ? educationParts.join("|") : null;

  const yearsMatch = (aiJD.yearsOfExperience || "").match(/(\d+)/);
  const experienceYearsRequired = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;

  return {
    jobTitle: aiJD.jobTitle || "",
    company: "",
    location: "",
    hardSkills: aiJD.skills?.hardSkills || [],
    softSkills: aiJD.skills?.softSkills || [],
    actionVerbs: [] as string[],
    educationRequirement,
    experienceYearsRequired,
  };
};

const mapAIResearchToResumeContent = (ai: any) => {
  if (!ai) return null;

  const addressParts = (ai.personal_info?.contact?.address || "")
    .split(/[,|-]/)
    .map((part: string) => part.trim())
    .filter(Boolean);

  return {
    personalInfo: {
      fullName: ai.personal_info?.fullName || "",
      jobTitle: ai.personal_info?.jobTitle || "",
      contact: {
        email: ai.personal_info?.contact?.email || "",
        phone: ai.personal_info?.contact?.phone || "",
        linkedIn: ai.personal_info?.contact?.links?.linkedin || "",
        address:
          addressParts.length === 1
            ? { city: addressParts[0] }
            : addressParts.length > 1
              ? {
                  city: addressParts[0],
                  division: addressParts[addressParts.length - 1],
                }
              : undefined,
      },
    },
    summary: ai.summary || "",
    experience: (ai.experience || []).map((exp: any) => ({
      title: exp.role || "",
      company: exp.company || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      highlights: exp.responsibilities || [],
    })),
    education: (ai.education || []).map((edu: any) => ({
      degree: edu.degree || "",
      field: edu.field || "",
      institution: "",
      education_level: edu.education_level || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
    })),
    skills: [
      ...(ai.skills?.hardSkills || []),
      ...(ai.skills?.softSkills || []),
    ],
    hardSkills: ai.skills?.hardSkills || [],
    softSkills: ai.skills?.softSkills || [],
    projects: (ai.projects || []).map((proj: any) => ({
      name: proj.name || "",
      highlights: proj.description || [],
      link: proj.link || "",
    })),
    certifications: (ai.certifications || []).map((cert: any) => ({
      name: cert.name || "",
      issuer: cert.issuer || "",
      date: cert.date || "",
      link: cert.link || "",
    })),
  };
};

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
      skills: [],
      hardSkills: [],
      softSkills: [],
      projects: [],
      certifications: [],
    };

    // Map AI JD format → StructuredJD if needed
    const finalStructuredJD = structuredJD?.skills
      ? mapAIJobToStructuredJD(structuredJD)
      : structuredJD;

    // Check user credits (ATS Score costs 1 credit)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscription: true,
      },
    });

    const credits = (user?.subscription as any)?.credits ?? 0;
    if (!user || credits < 1) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This task requires 1 credit. You have ${credits} credits.`,
      });
    }

    const score = await createAtsScoreHistory(
      req.user.id,
      resumeName || "Untitled Resume",
      resumeContent,
      jobDescription,
      finalStructuredJD || null,
      aiResearch || null,
    );

    // Deduct 1 credit for ATS Score Analysis
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscription: {
          ...((user.subscription as any) || {}),
          credits: credits - 1,
        },
      },
      select: {
        subscription: true,
      },
    });

    const remainingCredits = (updated.subscription as any)?.credits ?? 0;

    res.status(201).json({
      success: true,
      data: score,
      credits: remainingCredits,
      message:
        "✅ Credit deducted successfully! Task: ATS Score Analysis, Credits deducted: 1",
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
