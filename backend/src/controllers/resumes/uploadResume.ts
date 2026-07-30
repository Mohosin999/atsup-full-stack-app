import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { createResumeFromUpload } from "../../services/resumes";
import { upload, uploadErrorHandler } from "../../config/multer";
import fs from "fs";

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

      const resume = await createResumeFromUpload(
        req.user.id,
        req.file
      );

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
