import { calculateLocalMatchScore } from "../../../shared/scoring";
import { ResumeContent, StructuredJD } from "../../../shared/types";

/**
 * Runs the deterministic ATS scoring engine (reused from ats-score-check,
 * but without any LLM involvement — inputs are already parsed by our
 * dictionary parsers).
 */
export const scoreResumeAgainstJd = (
  resume: ResumeContent,
  structuredJd: StructuredJD,
) => {
  return calculateLocalMatchScore(resume, structuredJd);
};