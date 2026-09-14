import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import {
  getAllResumesByUser,
  getResumeById,
  createResumeFromUpload,
  createResumeFromContent as createResumeFromContentService,
  updateResumeById,
  deleteResumeById,
  deleteAllResumesByUser,
  duplicateResumeById,
} from "./subservices/resumes.service";
import { upload, uploadErrorHandler } from "../../shared/config/multer";
import fs from "fs";
import { rewriteResumeWithAI as aiRewriteResume } from "../../shared/ai/gemini";
import { prisma } from "../../lib/prisma";

const getBangladeshCreditDateKey = (): string => {
  const now = new Date();
  const dhakaMs = now.getTime() + 6 * 60 * 60 * 1000;
  const dhaka = new Date(dhakaMs);
  const hour = dhaka.getUTCHours();
  if (hour < 16) {
    dhaka.setUTCDate(dhaka.getUTCDate() - 1);
  }
  return dhaka.toISOString().slice(0, 10);
};

export const getAllResumes = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sourceType = req.query.sourceType as
      | "uploaded"
      | "builder"
      | undefined;

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

export const uploadResume = [
  upload.single("resume"),
  uploadErrorHandler,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const resume = await createResumeFromUpload(req.user.id, req.file);

      res.status(201).json({
        success: true,
        data: resume,
      });
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: error.message || "Error uploading resume",
      });
    }
  },
];

export const createResumeFromContent = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const result = await createResumeFromContentService(req.user.id, content);

    res.status(201).json({
      success: true,
      data: result.resume,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating resume",
    });
  }
};

export const getSingleResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await getResumeById(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching resume",
    });
  }
};

export const updateResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await updateResumeById(
      req.params.id,
      req.user.id,
      req.body,
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating resume",
    });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await deleteResumeById(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting resume",
    });
  }
};

export const duplicateResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await duplicateResumeById(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error duplicating resume",
    });
  }
};
 
export const rewriteResumeWithAI = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume text and job description are required",
      });
    }

    const isAdmin = (req.user as any)?.role === "admin";

    if (!isAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { subscription: true },
      });

      const subscription = (user?.subscription as any) || {};
      const today = getBangladeshCreditDateKey();
      const lastReset = subscription?.lastAiScanResetDate ?? "";
      const credits = subscription?.credits ?? 0;
      const effectiveCredits = lastReset !== today ? 7 : credits;

      if (effectiveCredits < 1) {
        return res.status(403).json({
          success: false,
          message: "Daily limit is 7. New quota at 4 PM BST (Asia/Dhaka, UTC+6).",
          code: "AI_REWRITE_UNAVAILABLE",
        });
      }

      const rewrittenContent = await aiRewriteResume(resumeText, jobDescription);
      const result = await createResumeFromContentService(req.user.id, rewrittenContent);

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
        data: {
          id: result.resume.id,
          content: rewrittenContent,
        },
        credits: remainingCredits,
        aiScan: {
          available: remainingCredits >= 1,
          credits: remainingCredits,
          lastAiScanResetDate: today,
        },
      });
    } else {
      const rewrittenContent = await aiRewriteResume(resumeText, jobDescription);
      const result = await createResumeFromContentService(req.user.id, rewrittenContent);

      res.status(201).json({
        success: true,
        data: {
          id: result.resume.id,
          content: rewrittenContent,
        },
      });
    }
  } catch (error: any) {
    console.error("Error in rewriteResumeWithAI:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to rewrite resume with AI",
    });
  }
};

export const deleteAllResumes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteAllResumesByUser(req.user.id);

    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} resumes successfully`,
    });
  } catch (error) {
    console.error("Error deleting all resumes:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting all resumes",
    });
  }
};

export const parseResumePdf = [
  upload.single("resume"),
  uploadErrorHandler,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { parseResumeFile } = await import("../../shared/resume-parser");
      const parsed = await parseResumeFile(req.file.path, req.file.mimetype);

      // Cleanup temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (!parsed.text || !parsed.text.trim()) {
        return res.status(400).json({
          success: false,
          message: "No extractable text found in PDF. Please upload a text-based PDF.",
        });
      }

      return res.status(200).json({
        success: true,
        data: { text: parsed.text },
      });
    } catch (error: any) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error("Resume parse error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to extract text from PDF",
      });
    }
  },
];
