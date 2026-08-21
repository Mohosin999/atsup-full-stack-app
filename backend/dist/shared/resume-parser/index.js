import fs from "fs";
import path from "path";
export const parseResumeFile = async (filePath, _mimeType) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") {
        return parsePDF(filePath);
    }
    else {
        throw new Error("Unsupported file format. Only PDF is supported.");
    }
};
const parsePDF = async (filePath) => {
    try {
        const { default: pdf } = await import("pdf-parse");
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        console.log(data.text);
        return { text: data.text };
    }
    catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to parse PDF file");
    }
};
