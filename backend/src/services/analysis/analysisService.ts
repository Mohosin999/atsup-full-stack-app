import {
  ResumeContent,
  DetailedAnalysisResult,
  ScoreBreakdown,
  SectionAnalysis,
  SkillsAnalysis,
  ExperienceAnalysis,
  KeywordAnalysis,
  Recommendation,
  AnalysisMetadata,
  SkillMatch,
  SkillGap,
  SkillCategoryBreakdown,
  PositionAnalysis,
  KeywordMatch,
  KeywordGap,
  DEFAULT_ANALYSIS_CONFIG,
} from "../../types";
import { experienceText } from "../../utils";

import {
  KeywordMatchingCalculator,
  SkillsMatchCalculator,
  SectionCompletenessCalculator,
  ExperienceRelevanceCalculator,
} from "./scoringEngine";

import {
  extractKeywords,
  extractSkillsFromResume,
} from "./keywordExtractor";

interface AnalysisInput {
  resume: ResumeContent;
  resumeText: string;
  jobDescription: string;
}

/**
 * Main Analysis Service Class
 * Orchestrates all analysis components
 */
export class ResumeAnalysisService {
  private keywordCalculator: KeywordMatchingCalculator;
  private skillsCalculator: SkillsMatchCalculator;
  private sectionCalculator: SectionCompletenessCalculator;
  private experienceCalculator: ExperienceRelevanceCalculator;

  constructor() {
    this.keywordCalculator = new KeywordMatchingCalculator();
    this.skillsCalculator = new SkillsMatchCalculator();
    this.sectionCalculator = new SectionCompletenessCalculator();
    this.experienceCalculator = new ExperienceRelevanceCalculator();
  }

