import { researchJobDescription } from "../../../shared/ai/gemini/jobDescriptionResearch";
export const parseJobDescription = async (description) => {
    return researchJobDescription(description.trim());
};
export const mapAIToStructuredJD = (aiJD) => {
    if (!aiJD || !aiJD.skills)
        return null;
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
