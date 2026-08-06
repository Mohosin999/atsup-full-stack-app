import { researchJobDescription } from "../../../shared/ai/gemini/jobDescriptionResearch";
import { ParsedJD } from "../atsScoreCheck.types";
import { StructuredJD } from "../../../shared/types";

export const parseJobDescription = async (
  description: string,
): Promise<ParsedJD> => {
  return researchJobDescription(description.trim());
};

export const mapAIToStructuredJD = (aiJD: any): StructuredJD | null => {
  if (!aiJD || !aiJD.skills) return null;

  const educationParts = [
    aiJD.education?.field,
    aiJD.education?.degree,
  ].filter(Boolean);
  const educationRequirement =
    educationParts.length > 0 ? educationParts.join("|") : null;

  const yearsMatch = (aiJD.yearsOfExperience || "").match(/(\d+)/);
  const experienceYearsRequired = yearsMatch
    ? parseInt(yearsMatch[1], 10)
    : 0;

  return {
    jobTitle: aiJD.jobTitle || "",
    company: "",
    location: "",
    hardSkills: aiJD.skills?.hardSkills || [],
    softSkills: aiJD.skills?.softSkills || [],
    actionVerbs: [],
    educationRequirement,
    experienceYearsRequired,
  };
};
