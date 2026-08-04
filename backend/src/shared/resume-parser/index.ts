import fs from "fs";
import path from "path";

export interface ParsedResume {
  text: string;
}

export const parseResumeFile = async (
  filePath: string,
): Promise<ParsedResume> => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    return parsePDF(filePath);
  } else if (ext === ".docx") {
    return parseDOCX(filePath);
  } else {
    throw new Error("Unsupported file format");
  }
};

const parsePDF = async (filePath: string): Promise<ParsedResume> => {
  try {
    const pdf = require("pdf-parse");
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    console.log("Raw text of PDF \n", data.text);

    return { text: data.text };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
};

const parseDOCX = async (filePath: string): Promise<ParsedResume> => {
  try {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return { text: result.value };
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
  }
};
