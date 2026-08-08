import { ResumeContent, StructuredJD } from "../../../shared/types";
import { calculateLocalMatchScore } from "../../../shared/scoring";

export const calculateAtsScore = (
  resume: ResumeContent,
  structuredJD?: StructuredJD | null,
) => {
  return calculateLocalMatchScore(resume, structuredJD);
};
