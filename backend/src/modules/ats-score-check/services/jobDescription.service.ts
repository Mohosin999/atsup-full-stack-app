import { researchJobDescription } from "../../../shared/ai/gemini/jobDescriptionResearch";
import { StructuredJD } from "../../../shared/types";
import { ParsedJD } from "../atsScoreCheck.types";

export const parseJobDescription = async (
  description: string,
): Promise<ParsedJD> => {
  return researchJobDescription(description.trim());
};

export const mapAIToStructuredJD = (aiJD: any): StructuredJD | null => {
  if (!aiJD || !aiJD.skills) return null;

  const yearsMatch = (aiJD.yearsOfExperience || "").match(/(\d+)/);
  const experienceYearsRequired = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;

  return {
    jobTitle: aiJD.jobTitle || "",
    education: {
      degree: aiJD.education?.degree || "",
      field: aiJD.education?.field || "",
      education_level: aiJD.education?.education_level || "",
    },
    skills: {
      hardSkills: aiJD.skills.hardSkills || [],
      softSkills: aiJD.skills.softSkills || [],
    },
    yearsOfExperience: aiJD.yearsOfExperience || "",
    experienceYearsRequired,
  };
};
