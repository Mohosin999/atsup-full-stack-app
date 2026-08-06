import { ResumeContent } from "../../../shared/types";
import { StructuredJD } from "../atsScoreCheck.types";
import { calculateLocalMatchScore } from "../scoring";

export const calculateAtsScore = (
  resume: ResumeContent,
  structuredJD?: StructuredJD | null,
) => {
  return calculateLocalMatchScore(resume, structuredJD);
};
