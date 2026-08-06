import { calculateLocalMatchScore } from "../../ats-score-check/scoring/subservices/engine.service";
import { ResumeContent } from "../../../shared/types";
import { DictionaryStructuredJD } from "../parsers/jdParser";

/**
 * Runs the deterministic ATS scoring engine (reused from ats-score-check,
 * but without any LLM involvement — inputs are already parsed by our
 * dictionary parsers).
 */
export const scoreResumeAgainstJd = (
  resume: ResumeContent,
  structuredJd: DictionaryStructuredJD,
) => {
  return calculateLocalMatchScore(resume, structuredJd);
};