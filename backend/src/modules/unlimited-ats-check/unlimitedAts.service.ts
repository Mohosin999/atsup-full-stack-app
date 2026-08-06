import { parsePdfFile } from "./pdf/pdfParser.service";
import {
  parseResumeByDictionary,
  DictionaryResumeJson,
} from "./parsers/resumeParser";
import {
  parseJdByDictionary,
  DictionaryJdJson,
} from "./parsers/jdParser";
import { scoreResumeAgainstJd } from "./scoring/score.service";

export interface UnlimitedAtsResult {
  resume: DictionaryResumeJson;
  jd: DictionaryJdJson;
  score: ReturnType<typeof scoreResumeAgainstJd>;
}

export const runUnlimitedAtsCheck = async (
  resumeFilePath: string,
  resumeMimeType: string,
  jobDescription: string,
): Promise<UnlimitedAtsResult> => {
  if (!jobDescription || jobDescription.trim().length < 20) {
    throw new Error(
      "Job description is too short. Please provide a detailed job description.",
    );
  }

  const pdf = await parsePdfFile(resumeFilePath, resumeMimeType);

  const resumeParsed = parseResumeByDictionary(pdf);
  const jdParsed = parseJdByDictionary(jobDescription);

  const score = scoreResumeAgainstJd(
    resumeParsed.content,
    jdParsed.structured,
  );

  return {
    resume: resumeParsed.json,
    jd: jdParsed.json,
    score,
  };
};