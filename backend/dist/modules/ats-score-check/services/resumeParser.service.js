import fs from "fs";
import { parseResumeFile } from "../../../shared/resume-parser";
import { researchResume } from "../../../shared/ai/gemini/pdfResumeResearch";
export const parseResume = async (filePath, originalName, mimetype) => {
    const parsed = await parseResumeFile(filePath, mimetype);
    const fileBuffer = fs.readFileSync(filePath);
    const fileBase64 = fileBuffer.toString("base64");
    fs.unlinkSync(filePath);
    let aiResearch = null;
    try {
        aiResearch = await researchResume(parsed.text, fileBase64, mimetype);
    }
    catch (aiError) {
        console.error("AI research failed, falling back to parsed data:", aiError);
    }
    return {
        resumeName: originalName,
        aiResearch,
    };
};
