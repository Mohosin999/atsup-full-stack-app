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
} from "./subservices/resumes.service";
import { upload, uploadErrorHandler } from "../../shared/config/multer";
import fs from "fs";

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
