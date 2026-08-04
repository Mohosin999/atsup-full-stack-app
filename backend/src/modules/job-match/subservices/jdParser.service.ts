export interface StructuredJD {
  jobTitle: string;
  company: string;
  location: string;
  hardSkills: string[];
  softSkills: string[];
  actionVerbs: string[];
  educationRequirement: string | null;
  experienceYearsRequired: number;
}
