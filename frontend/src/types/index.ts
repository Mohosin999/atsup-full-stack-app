export interface User {
  _id: string;
  email: string;
  name: string;
  googleId?: string;
  picture?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultTemplate?: string;
    notifications: boolean;
  };
  subscription: {
    plan: 'free' | 'pro';
    credits: number;
    expiresAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  _id: string;
  userId: string;
  sourceType?: 'uploaded' | 'builder';
  originalFormat?: {
    filename: string;
    mimetype: string;
    size: number;
    path: string;
  };
  content: ResumeContent;
  metadata: {
    filename: string;
    originalName: string;
    size: number;
    type: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIResumeResearch {
  personal_info: {
    fullName: string;
    jobTitle: string;
    contact: {
      address: string;
      email: string;
      phone: string;
      links: {
        linkedin: string;
        portfolio: string;
        github: string;
      };
    };
  };
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    location: string;
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
    link: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    link: string;
  }>;
  yearsOfExperience: string;
  measurableResults: string[];
  resumeTone: string;
  wordCount: string;
  educationSection: boolean;
  experienceSection: boolean;
  workHistory: boolean;
  dateFormatting: boolean;
  layout: {
    isSingleColumn: boolean;
    hasTables: boolean;
    hasImages: boolean;
    hasIcons: boolean;
    hasMultiColumn: boolean;
  };
  fontCheck: {
    isStandardFont: boolean;
    fontName: string;
    isReadableSize: boolean;
    hasMixedFonts: boolean;
  };
}

export interface ResumeContent {  personalInfo: {
    fullName?: string;
    jobTitle?: string;
    contact?: {
      email?: string;
      phone?: string;
      linkedIn?: string;
      address?: {
        city?: string;
        division?: string;
        zipCode?: string;
      };
      socialLinks?: {
        github?: string;
        portfolio?: string;
        website?: string;
      };
    };
  };
  summary?: string;
  experience: Experience[];
  projects?: Project[];
  achievements?: Achievement[];
  education: Education[];
  skills: string[];
  hardSkills?: string[];
  softSkills?: string[];
  actionVerbs?: string[];
  keywords?: string[];
  measurableResults?: string[];
  certifications?: {
    name: string;
    issuer?: string;
    date?: string;
  }[];
}

export interface Experience {
  company: string;
  title: string;
  topSkills?: string[];
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  highlights: string[];
  measurableImpacts?: string[];
}

export interface Project {
  name: string;
  highlights: string[];
  startDate?: string;
  endDate?: string;
  current?: boolean;
  links?: {
    live?: string;
    github?: string;
    caseStudy?: string;
  };
  technologies?: string[];
}

export interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

export interface Education {
  institution: string;
  degree: string;
  date?: string;
}

export interface MissingKeywords {
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  devops: string[];
  softSkills: string[];
}

export interface ExistingSections {
  experience: boolean;
  education: boolean;
  skills: boolean;
}

export interface ATSBreakdown {
  keywordMatch: { score: number; details: string };
  formattingCompatibility: { score: number; details: string };
  skillsSection: { score: number; details: string };
  experienceRelevance: { score: number; details: string };
  readabilityLength: { score: number; details: string };
  contactInfo: { score: number; details: string };
}

export interface Analysis {
  _id: string;
  userId: string;
  resumeId: Resume;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  score: number;
  atsScore?: number;
  atsBreakdown?: ATSBreakdown;
  atsSuggestions?: string[];
  feedback: Feedback;
  sectionScores: SectionScores;
  keywords: Keywords;
  missingKeywords: MissingKeywords;
  recommendedKeywords: string[];
  howToUseKeywords: string[];
  resumeImprovements: string[];
  existingSections: ExistingSections;
  createdAt: string;
}

export interface Feedback {
  overall: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface SectionScores {
  skills: {
    score: number;
    matched: string[];
    missing: string[];
  };
  experience: {
    score: number;
    details: string;
  };
  education: {
    score: number;
    details: string;
  };
  format: {
    score: number;
    details: string;
  };
}

export interface Keywords {
  found: string[];
  missing: string[];
  density: Record<string, number>;
}

export interface JobDescription {
  _id: string;
  userId: string;
  title: string;
  company?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ATS Score Types
export interface AtsScore {
  _id: string;
  userId: string;
  resumeId: Resume | string;
  overallScore: number;
  sectionScores: {
    summary: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    projects: { score: number; feedback: string };
    skills: { score: number; feedback: string };
    contactInfo: { score: number; feedback: string; hasContactInfo: boolean };
    measurableResults: {
      score: number;
      feedback: string;
      count: number;
      found: string[];
    };
  };
  spellingGrammar: {
    score: number;
    errors: Array<{ type: string; message: string; suggestion: string }>;
  };
  atsFriendliness: number;
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AtsCheckResult {
  atsScore: number;
  issues: string[];
  suggestions: string[];
  isAtsFriendly: boolean;
}

export type MatchStatus = "matched" | "partial" | "missing";

export interface MatchItemResult {
  item: string;
  status: MatchStatus;
  jdCount: number;
  resumeCount: number;
}

export interface MatchCategoryResult {
  score: number;
  matched: string[];
  partial: string[];
  missing: string[];
  items: MatchItemResult[];
}

// 5-category ATS scoring (Searchability 30% / Hard Skills 35% / Soft Skills
// 15% / Recruiter Tips 10% / Formatting 10%)
export type CheckStatus = "passed" | "partial" | "failed" | "na";

export interface CategoryCheck {
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
}

export interface CategorySubgroup {
  key: string;
  title: string;
  score: number;
  weight: number;
  summary: string;
  checks: CategoryCheck[];
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

export interface CategoriesResult {
  searchability: CategoryResult;
  hardSkills: CategoryResult;
  softSkills: CategoryResult;
  recruiterTips: CategoryResult;
  formatting: CategoryResult;
}

// ATS Score History Types
export interface AtsScoreHistory {
  id: string;
  _id: string;
  userId: string;
  title: string;
  resumeName: string;
  overallScore: number;
  sectionScores: {
    summary: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    projects: { score: number; feedback: string };
    skills: { score: number; feedback: string };
    contactInfo: { score: number; feedback: string; hasContactInfo: boolean };
    measurableResults: {
      score: number;
      feedback: string;
      count: number;
      found: string[];
    };
    matchBreakdown?: {
      hardSkills: MatchCategoryResult;
      softSkills: MatchCategoryResult;
      actionVerbs: MatchCategoryResult;
    };
    categories?: CategoriesResult;
  };
  spellingGrammar: {
    score: number;
    errors: Array<{ type: string; message: string; suggestion: string }>;
  };
  atsFriendliness: number;
  suggestions: string[];
  resumeContent: ResumeContent;
  createdAt: string;
  updatedAt: string;
}
