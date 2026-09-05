import fs from "fs";
import { parseResumeFile } from "../../../shared/resume-parser";
import { researchResume } from "../../../shared/ai/gemini/pdfResumeResearch";
import { ParsedResume } from "../atsScoreCheck.types";

export const parseResume = async (
  filePath: string,
  originalName: string,
  mimetype: string,
): Promise<ParsedResume> => {
  const parsed = await parseResumeFile(filePath, mimetype);

  const fileBuffer = fs.readFileSync(filePath);
  const fileBase64 = fileBuffer.toString("base64");

  // Keep PDF file for resume-builder download — do not delete

  let aiResearch = null;
  try {
    aiResearch = await researchResume(parsed.text, fileBase64, mimetype, fileBuffer);
  } catch (aiError: any) {
    console.error("AI research failed, falling back to parsed data:", aiError);
  }

  return {
    resumeName: originalName,
    aiResearch,
  };
};
