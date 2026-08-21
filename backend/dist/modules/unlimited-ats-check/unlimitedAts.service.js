import { parseResumeFile } from "../../shared/resume-parser";
import { parseResumeByDictionary } from "./parsers/resumeParser";
import { parseJdByDictionary } from "./parsers/jdParser";
import { scoreResumeAgainstJd } from "./scoring/score.service";
export const runUnlimitedAtsCheck = async (resumeFilePath, resumeMimeType, jobDescription) => {
    if (!jobDescription || jobDescription.trim().length < 20) {
        throw new Error("Job description is too short. Please provide a detailed job description.");
    }
    const { text } = await parseResumeFile(resumeFilePath, resumeMimeType);
    const resumeParsed = parseResumeByDictionary(text);
    const jdParsed = parseJdByDictionary(jobDescription);
    const score = scoreResumeAgainstJd(resumeParsed.content, jdParsed.structured);
    return {
        resume: resumeParsed.json,
        resumeContent: resumeParsed.content,
        jd: jdParsed.json,
        score,
    };
};
