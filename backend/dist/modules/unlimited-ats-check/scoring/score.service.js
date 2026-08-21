import { calculateLocalMatchScore } from "../../../shared/scoring";
/**
 * Runs the deterministic ATS scoring engine (reused from ats-score-check,
 * but without any LLM involvement — inputs are already parsed by our
 * dictionary parsers).
 */
export const scoreResumeAgainstJd = (resume, structuredJd) => {
    return calculateLocalMatchScore(resume, structuredJd);
};
