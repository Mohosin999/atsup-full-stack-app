import { Request } from "express";

// ============================================================================
// Request Types
// ============================================================================

/**
 * Extended Express Request with user authentication context
 * Used in authenticated routes where user info is attached to request
 */
export interface AuthRequest extends Request {
  user?: any;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Extended Error type with HTTP status code and operational flag
 * Used for structured error handling across the application
 */
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// ============================================================================
// Resume Content Types
// ============================================================================

/**
 * Standardized resume content structure
 * Used for resume parsing, storage, and analysis
 */
export interface ResumeContent {
  personalInfo: {
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
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    highlights: string[];
    measurableImpacts?: string[];
  }>;
  projects?: Array<{
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
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  achievements?: Array<{
    title: string;
    description?: string;
    date?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    date?: string;
  }>;
  skills: string[];
  hardSkills?: string[];
  softSkills?: string[];
  actionVerbs?: string[];
  measurableResults?: string[];
  [key: string]: any;
}

// ============================================================================
// Analysis Result Types
// ============================================================================

/**
 * Standardized analysis result structure
 * Used by AI analysis service and analysis controllers
 */
export interface AnalysisResult {
  score: number;
  jobMatchingScore?: number;
  jobMatchingBreakdown?: {
    requiredSkillsMatch: { score: number; details: string };
    relevantWorkExperience: { score: number; details: string };
    technologiesUsed: { score: number; details: string };
    toolsFrameworks: { score: number; details: string };
    industryRelevance: { score: number; details: string };
    yearsExperienceAlignment: { score: number; details: string };
  };
  feedback: {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  sectionScores: {
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
  };
  keywords: {
    found: string[];
    missing: string[];
    density: Record<string, number>;
  };
  missingKeywords: {
    programmingLanguages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    devops: string[];
    softSkills: string[];
  };
  recommendedKeywords: string[];
  howToUseKeywords: string[];
  resumeImprovements: string[];
  jobMatch?: {
    score: number;
    missingKeywords: string[];
    suggestions: string[];
  };
  existingSections: {
    experience: boolean;
    education: boolean;
    skills: boolean;
    summary: boolean;
    projects: boolean;
  };
}

// ============================================================================
// Detailed Analysis Result Types (Extended)
// ============================================================================

export interface DetailedAnalysisResult {
  overallScore: number;
  jobMatchScore: number;
  scoreBreakdown: ScoreBreakdown;
  sectionAnalysis: SectionAnalysis;
  skillsAnalysis: SkillsAnalysis;
  experienceAnalysis: ExperienceAnalysis;
  keywordAnalysis: KeywordAnalysis;
  recommendations: Recommendation[];
  metadata: AnalysisMetadata;
}

export interface ScoreBreakdown {
  ats: {
    keywordMatching: ScoreComponent;
    skillsMatch: ScoreComponent;
    sectionCompleteness: ScoreComponent;
    experienceRelevance: ScoreComponent;
  };
  jobMatch: {
    skillsMatch: ScoreComponent;
    keywordsMatch: ScoreComponent;
    softSkillsMatch: ScoreComponent;
  };
}

export interface ScoreComponent {
  score: number;
  weight: number;
  maxScore: number;
  details: string;
  factors: ScoringFactor[];
}

export interface ScoringFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  evidence?: string[];
}

// ============================================================================
// Section Analysis Types
// ============================================================================

export interface SectionAnalysis {
  summary: SectionScore;
  skills: SectionScore;
  experience: SectionScore;
  projects: SectionScore;
  education: SectionScore;
  additionalSections: AdditionalSectionScore[];
}

export interface SectionScore {
  present: boolean;
  score: number;
  quality: "Excellent" | "Good" | "Fair" | "Poor" | "Missing";
  wordCount?: number;
  issues: SectionIssue[];
  recommendations: string[];
  strengths: string[];
}

export interface AdditionalSectionScore {
  name: string;
  present: boolean;
  score: number;
}

export interface SectionIssue {
  type:
    | "Missing"
    | "Too Short"
    | "Too Long"
    | "Poor Structure"
    | "Missing Keywords"
    | "Formatting";
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  suggestion: string;
}

// ============================================================================
// Skills Analysis Types
// ============================================================================

export interface SkillsAnalysis {
  totalSkillsFound: number;
  matchedSkills: SkillMatch[];
  missingSkills: SkillGap[];
  additionalSkills: string[];
  skillCategories: SkillCategoryBreakdown[];
  skillDensity: number;
  skillProficiency: ProficiencyDistribution;
}

export interface SkillMatch {
  name: string;
  category: SkillCategory;
  matchType: "Exact" | "Partial" | "Related" | "Equivalent";
  matchScore: number;
  foundIn: string[];
  context: string[];
  yearsOfExperience?: number;
  lastUsed?: string;
}

export interface SkillGap {
  name: string;
  category: SkillCategory;
  priority: "Critical" | "High" | "Medium" | "Low";
  isRequired: boolean;
  suggestions: string[];
  learningResources?: string[];
}

export interface SkillCategoryBreakdown {
  category: SkillCategory;
  required: number;
  matched: number;
  missing: number;
  matchPercentage: number;
  skills: string[];
}

export interface ProficiencyDistribution {
  expert: number;
  advanced: number;
  intermediate: number;
  beginner: number;
}

// ============================================================================
// Experience Analysis Types
// ============================================================================

export interface ExperienceAnalysis {
  totalYears: number;
  relevantYears: number;
  positions: PositionAnalysis[];
  careerProgression: CareerProgression;
  achievementMetrics: AchievementMetrics;
  responsibilityMatch: ResponsibilityMatch;
  gaps: EmploymentGap[];
}

export interface PositionAnalysis {
  title: string;
  company: string;
  duration: number;
  relevanceScore: number;
  matchedKeywords: string[];
  matchedResponsibilities: string[];
  achievements: number;
  quantifiedAchievements: number;
  technologiesUsed: string[];
}

export interface CareerProgression {
  hasProgression: boolean;
  progressionScore: number;
  titleProgression: "Increasing" | "Lateral" | "Decreasing" | "Unclear";
  responsibilityGrowth: boolean;
  skillGrowth: boolean;
}

export interface AchievementMetrics {
  totalAchievements: number;
  quantifiedCount: number;
  quantificationRate: number;
  metricTypes: {
    percentages: number;
    monetaryValues: number;
    timeReductions: number;
    efficiencyGains: number;
    scaleMetrics: number;
  };
}

export interface ResponsibilityMatch {
  matchedResponsibilities: number;
  totalResponsibilities: number;
  matchPercentage: number;
}

export interface EmploymentGap {
  startDate: string;
  endDate: string;
  durationMonths: number;
  isExplained: boolean;
  severity: "Critical" | "Moderate" | "Minor";
}

// ============================================================================
// Keyword Analysis Types
// ============================================================================

export interface KeywordAnalysis {
  totalKeywords: number;
  foundKeywords: KeywordMatch[];
  missingKeywords: KeywordGap[];
  keywordDensity: {
    overall: number;
    bySection: Record<string, number>;
  };
  keywordDistribution: {
    summary: number;
    experience: number;
    skills: number;
    projects: number;
  };
  overusedKeywords: OverusedKeyword[];
  semanticKeywords: SemanticKeyword[];
}

export interface KeywordMatch {
  keyword: string;
  category: KeywordCategory;
  frequency: number;
  locations: string[];
  context: string[];
  relevanceScore: number;
}

export interface KeywordGap {
  keyword: string;
  category: KeywordCategory;
  importance: "Critical" | "High" | "Medium" | "Low";
  frequency: number;
  suggestions: string[];
}

export type KeywordCategory =
  | "Technical Skill"
  | "Tool"
  | "Technology"
  | "Methodology"
  | "Certification"
  | "Soft Skill"
  | "Action Verb"
  | "Industry Term"
  | "Domain Knowledge";

export interface OverusedKeyword {
  keyword: string;
  frequency: number;
  recommendedMax: number;
  suggestion: string;
}

export interface SemanticKeyword {
  keyword: string;
  relatedTo: string;
  suggestion: string;
}

// ============================================================================
// Recommendation Types
// ============================================================================

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  priority: "Critical" | "High" | "Medium" | "Low";
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
  actionItems: ActionItem[];
  estimatedScoreImprovement: number;
}

export interface ActionItem {
  id: string;
  action: string;
  section: string;
  example?: string;
  completed: boolean;
}

export type RecommendationCategory =
  | "Content"
  | "Skills"
  | "Keywords"
  | "Formatting"
  | "Structure"
  | "Achievements"
  | "Experience"
  | "Education"
  | "ATS Optimization";

// ============================================================================
// Metadata Types
// ============================================================================

export interface AnalysisMetadata {
  analysisVersion: string;
  analyzedAt: Date;
  processingTimeMs: number;
  resumeWordCount: number;
  jdWordCount: number;
  confidenceScore: number;
  dataQuality: DataQuality;
  limitations: string[];
}

export interface DataQuality {
  resumeQuality: "Excellent" | "Good" | "Fair" | "Poor";
  jdQuality: "Excellent" | "Good" | "Fair" | "Poor";
  parseSuccess: boolean;
  completenessScore: number;
}

// ============================================================================
// Job Description Types
// ============================================================================

export interface ParsedJobDescription {
  rawText: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  jobType?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  experienceLevel?: "Entry" | "Mid" | "Senior" | "Lead" | "Principal";
  requiredSkills: SkillRequirement[];
  preferredSkills: SkillRequirement[];
  requiredExperience?: ExperienceRequirement;
  responsibilities: string[];
  qualifications: string[];
  benefits?: string[];
  keywords: string[];
  actionVerbs?: string[];
  industryTerms: string[];
}

export interface SkillRequirement {
  name: string;
  category: SkillCategory;
  isRequired: boolean;
  priority: "Critical" | "High" | "Medium" | "Nice-to-have";
  yearsRequired?: number;
}

export type SkillCategory =
  | "Programming Language"
  | "Framework"
  | "Library"
  | "Database"
  | "Cloud Platform"
  | "DevOps Tool"
  | "Testing Tool"
  | "Soft Skill"
  | "Domain Knowledge"
  | "Methodology"
  | "Certification";

export interface ExperienceRequirement {
  minYears?: number;
  maxYears?: number;
  requiredIndustries?: string[];
  preferredIndustries?: string[];
  requiredRoles?: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

export interface AnalysisConfig {
  weights: {
    keywordMatching: number;
    skillsMatch: number;
    sectionCompleteness: number;
    experienceRelevance: number;
  };
  thresholds: {
    excellent: number;
    good: number;
    fair: number;
  };
  minWordCount: {
    summary: number;
    experience: number;
  };
}

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  weights: {
    keywordMatching: 30,
    skillsMatch: 30,
    sectionCompleteness: 30,
    experienceRelevance: 10,
  },
  thresholds: {
    excellent: 80,
    good: 60,
    fair: 40,
  },
  minWordCount: {
    summary: 30,
    experience: 50,
  },
};

// ============================================================================
// JWT Types
// ============================================================================

/**
 * JWT token payload structure
 * Used for access and refresh token generation/verification
 */
export interface JWTPayload {
  userId: string;
  email: string;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * User subscription plan types
 */
export type SubscriptionPlan = "free" | "pro";

/**
 * User theme preference types
 */
export type ThemePreference = "light" | "dark" | "system";

/**
 * User document interface
 * Used for User model and user-related operations
 */
export interface IUser {
  email: string;
  name: string;
  googleId?: string;
  password?: string;
  picture?: string;
  preferences: {
    theme: ThemePreference;
    defaultTemplate?: string;
    notifications: boolean;
  };
  subscription: {
    plan: SubscriptionPlan;
    credits: number;
    expiresAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Standard API response wrapper
 * Used for consistent API response formatting
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// File Upload Types
// ============================================================================

/**
 * Supported file types for upload
 */
export type SupportedFileType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * File upload configuration
 */
export interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadDir: string;
}
