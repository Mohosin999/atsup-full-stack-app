import { ResumeContent, StructuredJD } from "../types";

export type MatchStatus = "matched" | "missing";
export type CheckStatus = "passed" | "failed" | "not-applicable";

// export interface LocalSectionScore {
//   score: number;
//   feedback: string;
//   wordCount?: number;
//   hasContactInfo?: boolean;
//   count?: number;
//   found?: string[];
// }

export interface LocalSectionScore {
  score: number;
  feedback: string;
  hasContactInfo?: boolean;
  count?: number;
  found?: string[];
}

export interface MatchItemResult {
  item: string;
  status: MatchStatus;
  jdCount: number;
  resumeCount: number;
}

export interface MatchCategoryResult {
  score: number;
  matched: string[];
  missing: string[];
  items: MatchItemResult[];
}

export interface CategoryCheck {
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
}

export interface CategoryResult {
  key: string;
  title: string;
  score: number;
  weight: number;
  summary: string;
  checks: CategoryCheck[];
  strengths: string[];
  improvements: string[];
  subgroups?: CategorySubgroup[];
  matched?: string[];
  missing?: string[];
}

export interface CategorySubgroup {
  key: string;
  title: string;
  score: number;
  weight: number;
  summary: string;
  checks: CategoryCheck[];
}

export interface CategoriesResult {
  searchability: CategoryResult;
  hardSkills: CategoryResult;
  softSkills: CategoryResult;
  recruiterTips: CategoryResult;
  formatting: CategoryResult;
}

export interface LocalAtsResult {
  overallScore: number;
  categories: CategoriesResult;
  sectionScores: {
    summary: LocalSectionScore;
    experience: LocalSectionScore;
    skills: LocalSectionScore;
    contactInfo: LocalSectionScore;
    measurableResults: LocalSectionScore;
  };
  atsFriendliness: number;
  suggestions: string[];
  matchBreakdown?: {
    hardSkills: MatchCategoryResult;
    softSkills: MatchCategoryResult;
  };
}

// export interface LocalAtsResult {
//   overallScore: number;
//   categories: CategoriesResult;
//   sectionScores: {
//     summary: LocalSectionScore;
//     experience: LocalSectionScore;
//     skills: LocalSectionScore;
//     contactInfo: LocalSectionScore;
//     measurableResults: LocalSectionScore;
//   };
//   atsFriendliness: number;
//   suggestions: string[];
//   matchBreakdown?: {
//     hardSkills: MatchCategoryResult;
//     softSkills: MatchCategoryResult;
//   };
// }

export interface jdEducationType {
  degree: string;
  field: string;
  education_level: string;
}
