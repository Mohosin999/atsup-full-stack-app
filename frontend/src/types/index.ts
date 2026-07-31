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

export interface ResumeContent {
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
    contact?: {
      email?: string;
      whatsapp?: string;
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

// Resume Builder Types
export interface ResumeTemplate {
  _id: string;
  userId: string;
  name: string;
  isAtsFriendly: boolean;
  content: ResumeContent;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AISectionSuggestion {
  section: string;
  content: string;
  tips: string[];
}

export interface SectionImprovement {
  improved: string;
  changes: string[];
}

export interface AtsCheckResult {
  atsScore: number;
  issues: string[];
  suggestions: string[];
  isAtsFriendly: boolean;
}

// ATS Score History Types
export interface AtsScoreHistory {
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

// Resume Build History Types
export interface ResumeBuildHistory {
  _id: string;
  userId: string;
  title: string;
  resumeContent: ResumeContent;
  createdAt: string;
  updatedAt: string;
}
