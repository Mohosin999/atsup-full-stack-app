import { ResumeContent, StructuredJD } from "../../shared/types";

export interface LayoutInfo {
  isSingleColumn: boolean;
  hasTables: boolean;
  hasImages: boolean;
  hasIcons: boolean;
  hasMultiColumn: boolean;
}

export interface FontCheckInfo {
  isStandardFont: boolean;
  fontName: string;
  isReadableSize: boolean;
  hasMixedFonts: boolean;
}

export interface DictionaryResumeJson {
  personal_info: {
    fullName: string;
    jobTitle: string;
    contact: {
      address: string;
      email: string;
      phone: string;
    };
  };
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    education_level: string;
    startDate: string;
    endDate: string;
  }>;
  skills: {
    hardSkills: string[];
    softSkills: string[];
  };
  projects: Array<{
    name: string;
    description: string[];
    startDate: string;
    endDate: string;
  }>;
  yearsOfExperience: string;
  resumeTone: string;
  wordCount?: number;
  educationSection: boolean;
  experienceSection: boolean;
  workHistory: boolean;
  dateFormatting: boolean;
}

export interface ResumeParseOutput {
  json: DictionaryResumeJson;
  content: ResumeContent;
}

export interface DictionaryJdJson {
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

export interface JdParseOutput {
  json: DictionaryJdJson;
  structured: StructuredJD;
}

export interface UnlimitedAtsResult {
  resume: DictionaryResumeJson;
  resumeContent: ResumeContent;
  jd: DictionaryJdJson;
  score: any;
}

export interface ResumeSegments {
  header: string[];
  summary: string[];
  experience: string[];
  skills: string[];
  education: string[];
  projects: string[];
  certifications: string[];
}

export type Bucket = keyof ResumeSegments;

export interface RawExperience {
  role: string;
  company: string;
  // location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface ResumeSection {
  key: string;
  title: string;
  lines: string[];
  startIndex: number;
  endIndex: number;
}
