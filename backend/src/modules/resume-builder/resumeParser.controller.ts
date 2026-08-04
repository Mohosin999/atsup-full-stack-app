import { Response } from 'express';
import { AuthRequest } from '../../shared/types';
import { parseResumeFile } from '../../shared/resume-parser';
import { researchResume } from '../../shared/ai/gemini/pdfResumeResearch';
import fs from 'fs';
import path from 'path';

export const parseResume = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    try {
      const parsed = await parseResumeFile(filePath, req.file.mimetype);

      const fileBuffer = fs.readFileSync(filePath);
      const fileBase64 = fileBuffer.toString('base64');

      fs.unlinkSync(filePath);

      let aiResearch = null;
      try {
        aiResearch = await researchResume(
          parsed.text,
          fileBase64,
          req.file.mimetype,
        );
      } catch (aiError: any) {
        console.error('AI research failed, falling back to parsed data:', aiError);
      }

      return res.status(200).json({
        success: true,
        data: {
          resumeName: originalName,
          aiResearch,
        },
      });
    } catch (parseError: any) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }
  } catch (error: any) {
    console.error('Resume parse error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse resume',
    });
  }
};
