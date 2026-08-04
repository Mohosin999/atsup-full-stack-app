import {
  ScoreComponent,
  ScoringFactor,
  AnalysisConfig,
  DEFAULT_ANALYSIS_CONFIG,
} from "../../../shared/types";

/**
 * Abstract base class for all score calculators
 * Implements common scoring logic and validation
 */
export abstract class ScoreCalculator {
  protected config: AnalysisConfig;

  constructor(config: AnalysisConfig = DEFAULT_ANALYSIS_CONFIG) {
    this.config = config;
  }

  /**
   * Calculate score component with detailed breakdown
   */
  abstract calculate(data: any): ScoreComponent;

  /**
   * Normalize score to 0-100 range
   */
  protected normalizeScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate weighted score from multiple factors
   */
  protected calculateWeightedScore(factors: ScoringFactor[]): number {
    if (factors.length === 0) return 0;

    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

    return this.normalizeScore(weightedSum / totalWeight);
  }

  /**
   * Determine quality rating based on score
   */
  protected getQualityRating(
    score: number,
  ): "Excellent" | "Good" | "Fair" | "Poor" {
    if (score >= this.config.thresholds.excellent) return "Excellent";
    if (score >= this.config.thresholds.good) return "Good";
    if (score >= this.config.thresholds.fair) return "Fair";
    return "Poor";
  }

  /**
   * Create a score component with standard structure
   */
  protected createScoreComponent(
    score: number,
    weight: number,
    details: string,
    factors: ScoringFactor[],
  ): ScoreComponent {
    return {
      score: this.normalizeScore(score),
      weight,
      maxScore: 100,
      details,
      factors,
    };
  }
}

/**
 * Keyword Matching Score Calculator (30% weight)
 * Evaluates how well resume keywords match job description
 */