  /**
   * Main analysis entry point
   */
  async analyze(input: AnalysisInput): Promise<DetailedAnalysisResult> {
    const startTime = Date.now();

    const { resume, resumeText, jobDescription } = input;

    // Extract keywords from both documents
    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = extractKeywords(jobDescription);
    const parsedJD = { requiredSkills: [], preferredSkills: [], keywords: jdKeywords.all, experienceYears: 0 };

    // Generate detailed analysis FIRST (so we can use it for job match scoring)
    const sectionAnalysis = this.analyzeSections(resume, resumeKeywords);
    const skillsAnalysis = this.analyzeSkills(resume, parsedJD);
    const experienceAnalysis = this.analyzeExperience(resume, jobDescription);
    const keywordAnalysis = this.analyzeKeywords(resumeText, jdKeywords);

    // Calculate ATS Score Components
    const atsBreakdown = this.calculateATSScore({
      resume,
      resumeText,
      resumeKeywords,
      jdKeywords,
      parsedJD,
    });

    // Calculate Job Match Score Components (using skillsAnalysis for accurate scores)
    const jobMatchBreakdown = this.calculateJobMatchScore({
      resume,
      resumeText,
      parsedJD,
      jobDescription,
      skillsAnalysis,
    });

    // Calculate overall scores
    const jobMatchScore =
      this.calculateWeightedJobMatchScore(jobMatchBreakdown);
    const overallScore = jobMatchScore;

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      atsBreakdown,
      jobMatchBreakdown,
      sectionAnalysis,
      skillsAnalysis,
      experienceAnalysis,
      keywordAnalysis,
    });

    // Build metadata
    const metadata: AnalysisMetadata = {
      analysisVersion: "2.0.0",
      analyzedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
      resumeWordCount: resumeText.split(/\s+/).length,
      jdWordCount: jobDescription.split(/\s+/).length,
      confidenceScore: this.calculateConfidenceScore(resume, jobDescription),
      dataQuality: {
        resumeQuality: this.assessDataQuality(resumeText),
        jdQuality: this.assessDataQuality(jobDescription),
        parseSuccess: true,
        completenessScore: this.calculateCompletenessScore(resume),
      },
      limitations: [],
    };

    return {
      overallScore,
      jobMatchScore,
      scoreBreakdown: {
        ats: atsBreakdown,
        jobMatch: jobMatchBreakdown,
      },
      sectionAnalysis,
      skillsAnalysis,
      experienceAnalysis,
      keywordAnalysis,
      recommendations,
      metadata,
    };
  }

  /**
   * Calculate ATS Score Breakdown
   */
  private calculateATSScore(input: {
    resume: ResumeContent;
    resumeText: string;
    resumeKeywords: any;
    jdKeywords: any;
    parsedJD: any;
  }): ScoreBreakdown["ats"] {
    const { resume, resumeText, resumeKeywords, jdKeywords, parsedJD } = input;

    // Keyword Matching (30%)
    const keywordMatching = this.keywordCalculator.calculate({
      resumeText,
      jdKeywords: jdKeywords.all,
      resumeKeywords: resumeKeywords.all,
    });

    // Skills Match (30%)
    const resumeSkills = extractSkillsFromResume(resume);
    const skillsMatch = this.skillsCalculator.calculate({
      resumeSkills,
      jdSkills: parsedJD.requiredSkills,
      jdRequiredSkills: parsedJD.requiredSkills,
      jdPreferredSkills: parsedJD.preferredSkills,
    });

    // Section Completeness (30%)
    const sectionCompleteness = this.sectionCalculator.calculate({
      resume,
      resumeText,
    });

    // Experience Relevance (10%)
    const experienceRelevance = this.experienceCalculator.calculate({
      resume,
      jdText: input.parsedJD.rawText || "",
      jdKeywords: jdKeywords.all,
    });

    return {
      keywordMatching,
      skillsMatch,
      sectionCompleteness,
      experienceRelevance,
    };
  }

  /**
   * Calculate Job Match Score Breakdown
   * Focus: Skills Match (50%) + Keywords Match (50%)
   */
  private calculateJobMatchScore(input: {
    resume: ResumeContent;
    resumeText: string;
    parsedJD: any;
    jobDescription: string;
    skillsAnalysis?: any;
  }): ScoreBreakdown["jobMatch"] {
    const { resume, resumeText, parsedJD, jobDescription, skillsAnalysis } = input;
    const resumeSkills = extractSkillsFromResume(resume);

    const requiredSkills = parsedJD?.requiredSkills || [];
    const jdKeywords = parsedJD?.keywords || [];

    // Skills Match (40%)
    const matchedCount = skillsAnalysis?.matchedSkills?.length ?? 0;
    const missingCount = skillsAnalysis?.missingSkills?.length ?? 0;
    const totalRequired = matchedCount + missingCount;
    
    const skillsMatch = {
      score: totalRequired > 0
        ? Math.round((matchedCount / totalRequired) * 100)
        : requiredSkills.length > 0
          ? Math.round((matchedCount / Math.max(1, requiredSkills.length)) * 100)
          : resumeSkills.length > 0 ? 70 : 50,
      weight: 40,
      maxScore: 100,
      details: totalRequired > 0
        ? `${matchedCount}/${totalRequired} skills matched`
        : requiredSkills.length > 0
          ? `${matchedCount}/${requiredSkills.length} skills matched`
          : `Found ${resumeSkills.length} resume skills`,
      factors: [],
    };

    // Keywords Match (40%)
    const foundKeywords = skillsAnalysis?.additionalSkills?.length 
      ? resumeSkills.filter((s: string) => 
          !requiredSkills.some((rs: string) => rs.toLowerCase().includes(s.toLowerCase()))
        ).length
      : 0;
    
    const resumeLower = resumeText.toLowerCase();
    const matchedKeywords = jdKeywords.filter((keyword: string) => {
      const escaped = this.escapeRegex(keyword);
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(resumeLower);
    });
    
    const keywordsMatch = {
      score: jdKeywords.length > 0
        ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
        : 50,
      weight: 40,
      maxScore: 100,
      details: jdKeywords.length > 0
        ? `${matchedKeywords.length}/${jdKeywords.length} keywords matched`
        : `No keywords extracted from JD`,
      factors: [],
    };

    // Soft Skills Match (20%)
    const resumeSoftSkills = (resume?.softSkills || []).map((s: string) =>
      s.toLowerCase().trim(),
    );
    const jdSoftSkills =
      parsedJD?.softSkills?.length
        ? parsedJD.softSkills
        : extractKeywords(jobDescription).soft.keywords;
    const matchedSoftSkills = jdSoftSkills.filter((jdSoft: string) =>
      resumeSoftSkills.some(
        (r: string) =>
          r.includes(jdSoft.toLowerCase()) ||
          jdSoft.toLowerCase().includes(r),
      ),
    );

    const softSkillsMatch = {
      score: jdSoftSkills.length > 0
        ? Math.round((matchedSoftSkills.length / jdSoftSkills.length) * 100)
        : resumeSoftSkills.length > 0 ? 70 : 50,
      weight: 20,
      maxScore: 100,
      details: jdSoftSkills.length > 0
        ? `${matchedSoftSkills.length}/${jdSoftSkills.length} soft skills matched`
        : resumeSoftSkills.length > 0
          ? `Found ${resumeSoftSkills.length} resume soft skills`
          : `No soft skills found`,
      factors: [],
    };

    return {
      skillsMatch,
      keywordsMatch,
      softSkillsMatch,
    };
  }

  /**
   * Calculate weighted ATS Score
   */
  private calculateWeightedATSScore(breakdown: ScoreBreakdown["ats"]): number {
    const weights = DEFAULT_ANALYSIS_CONFIG.weights;

    return Math.round(
      breakdown.keywordMatching.score * (weights.keywordMatching / 100) +
        breakdown.skillsMatch.score * (weights.skillsMatch / 100) +
        breakdown.sectionCompleteness.score *
          (weights.sectionCompleteness / 100) +
        breakdown.experienceRelevance.score *
          (weights.experienceRelevance / 100),
    );
  }

  /**
   * Calculate weighted Job Match Score
   */
  private calculateWeightedJobMatchScore(
    breakdown: ScoreBreakdown["jobMatch"],
  ): number {
    const skillsWeight = breakdown.skillsMatch.weight || 40;
    const keywordsWeight = breakdown.keywordsMatch.weight || 40;
    const softSkillsWeight = breakdown.softSkillsMatch.weight || 20;
    const totalWeight = skillsWeight + keywordsWeight + softSkillsWeight;

    return Math.round(
      breakdown.skillsMatch.score * (skillsWeight / totalWeight) +
        breakdown.keywordsMatch.score * (keywordsWeight / totalWeight) +
        breakdown.softSkillsMatch.score * (softSkillsWeight / totalWeight),
    );
  }

  /**
   * Analyze resume sections in detail
   */
  private analyzeSections(
    resume: ResumeContent,
    keywords: any,
  ): SectionAnalysis {
    return {
      summary: {
        present: !!(resume.summary && resume.summary.length > 30),
        score: resume.summary && resume.summary.length > 30 ? 85 : 30,
        quality:
          resume.summary && resume.summary.length > 50
            ? "Excellent"
            : resume.summary && resume.summary.length > 30
              ? "Good"
              : "Poor",
        wordCount: resume.summary?.split(/\s+/).length || 0,
        issues:
          resume.summary && resume.summary.length < 30
            ? [
                {
                  type: "Too Short",
                  severity: "High",
                  description: "Summary is too brief",
                  suggestion: "Expand to at least 30 words",
                },
              ]
            : [],
        recommendations: resume.summary
          ? []
          : ["Add a professional summary highlighting your key qualifications"],
        strengths:
          resume.summary && resume.summary.length > 50
            ? ["Comprehensive professional summary"]
            : [],
      },
      skills: {
        present: !!(resume.skills && resume.skills.length > 0),
        score:
          resume.skills && resume.skills.length > 5
            ? 90
            : resume.skills && resume.skills.length > 0
              ? 60
              : 20,
        quality:
          resume.skills && resume.skills.length > 10
            ? "Excellent"
            : resume.skills && resume.skills.length > 5
              ? "Good"
              : "Fair",
        issues:
          resume.skills && resume.skills.length < 5
            ? [
                {
                  type: "Too Short",
                  severity: "High",
                  description: "Skills section is sparse",
                  suggestion: "Add at least 5 technical skills",
                },
              ]
            : [],
        recommendations:
          resume.skills && resume.skills.length < 5
            ? ["Expand your technical skills section"]
            : [],
        strengths:
          resume.skills && resume.skills.length > 10
            ? [
                `Comprehensive skills section with ${resume.skills.length} skills`,
              ]
            : [],
      },
      experience: {
        present: !!(resume.experience && resume.experience.length > 0),
        score:
          resume.experience && resume.experience.length > 2
            ? 90
            : resume.experience && resume.experience.length > 0
              ? 70
              : 20,
        quality:
          resume.experience && resume.experience.length > 3
            ? "Excellent"
            : resume.experience && resume.experience.length > 1
              ? "Good"
              : "Fair",
        issues:
          !resume.experience || resume.experience.length === 0
            ? [
                {
                  type: "Missing",
                  severity: "Critical",
                  description: "No work experience listed",
                  suggestion: "Add relevant work experience",
                },
              ]
            : [],
        recommendations:
          !resume.experience || resume.experience.length === 0
            ? ["Add your work experience with detailed descriptions"]
            : [],
        strengths:
          resume.experience && resume.experience.length > 2
            ? [`Strong work history with ${resume.experience.length} positions`]
            : [],
      },
      projects: {
        present: !!(resume.projects && resume.projects.length > 0),
        score:
          resume.projects && resume.projects.length > 2
            ? 90
            : resume.projects && resume.projects.length > 0
              ? 70
              : 40,
        quality:
          resume.projects && resume.projects.length > 3
            ? "Excellent"
            : resume.projects && resume.projects.length > 1
              ? "Good"
              : "Fair",
        issues:
          !resume.projects || resume.projects.length === 0
            ? [
                {
                  type: "Missing",
                  severity: "Medium",
                  description: "No projects section",
                  suggestion: "Add personal or professional projects",
                },
              ]
            : [],
        recommendations:
          !resume.projects || resume.projects.length === 0
            ? ["Add a projects section to showcase practical work"]
            : [],
        strengths:
          resume.projects && resume.projects.length > 2
            ? [`Impressive portfolio with ${resume.projects.length} projects`]
            : [],
      },
      education: {
        present: !!(resume.education && resume.education.length > 0),
        score: resume.education && resume.education.length > 0 ? 80 : 50,
        quality:
          resume.education && resume.education.length > 0 ? "Good" : "Fair",
        issues:
          !resume.education || resume.education.length === 0
            ? [
                {
                  type: "Missing",
                  severity: "Low",
                  description: "No education section",
                  suggestion: "Consider adding education details",
                },
              ]
            : [],
        recommendations:
          !resume.education || resume.education.length === 0
            ? ["Add your educational background"]
            : [],
        strengths:
          resume.education && resume.education.length > 0
            ? ["Education section present"]
            : [],
      },
      additionalSections: [],
    };
  }

  /**
   * Analyze skills in detail
   */
  private analyzeSkills(resume: ResumeContent, parsedJD: any): SkillsAnalysis {
    const resumeSkills = extractSkillsFromResume(resume);

    const matchedSkills: SkillMatch[] = parsedJD.requiredSkills
      .filter((skill: string) =>
        resumeSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase())),
      )
      .map((skill: string) => ({
        name: skill,
        category: this.categorizeSkill(skill),
        matchType: "Exact" as const,
        matchScore: 100,
        foundIn: ["skills"],
        context: [],
      }));

    const missingSkills: SkillGap[] = parsedJD.requiredSkills
      .filter(
        (skill: string) =>
          !resumeSkills.some((s) =>
            s.toLowerCase().includes(skill.toLowerCase()),
          ),
      )
      .map((skill: string) => ({
        name: skill,
        category: this.categorizeSkill(skill),
        priority: "High" as const,
        isRequired: true,
        suggestions: [
          `Add ${skill} to your skills section`,
          `Highlight ${skill} experience in projects`,
        ],
      }));

    const additionalSkills = resumeSkills.filter(
      (skill) =>
        !parsedJD.requiredSkills.some((s: string) =>
          s.toLowerCase().includes(skill.toLowerCase()),
        ),
    );

    const categoryBreakdown: SkillCategoryBreakdown[] = [];
    const categories = [
      "programmingLanguages",
      "frontendFrameworks",
      "backendFrameworks",
      "databases",
      "devopsTools",
    ];

    categories.forEach((category) => {
      const categoryBreakdownItem = {
        category: this.getCategoryName(category),
        required: 0,
        matched: 0,
        missing: 0,
        matchPercentage: 100,
        skills: [],
      };
      categoryBreakdown.push(categoryBreakdownItem);
    });

    return {
      totalSkillsFound: resumeSkills.length,
      matchedSkills,
      missingSkills,
      additionalSkills,
      skillCategories: categoryBreakdown,
      skillDensity:
        resumeSkills.length /
        Math.max(1, this.calculateYearsOfExperience(resume.experience)),
      skillProficiency: {
        expert: 0,
        advanced: 0,
        intermediate: resumeSkills.length,
        beginner: 0,
      },
    };
  }

  /**
   * Analyze experience in detail
   */
  private analyzeExperience(
    resume: ResumeContent,
    jdText: string,
  ): ExperienceAnalysis {
    const experience = resume.experience || [];
    const jdLower = jdText.toLowerCase();

    const positions: PositionAnalysis[] = experience.map((exp) => {
      const expText =
        `${exp.title} ${exp.company} ${experienceText(exp)}`.toLowerCase();
      const keywords = jdLower.split(/\s+/).filter((word) => word.length > 4);
      const matchedKeywords = keywords.filter((k) => expText.includes(k));

      const achievements = (
        experienceText(exp).match(/\d+%|\$\d+|\d+x/g) || []
      ).length;

      return {
        title: exp.title,
        company: exp.company,
        duration: this.calculateDuration(
          exp.startDate,
          exp.endDate,
          exp.current,
        ),
        relevanceScore:
          matchedKeywords.length > 0
            ? Math.min(100, matchedKeywords.length * 10)
            : 30,
        matchedKeywords: matchedKeywords.slice(0, 10),
        matchedResponsibilities: [],
        achievements,
        quantifiedAchievements: achievements,
        technologiesUsed: [],
      };
    });

    const totalYears = this.calculateYearsOfExperience(experience);
    const totalAchievements = positions.reduce(
      (sum, p) => sum + p.achievements,
      0,
    );

    return {
      totalYears,
      relevantYears: totalYears,
      positions,
      careerProgression: {
        hasProgression: experience.length > 1,
        progressionScore: experience.length > 2 ? 80 : 50,
        titleProgression: "Increasing" as const,
        responsibilityGrowth: true,
        skillGrowth: true,
      },
      achievementMetrics: {
        totalAchievements: totalAchievements,
        quantifiedCount: totalAchievements,
        quantificationRate: totalAchievements > 0 ? 100 : 0,
        metricTypes: {
          percentages: (jdText.match(/\d+%/g) || []).length,
          monetaryValues: (jdText.match(/\$\d+/g) || []).length,
          timeReductions: 0,
          efficiencyGains: 0,
          scaleMetrics: 0,
        },
      },
      responsibilityMatch: {
        matchedResponsibilities: 0,
        totalResponsibilities: 0,
        matchPercentage: 50,
      },
      gaps: [],
    };
  }

  /**
   * Analyze keywords in detail
   */
  private analyzeKeywords(
    resumeText: string,
    jdKeywords: any,
  ): KeywordAnalysis {
    const resumeLower = resumeText.toLowerCase();
    const wordCount = resumeText.split(/\s+/).length;

    const foundKeywords: KeywordMatch[] = jdKeywords.all
      .filter((keyword: string) => {
        const escaped = this.escapeRegex(keyword);
        return new RegExp(`\\b${escaped}\\b`, "i").test(resumeLower);
      })
      .map((keyword: string) => {
        const escaped = this.escapeRegex(keyword);
        const frequency = (resumeLower.match(new RegExp(escaped, "gi")) || [])
          .length;
        return {
          keyword,
          category: "Technical Skill" as const,
          frequency,
          locations: [],
          context: [],
          relevanceScore: Math.min(100, frequency * 10),
        };
      });

    const missingKeywords: KeywordGap[] = jdKeywords.all
      .filter((keyword: string) => {
        const escaped = this.escapeRegex(keyword);
        return !new RegExp(`\\b${escaped}\\b`, "i").test(resumeLower);
      })
      .map((keyword: string) => ({
        keyword,
        category: "Technical Skill" as const,
        importance: "High" as const,
        frequency: 1,
        suggestions: [`Add ${keyword} to relevant sections`],
      }));

    const keywordCount = foundKeywords.length;
    const density = (keywordCount / wordCount) * 100;

    return {
      totalKeywords: jdKeywords.all.length,
      foundKeywords,
      missingKeywords,
      keywordDensity: {
        overall: density,
        bySection: {},
      },
      keywordDistribution: {
        summary: 0,
        experience: 0,
        skills: keywordCount,
        projects: 0,
      },
      overusedKeywords: [],
      semanticKeywords: [],
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(input: {
    atsBreakdown: ScoreBreakdown["ats"];
    jobMatchBreakdown: ScoreBreakdown["jobMatch"];
    sectionAnalysis: SectionAnalysis;
    skillsAnalysis: SkillsAnalysis;
    experienceAnalysis: ExperienceAnalysis;
    keywordAnalysis: KeywordAnalysis;
  }): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { sectionAnalysis, skillsAnalysis, keywordAnalysis } = input;

    // Critical: Missing sections
    if (!sectionAnalysis.summary.present) {
      recommendations.push({
        id: "rec-001",
        category: "Content",
        priority: "Critical",
        title: "Add Professional Summary",
        description: "Your resume is missing a professional summary section.",
        impact: "High",
        effort: "Low",
        actionItems: [
          {
            id: "action-001",
            action:
              "Write a 3-5 sentence summary highlighting your key qualifications",
            section: "Summary",
            example:
              'Example: "Senior Software Engineer with 5+ years of experience..."',
            completed: false,
          },
        ],
        estimatedScoreImprovement: 15,
      });
    }

    if (!sectionAnalysis.experience.present) {
      recommendations.push({
        id: "rec-002",
        category: "Experience",
        priority: "Critical",
        title: "Add Work Experience",
        description: "Your resume is missing work experience.",
        impact: "High",
        effort: "High",
        actionItems: [
          {
            id: "action-002",
            action:
              "Add your relevant work experience with detailed descriptions",
            section: "Experience",
            completed: false,
          },
        ],
        estimatedScoreImprovement: 25,
      });
    }

    // High: Skills gaps
    if (skillsAnalysis.missingSkills.length > 0) {
      recommendations.push({
        id: "rec-003",
        category: "Skills",
        priority: "High",
        title: "Address Skills Gaps",
        description: `You're missing ${skillsAnalysis.missingSkills.length} required skills.`,
        impact: "High",
        effort: "Medium",
        actionItems: skillsAnalysis.missingSkills
          .slice(0, 5)
          .map((skill, i) => ({
            id: `action-003-${i}`,
            action: `Add ${skill.name} to your skills or experience section`,
            section: "Skills",
            completed: false,
          })),
        estimatedScoreImprovement: 20,
      });
    }

    // Medium: Keyword optimization
    if (keywordAnalysis.missingKeywords.length > 5) {
      recommendations.push({
        id: "rec-004",
        category: "Keywords",
        priority: "Medium",
        title: "Optimize Keywords",
        description: `Add ${keywordAnalysis.missingKeywords.length} missing keywords from the job description.`,
        impact: "Medium",
        effort: "Low",
        actionItems: keywordAnalysis.missingKeywords
          .slice(0, 5)
          .map((kw, i) => ({
            id: `action-004-${i}`,
            action: `Incorporate "${kw.keyword}" naturally in your resume`,
            section: "Experience",
            completed: false,
          })),
        estimatedScoreImprovement: 10,
      });
    }

    // Medium: Projects section
    if (!sectionAnalysis.projects.present) {
      recommendations.push({
        id: "rec-005",
        category: "Structure",
        priority: "Medium",
        title: "Add Projects Section",
        description:
          "Adding projects showcases practical application of your skills.",
        impact: "Medium",
        effort: "Medium",
        actionItems: [
          {
            id: "action-005",
            action:
              "Add 2-3 relevant projects with descriptions and technologies used",
            section: "Projects",
            completed: false,
          },
        ],
        estimatedScoreImprovement: 10,
      });
    }

    return recommendations;
  }

  // Utility methods
  private calculateYearsOfExperience(experience: any[]): number {
    if (!experience || experience.length === 0) return 0;

    let totalMonths = 0;
    experience.forEach((exp) => {
      if (exp.startDate) {
        // Parse start date - handle various string formats
        const start = this.parseDate(exp.startDate);
        const end = exp.current || !exp.endDate 
          ? new Date() 
          : this.parseDate(exp.endDate);
        
        if (start && !isNaN(start.getTime())) {
          totalMonths +=
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());
        }
      }
    });

    return Math.round(totalMonths / 12);
  }

  private parseDate(dateStr: string | Date): Date {
    if (dateStr instanceof Date) return dateStr;
    
    const str = dateStr as string;
    if (!str) return new Date();
    
    // Try parsing common date formats
    const formats = [
      // "Jan 2023", "January 2023"
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(\d{4})/i,
      // "01/2023", "1/2023"
      /^(\d{1,2})\/(\d{4})/,
      // "2023-01", "2023-01-15"
      /^(\d{4})-(\d{1,2})/,
      // "2023"
      /^(\d{4})$/,
    ];
    
    // Format 1: Month Year
    let match = str.match(formats[0]);
    if (match) {
      const months: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = months[match[1].toLowerCase().slice(0, 3)] || 0;
      const year = parseInt(match[2]);
      return new Date(year, month, 1);
    }
    
    // Format 2: MM/YYYY
    match = str.match(formats[1]);
    if (match) {
      const month = parseInt(match[1]) - 1;
      const year = parseInt(match[2]);
      return new Date(year, month, 1);
    }
    
    // Format 3: YYYY-MM
    match = str.match(formats[2]);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      return new Date(year, month, 1);
    }
    
    // Format 4: YYYY
    match = str.match(formats[3]);
    if (match) {
      const year = parseInt(match[1]);
      return new Date(year, 0, 1);
    }
    
    // Fallback: try native Date parsing
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private calculateDuration(
    start: string,
    end?: string,
    current?: boolean,
  ): number {
    if (!start) return 0;
    const startDate = new Date(start);
    const endDate = current || !end ? new Date() : new Date(end);
    return Math.max(
      0,
      Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
      ),
    );
  }

  private categorizeSkill(skill: string): any {
    return "Domain Knowledge";
  }

  private getCategoryName(key: string): any {
    const names: Record<string, string> = {
      programmingLanguages: "Programming Language",
      frontendFrameworks: "Framework",
      backendFrameworks: "Framework",
      databases: "Database",
      devopsTools: "DevOps Tool",
    };
    return names[key] || "Technical Skill";
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private calculateConfidenceScore(resume: ResumeContent, jd: string): number {
    let score = 100;
    if (!resume.summary) score -= 10;
    if (!resume.experience || resume.experience.length === 0) score -= 20;
    if (!resume.skills || resume.skills.length === 0) score -= 15;
    if (jd.length < 100) score -= 10;
    return Math.max(0, score);
  }

  private assessDataQuality(
    text: string,
  ): "Excellent" | "Good" | "Fair" | "Poor" {
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 500) return "Excellent";
    if (wordCount > 200) return "Good";
    if (wordCount > 50) return "Fair";
    return "Poor";
  }

  private calculateCompletenessScore(resume: ResumeContent): number {
    let score = 0;
    if (resume.summary) score += 15;
    if (resume.experience && resume.experience.length > 0) score += 30;
    if (resume.skills && resume.skills.length > 0) score += 20;
    if (resume.education && resume.education.length > 0) score += 15;
    if (resume.projects && resume.projects.length > 0) score += 10;
    return Math.min(100, score);
  }
}

// Export singleton instance
export const resumeAnalysisService = new ResumeAnalysisService();
