import { calculateLocalMatchScore } from "../../../shared/scoring";
import { ResumeContent, StructuredJD } from "../../../shared/types";

export const calculateAtsScore = (
  resume: ResumeContent,
  structuredJD?: StructuredJD | null,
) => {
  return calculateLocalMatchScore(resume, structuredJD);
};