export class KeywordMatchingCalculator extends ScoreCalculator {
  calculate(data: {
    resumeText: string;
    jdKeywords: string[];
    resumeKeywords: string[];
  }): ScoreComponent {
    const { resumeText, jdKeywords } = data;
    const resumeLower = resumeText.toLowerCase();

    const factors: ScoringFactor[] = [];
    let totalScore = 0;

    // Factor 1: Keyword Presence (60% of this component)
    const foundKeywords: string[] = [];
    const missingKeywords: string[] = [];

    jdKeywords.forEach((keyword) => {
      const escaped = this.escapeRegex(keyword);
      const regex = new RegExp(`\\b${escaped}\\b`, "i");

      if (regex.test(resumeLower)) {
        foundKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });

    const presenceScore =
      jdKeywords.length > 0
        ? (foundKeywords.length / jdKeywords.length) * 100
        : 100;

    factors.push({
      name: "Keyword Presence",
      score: this.normalizeScore(presenceScore),
      weight: 60,
      description: `${foundKeywords.length} of ${jdKeywords.length} keywords found`,
      evidence: foundKeywords.slice(0, 10),
    });

    // Factor 2: Keyword Density (25% of this component)
    let densityScore = 100;
    const keywordOccurrences = jdKeywords.reduce((count, keyword) => {
      const escaped = this.escapeRegex(keyword);
      const regex = new RegExp(escaped, "gi");
      const matches = resumeLower.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    const wordCount = resumeText.split(/\s+/).length;
    const density = (keywordOccurrences / wordCount) * 100;

    // Optimal density: 1-3%
    if (density < 0.5) densityScore = 40;
    else if (density < 1) densityScore = 70;
    else if (density <= 3) densityScore = 100;
    else if (density <= 5) densityScore = 80;
    else densityScore = 60;

    factors.push({
      name: "Keyword Density",
      score: this.normalizeScore(densityScore),
      weight: 25,
      description: `Keyword density: ${density.toFixed(2)}% (optimal: 1-3%)`,
    });

    // Factor 3: Keyword Distribution (15% of this component)
    const sections = ["summary", "experience", "skills", "projects"];
    const sectionsWithKeywords = sections.filter((section) => {
      const escaped = this.escapeRegex(section);
      const sectionRegex = new RegExp(`${escaped}`, "i");
      return sectionRegex.test(resumeLower);
    });

    const distributionScore =
      (sectionsWithKeywords.length / sections.length) * 100;

    factors.push({
      name: "Keyword Distribution",
      score: this.normalizeScore(distributionScore),
      weight: 15,
      description: `Keywords found in ${sectionsWithKeywords.length} of ${sections.length} sections`,
    });

    // Calculate total score
    totalScore = this.calculateWeightedScore(factors);

    // Apply bonus for critical keywords
    const criticalKeywordBonus = this.calculateCriticalKeywordBonus(
      foundKeywords,
      jdKeywords,
    );
    totalScore = Math.min(100, totalScore + criticalKeywordBonus);

    return this.createScoreComponent(
      totalScore,
      this.config.weights.keywordMatching,
      `${foundKeywords.length}/${jdKeywords.length} keywords matched | Density: ${density.toFixed(1)}%`,
      factors,
    );
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private calculateCriticalKeywordBonus(
    foundKeywords: string[],
    allKeywords: string[],
  ): number {
    // Bonus for matching high-frequency industry keywords
    const criticalKeywords = [
      "javascript",
      "typescript",
      "react",
      "node",
      "python",
      "aws",
      "docker",
      "kubernetes",
    ];

    const matchedCritical = criticalKeywords.filter(
      (k) =>
        foundKeywords.some((f) => f.toLowerCase().includes(k)) &&
        allKeywords.some((a) => a.toLowerCase().includes(k)),
    );

    return matchedCritical.length * 3; // 3 points per critical keyword
  }
}

/**
 * Skills Match Score Calculator (30% weight)
 * Evaluates alignment between resume skills and job requirements
 */
export class SkillsMatchCalculator extends ScoreCalculator {
  private skillAliases: Record<string, string[]> = {
    // Programming Languages
    javascript: ["js", "es6", "es2015", "ecmascript"],
    typescript: ["ts", "typescript"],
    python: ["python3", "python 3"],
    java: ["java", "java 8", "java 11"],

    // Frameworks
    react: ["reactjs", "react.js", "react hooks"],
    "react native": ["reactnative", "react-native"],
    "node.js": ["nodejs", "node", "express"],
    angular: ["angularjs", "angular 2+"],
    vue: ["vuejs", "vue.js"],
    nextjs: ["next.js", "next"],
    nestjs: ["nest.js", "nestjs"],

    // Databases
    mongodb: ["mongo", "mongoose"],
    postgresql: ["postgres", "psql"],
    mysql: ["mysql", "my sql"],

    // Cloud & DevOps
    aws: ["amazon web services", "ec2", "s3", "lambda"],
    docker: ["docker", "containerization"],
    kubernetes: ["k8s", "kubernetes"],
    "ci/cd": [
      "cicd",
      "ci cd",
      "continuous integration",
      "continuous deployment",
    ],

    // Tools
    git: ["git", "github", "gitlab", "bitbucket"],
  };

  calculate(data: {
    resumeSkills: string[];
    jdSkills: string[];
    jdRequiredSkills: string[];
    jdPreferredSkills: string[];
  }): ScoreComponent {
    const { resumeSkills, jdSkills, jdRequiredSkills, jdPreferredSkills } =
      data;

    const factors: ScoringFactor[] = [];

    // Normalize skills
    const normalizedResume = this.normalizeSkills(resumeSkills);
    const normalizedJD = this.normalizeSkills(jdSkills);
    const normalizedRequired = this.normalizeSkills(jdRequiredSkills);
    const normalizedPreferred = this.normalizeSkills(jdPreferredSkills);

    // Factor 1: Required Skills Match (50% weight)
    const requiredMatches = this.matchSkills(
      normalizedResume,
      normalizedRequired,
    );
    const requiredScore =
      normalizedRequired.length > 0
        ? (requiredMatches.length / normalizedRequired.length) * 100
        : 100;

    factors.push({
      name: "Required Skills Match",
      score: this.normalizeScore(requiredScore),
      weight: 50,
      description: `${requiredMatches.length} of ${normalizedRequired.length} required skills matched`,
      evidence: requiredMatches,
    });

    // Factor 2: Preferred Skills Match (30% weight)
    const preferredMatches = this.matchSkills(
      normalizedResume,
      normalizedPreferred,
    );
    const preferredScore =
      normalizedPreferred.length > 0
        ? (preferredMatches.length / normalizedPreferred.length) * 100
        : 100;

    factors.push({
      name: "Preferred Skills Match",
      score: this.normalizeScore(preferredScore),
      weight: 30,
      description: `${preferredMatches.length} of ${normalizedPreferred.length} preferred skills matched`,
      evidence: preferredMatches.slice(0, 10),
    });

    // Factor 3: Skill Depth (20% weight)
    const uniqueResumeSkills = new Set(normalizedResume);
    const depthScore = Math.min(100, 50 + uniqueResumeSkills.size * 3);

    factors.push({
      name: "Skill Depth",
      score: this.normalizeScore(depthScore),
      weight: 20,
      description: `${uniqueResumeSkills.size} unique skills identified`,
    });

    // Calculate weighted score
    let totalScore = this.calculateWeightedScore(factors);

    // Apply bonus for skill proficiency indicators
    const proficiencyBonus = this.calculateProficiencyBonus(resumeSkills);
    totalScore = Math.min(100, totalScore + proficiencyBonus);

    // Apply penalty for missing critical required skills
    const criticalPenalty = this.calculateCriticalPenalty(
      requiredMatches,
      normalizedRequired,
    );
    totalScore = Math.max(0, totalScore - criticalPenalty);

    return this.createScoreComponent(
      totalScore,
      this.config.weights.skillsMatch,
      `${requiredMatches.length}/${normalizedRequired.length} required | ${preferredMatches.length}/${normalizedPreferred.length} preferred`,
      factors,
    );
  }

  private normalizeSkills(skills: string[]): string[] {
    const normalized: string[] = [];

    skills.forEach((skill) => {
      const lower = skill.toLowerCase().trim();
      if (!lower) return;

      // Check if this skill is an alias of another
      let foundCanonical = false;
      for (const [canonical, aliases] of Object.entries(this.skillAliases)) {
        if (aliases.includes(lower) || lower === canonical) {
          if (!normalized.includes(canonical)) {
            normalized.push(canonical);
          }
          foundCanonical = true;
          break;
        }
      }

      // If no canonical form found, add as-is
      if (!foundCanonical && !normalized.includes(lower)) {
        normalized.push(lower);
      }
    });

    return normalized;
  }

  private matchSkills(resume: string[], jd: string[]): string[] {
    return jd.filter((jdSkill) => {
      return resume.some((resumeSkill) => {
        // Exact match
        if (resumeSkill === jdSkill) return true;
        // Partial match
        if (resumeSkill.includes(jdSkill) || jdSkill.includes(resumeSkill))
          return true;
        return false;
      });
    });
  }

  private calculateProficiencyBonus(skills: string[]): number {
    // Bonus for skills with proficiency indicators
    const proficiencyIndicators = [
      "expert",
      "advanced",
      "senior",
      "proficient",
      "specialized",
      "certified",
    ];

    const hasProficiency = skills.some((skill) =>
      proficiencyIndicators.some((indicator) =>
        skill.toLowerCase().includes(indicator),
      ),
    );

    return hasProficiency ? 5 : 0;
  }

  private calculateCriticalPenalty(
    matched: string[],
    required: string[],
  ): number {
    // Penalty for missing critical skills
    const criticalSkills = [
      "javascript",
      "typescript",
      "react",
      "node.js",
      "python",
    ];

    const missingCritical = required.filter(
      (skill) =>
        !matched.includes(skill) &&
        criticalSkills.some((c) => skill.toLowerCase().includes(c)),
    );

    return missingCritical.length * 10; // 10 points penalty per critical skill
  }
}

/**
 * Section Completeness Score Calculator (30% weight)
 * Evaluates presence and quality of critical resume sections
 */
export class SectionCompletenessCalculator extends ScoreCalculator {
  private criticalSections = [
    { name: "summary", label: "Professional Summary", minWords: 30 },
    { name: "skills", label: "Technical Skills", minItems: 5 },
    { name: "experience", label: "Work Experience", minEntries: 1 },
    { name: "projects", label: "Projects", minEntries: 1 },
  ];

  private optionalSections = [
    { name: "education", label: "Education" },
    { name: "achievements", label: "Achievements" },
    { name: "volunteer", label: "Volunteer Experience" },
  ];

  calculate(data: { resume: any; resumeText: string }): ScoreComponent {
    const { resume } = data;
    const factors: ScoringFactor[] = [];

    // Factor 1: Critical Sections Present (60% weight)
    let criticalScore = 0;
    const criticalDetails: string[] = [];

    this.criticalSections.forEach((section) => {
      const isPresent = this.checkSectionPresent(resume, section.name);
      const quality = isPresent
        ? this.evaluateSectionQuality(resume, section)
        : "Missing";

      if (isPresent) {
        criticalScore += 25; // Each critical section worth 25 points
        criticalDetails.push(`${section.label}: ${quality}`);
      } else {
        criticalDetails.push(`${section.label}: Missing`);
      }
    });

    factors.push({
      name: "Critical Sections",
      score: this.normalizeScore(criticalScore),
      weight: 60,
      description: `${criticalDetails.filter((d) => !d.includes("Missing")).length}/${this.criticalSections.length} critical sections present`,
      evidence: criticalDetails,
    });

    // Factor 2: Section Quality (25% weight)
    let qualityScore = 0;
    const qualityDetails: string[] = [];

    this.criticalSections.forEach((section) => {
      if (this.checkSectionPresent(resume, section.name)) {
        const quality = this.evaluateSectionQuality(resume, section);
        const sectionScore = this.getQualityScore(quality);
        qualityScore += sectionScore;
        qualityDetails.push(`${section.label}: ${quality}`);
      }
    });

    if (this.criticalSections.length > 0) {
      qualityScore /= this.criticalSections.length;
    }

    factors.push({
      name: "Section Quality",
      score: this.normalizeScore(qualityScore),
      weight: 25,
      description: "Average quality of present sections",
      evidence: qualityDetails,
    });

    // Factor 3: Optional Sections (15% weight)
    let optionalScore = 0;
    const optionalDetails: string[] = [];

    this.optionalSections.forEach((section) => {
      if (this.checkSectionPresent(resume, section.name)) {
        optionalScore += 25; // Each optional section worth 25 points (max 100)
        optionalDetails.push(`${section.label}: Present`);
      }
    });

    factors.push({
      name: "Additional Sections",
      score: this.normalizeScore(optionalScore),
      weight: 15,
      description: `${optionalDetails.length} optional sections present`,
      evidence: optionalDetails,
    });

    // Calculate total score
    const totalScore = this.calculateWeightedScore(factors);

    // Apply bonus for exceptional sections
    const excellenceBonus = this.calculateExcellenceBonus(resume);
    const finalScore = Math.min(100, totalScore + excellenceBonus);

    return this.createScoreComponent(
      finalScore,
      this.config.weights.sectionCompleteness,
      `${criticalDetails.filter((d) => !d.includes("Missing")).length}/${this.criticalSections.length} critical | ${optionalDetails.length} additional sections`,
      factors,
    );
  }

  private checkSectionPresent(resume: any, sectionName: string): boolean {
    const section = resume[sectionName];

    if (!section) return false;

    if (Array.isArray(section)) {
      return section.length > 0;
    }

    if (typeof section === "string") {
      return section.trim().length > 0;
    }

    return true;
  }

  private evaluateSectionQuality(
    resume: any,
    section: any,
  ): "Excellent" | "Good" | "Fair" | "Poor" {
    const sectionData = resume[section.name];

    if (!sectionData) return "Poor";

    if (section.minWords) {
      const wordCount = sectionData.split(/\s+/).length;
      if (wordCount >= section.minWords * 2) return "Excellent";
      if (wordCount >= section.minWords * 1.5) return "Good";
      if (wordCount >= section.minWords) return "Fair";
      return "Poor";
    }

    if (section.minItems) {
      const itemCount = Array.isArray(sectionData) ? sectionData.length : 0;
      if (itemCount >= section.minItems * 2) return "Excellent";
      if (itemCount >= section.minItems * 1.5) return "Good";
      if (itemCount >= section.minItems) return "Fair";
      return "Poor";
    }

    if (Array.isArray(sectionData)) {
      return sectionData.length > 0 ? "Good" : "Poor";
    }

    return "Fair";
  }

  private getQualityScore(quality: string): number {
    const scores: Record<string, number> = {
      Excellent: 100,
      Good: 75,
      Fair: 50,
      Poor: 25,
    };
    return scores[quality] || 0;
  }

  private calculateExcellenceBonus(resume: any): number {
    let bonus = 0;

    // Bonus for quantified achievements
    if (
      resume.experience?.some((exp: any) =>
        ((exp.highlights || []) as string[]).join(" ").match(/\d+%|\$\d+|\d+x/),
      )
    ) {
      bonus += 5;
    }

    // Bonus for projects with links
    if (resume.projects?.some((p: any) => p.links?.live || p.links?.github)) {
      bonus += 2;
    }

    return bonus;
  }
}

/**
 * Experience Relevance Score Calculator (10% weight)
 * Evaluates how relevant work experience is to the job
 */
export class ExperienceRelevanceCalculator extends ScoreCalculator {
  calculate(data: {
    resume: any;
    jdText: string;
    jdKeywords: string[];
  }): ScoreComponent {
    const { resume, jdText, jdKeywords } = data;
    const factors: ScoringFactor[] = [];

    const experience = resume.experience || [];

    console.log("[ExperienceRelevance] Experience array:", experience);
    console.log("[ExperienceRelevance] Experience length:", experience.length);
    console.log("[ExperienceRelevance] JD Keywords:", jdKeywords.length);

    // Factor 1: Keyword Match in Experience (40% weight)
    let keywordMatchScore = 0;
    let totalKeywordMatches = 0;

    experience.forEach((exp: any) => {
      const expText =
        `${exp.title} ${exp.company} ${(exp.highlights || []).join(" ")}`.toLowerCase();
      const matches = jdKeywords.filter((keyword) => {
        const escaped = this.escapeRegex(keyword);
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        return regex.test(expText);
      });
      totalKeywordMatches += matches.length;
    });

    if (experience.length > 0 && jdKeywords.length > 0) {
      keywordMatchScore = Math.min(
        100,
        (totalKeywordMatches / (experience.length * jdKeywords.length)) *
          100 *
          3,
      );
    }

    factors.push({
      name: "Experience Keywords",
      score: this.normalizeScore(keywordMatchScore),
      weight: 55,
      description: `${totalKeywordMatches} keyword matches across ${experience.length} positions`,
    });

    // Factor 2: Years of Experience (45% weight)
    const yearsExp = this.calculateYearsOfExperience(experience);
    const jdYears = this.extractJDYears(jdText);

    let yearsScore = 0;
    if (jdYears > 0 && yearsExp > 0) {
      if (yearsExp >= jdYears) yearsScore = 100;
      else if (yearsExp >= jdYears * 0.8) yearsScore = 80;
      else if (yearsExp >= jdYears * 0.6) yearsScore = 60;
      else yearsScore = 40;
    } else if (yearsExp > 0) {
      yearsScore = 70 + Math.min(30, yearsExp * 2);
    }

    factors.push({
      name: "Experience Duration",
      score: this.normalizeScore(yearsScore),
      weight: 45,
      description: `${yearsExp} years experience${jdYears > 0 ? ` (JD requires ${jdYears}+)` : ""}`,
    });

    // Calculate total score
    let totalScore = this.calculateWeightedScore(factors);

    // Apply bonus for career progression
    const progressionBonus = this.calculateProgressionBonus(experience);
    totalScore = Math.min(100, totalScore + progressionBonus);

    // Apply bonus for relevant job titles
    const titleBonus = this.calculateTitleBonus(experience, jdText);
    totalScore = Math.min(100, totalScore + titleBonus);

    return this.createScoreComponent(
      totalScore,
      this.config.weights.experienceRelevance,
      experience.length === 0
        ? "No work experience provided"
        : `${yearsExp} years | ${totalKeywordMatches} keyword matches`,
      factors,
    );
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private calculateYearsOfExperience(experience: any[]): number {
    let totalMonths = 0;

    experience.forEach((exp) => {
      if (exp.startDate) {
        const start = new Date(exp.startDate);
        const end =
          exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);

        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());

        totalMonths += Math.max(0, months);
      }
    });

    return Math.round(totalMonths / 12);
  }

  private extractJDYears(jdText: string): number {
    const match = jdText.match(/(\d+)\+?\s*(years?|yrs?)/i);
    return match ? parseInt(match[1]) : 0;
  }

  private calculateProgressionBonus(experience: any[]): number {
    if (experience.length < 2) return 0;

    const seniorityLevels = [
      "intern",
      "junior",
      "mid",
      "senior",
      "lead",
      "principal",
      "staff",
      "manager",
      "director",
      "vp",
      "cto",
    ];

    const getLevel = (title: string): number => {
      const lower = title.toLowerCase();
      for (let i = seniorityLevels.length - 1; i >= 0; i--) {
        if (lower.includes(seniorityLevels[i])) return i;
      }
      return -1;
    };

    const levels = experience
      .map((exp) => getLevel(exp.title))
      .filter((l) => l >= 0);

    if (levels.length < 2) return 0;

    // Check if there's progression (later jobs have higher levels)
    const hasProgression = levels[levels.length - 1] > levels[0];
    const isConsistent = levels.every((l, i) => i === 0 || l >= levels[i - 1]);

    let bonus = 0;
    if (hasProgression) bonus += 5;
    if (isConsistent) bonus += 5;

    return bonus;
  }

  private calculateTitleBonus(experience: any[], jdText: string): number {
    const jdLower = jdText.toLowerCase();

    const relevantTitles = [
      "engineer",
      "developer",
      "programmer",
      "architect",
      "consultant",
      "specialist",
    ];

    const hasRelevantTitle = experience.some((exp) =>
      relevantTitles.some((t) => exp.title?.toLowerCase().includes(t)),
    );

    const titleInJD = relevantTitles.some((t) => jdLower.includes(t));

    if (hasRelevantTitle && titleInJD) return 5;
    return 0;
  }
}
