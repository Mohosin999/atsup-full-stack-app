export interface ParsedResume {
  resumeName: string;
  aiResearch: any;
}

export interface ParsedJD {
  jobTitle: string;
  education: {
    degree: string;
    field: string;
    education_level: string;
  };
  skills: {
    hardSkills: string[];
    softSkills: string[];
  };
  yearsOfExperience: string;
}
