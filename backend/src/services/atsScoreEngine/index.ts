import { ResumeContent } from "../../types";
import {
  StructuredJD,
  parseJobDescriptionToStructured,
} from "../jdParser";
import {
  extractSkillsFromResume,
  getSkillVariants,
  countVariantsInText,
  matchActionVerbs,
  countActionVerbInText,
} from "../analysis/keywordExtractor";
import { MEASURABLE_RESULTS } from "../analysis/skillDefinitions";

export interface LocalSectionScore {
  score: number;
  feedback: string;
}

export interface LocalSpellingError {
  type: "spelling" | "grammar" | "punctuation" | "formatting" | "redundancy";
  message: string;
  suggestion: string;
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

export interface LocalAtsResult {
  overallScore: number;
  sectionScores: {
    summary: LocalSectionScore & { wordCount?: number };
    experience: LocalSectionScore;
    projects: LocalSectionScore;
    skills: LocalSectionScore;
    contactInfo: LocalSectionScore & { hasContactInfo: boolean };
    measurableResults: LocalSectionScore & { count: number; found: string[] };
  };
  spellingGrammar: {
    score: number;
    errors: LocalSpellingError[];
  };
  atsFriendliness: number;
  suggestions: string[];
  matchBreakdown?: {
    hardSkills: MatchCategoryResult;
    softSkills: MatchCategoryResult;
    actionVerbs: MatchCategoryResult;
  };
}

// Weights: hardSkills 50% + actionVerbs 10% (incl. keywords) + softSkills 15% + education 10% + experience 10% + measurableResults 5%
const WEIGHTS = {
  hardSkills: 50,
  actionVerbs: 10,
  softSkills: 15,
  education: 10,
  experience: 10,
  measurableResults: 5,
};

const toResumeText = (resume: ResumeContent): string => {
  const parts: string[] = [];

  if (resume.personalInfo?.fullName) parts.push(resume.personalInfo.fullName);
  if (resume.personalInfo?.jobTitle) parts.push(resume.personalInfo.jobTitle);
  if (resume.summary) parts.push(resume.summary);

  (resume.experience || []).forEach((exp) => {
    parts.push(`${exp.title || ""} at ${exp.company || ""}`);
    parts.push((exp.highlights || []).join(" "));
  });

  parts.push((resume.skills || []).join(" "));

  (resume.projects || []).forEach((proj) => {
    parts.push(`${proj.name || ""}: ${(proj.highlights || []).join(" ")}`);
  });

  (resume.education || []).forEach((edu) => {
    parts.push(`${edu.degree || ""} from ${edu.institution || ""}`);
  });

  return parts.filter(Boolean).join("\n");
};

const buildMatchCategory = (
  resumeText: string,
  items: string[],
  isPresent: (text: string, item: string) => boolean,
): MatchCategoryResult => {
  if (!items || items.length === 0) {
    return { score: 0, matched: [], partial: [], missing: [], items: [] };
  }

  const results = items.map((item) => {
    const present = isPresent(resumeText, item);
    const status: MatchStatus = present ? "matched" : "missing";
    return {
      item,
      status,
      jdCount: 1,
      resumeCount: present ? 1 : 0,
      itemScore: present ? 100 : 0,
    };
  });

  const score = Math.round(
    results.reduce((sum, r) => sum + r.itemScore, 0) / results.length,
  );

  return {
    score,
    matched: results.filter((r) => r.status === "matched").map((r) => r.item),
    partial: [],
    missing: results.filter((r) => r.status === "missing").map((r) => r.item),
    items: results.map(({ item, status, jdCount, resumeCount }) => ({
      item,
      status,
      jdCount,
      resumeCount,
    })),
  };
};

const educationScore = (
  resume: ResumeContent,
  educationRequirement: StructuredJD["educationRequirement"],
): number => {
  const eduText = (resume.education || [])
    .map((edu) => `${edu.degree} ${edu.institution}`)
    .join(" ")
    .toLowerCase();

  if (!educationRequirement) return 70;

  const parts = educationRequirement
    .split("|")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (parts.length === 0) return 70;

  let matchedParts = 0;
  parts.forEach((part) => {
    const keywords = part
      .replace(/['’]s\b/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2);

    if (keywords.length === 0) {
      if (eduText.includes(part)) matchedParts++;
      return;
    }

    if (keywords.some((word) => eduText.includes(word))) matchedParts++;
  });

  if (matchedParts >= parts.length) return 100;
  if (matchedParts >= 1) return 70;
  return 30;
};

const calculateYearsOfExperience = (resume: ResumeContent): number => {
  let totalMonths = 0;
  (resume.experience || []).forEach((exp) => {
    if (!exp.startDate) return;
    const start = new Date(exp.startDate);
    const end =
      exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    totalMonths += Math.max(
      0,
      (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()),
    );
  });
  return Math.round(totalMonths / 12);
};

const experienceYearsScore = (
  resumeYears: number,
  requiredYears: number,
): number => {
  if (requiredYears <= 0) return 70;
  if (resumeYears >= requiredYears) return 100;
  if (resumeYears >= requiredYears * 0.8) return 80;
  if (resumeYears >= requiredYears * 0.6) return 60;
  if (resumeYears >= requiredYears * 0.4) return 40;
  return 20;
};

const countMeasurableResults = (
  resume: ResumeContent,
): { count: number; found: string[] } => {
  const text = (resume.experience || [])
    .flatMap((exp) => exp.highlights || [])
    .join(" ");

  if (!text.trim()) return { count: 0, found: [] };

  const matches: string[] = [];
  MEASURABLE_RESULTS.forEach(({ pattern }) => {
    const regex = new RegExp(pattern, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[0].trim());
    }
  });

  const found = [...new Set(matches)].slice(0, 5);
  return { count: matches.length, found };
};

const measurableResultsScore = (count: number): number => {
  if (count >= 5) return 100;
  return Math.round((count / 5) * 100);
};

const checkSpellingGrammar = (text: string): { score: number; errors: LocalSpellingError[] } => {
  const errors: LocalSpellingError[] = [];

  const repeated = text.match(/\b([a-zA-Z]{3,})\s+\1\b/g);
  if (repeated) {
    repeated.slice(0, 10).forEach((match) => {
      errors.push({
        type: "grammar",
        message: `Repeated word detected: "${match}"`,
        suggestion: "Remove the duplicated word.",
      });
    });
  }

  const doubleSpaces = text.match(/[.!?]\s{3,}[A-Z]/g);
  if (doubleSpaces) {
    doubleSpaces.slice(0, 5).forEach(() => {
      errors.push({
        type: "punctuation",
        message: "Multiple consecutive spaces found after punctuation.",
        suggestion: "Use a single space after punctuation.",
      });
    });
  }

  return {
    score: errors.length === 0 ? 100 : Math.max(60, 100 - errors.length * 8),
    errors,
  };
};

export const calculateLocalMatchScore = (
  resume: ResumeContent,
  structuredJD?: StructuredJD | null,
  rawJD?: string,
): LocalAtsResult => {
  const jd = structuredJD || (rawJD ? parseJobDescriptionToStructured(rawJD) : null);

  const resumeText = toResumeText(resume);
  const resumeSkills = extractSkillsFromResume(resume);
  const resumeHardSkills =
    resume.hardSkills && resume.hardSkills.length > 0
      ? resume.hardSkills
      : resumeSkills;
  const resumeYears = calculateYearsOfExperience(resume);

  const scores: Record<keyof typeof WEIGHTS, number> = {
    hardSkills: 0,
    actionVerbs: 0,
    softSkills: 0,
    education: 0,
    experience: 0,
    measurableResults: 0,
  };
  const suggestions: string[] = [];

  const measurable = countMeasurableResults(resume);
  const measurableScore = measurableResultsScore(measurable.count);
  scores.measurableResults = measurableScore;

  const resumeActionVerbs = matchActionVerbs(resumeText);

  let matchBreakdown: LocalAtsResult["matchBreakdown"];

  if (jd) {
    const isSkillPresent = (text: string, item: string) =>
      countVariantsInText(text, getSkillVariants(item)) > 0;
    const isActionVerbPresent = (text: string, item: string) =>
      countActionVerbInText(text, item) > 0;

    const hardSkillsMatch = buildMatchCategory(
      resumeText,
      jd.hardSkills,
      isSkillPresent,
    );
    const softSkillsMatch = buildMatchCategory(
      resumeText,
      jd.softSkills,
      isSkillPresent,
    );
    const actionVerbsMatch = buildMatchCategory(
      resumeText,
      jd.actionVerbs,
      isActionVerbPresent,
    );

    scores.hardSkills = hardSkillsMatch.score;
    scores.actionVerbs = actionVerbsMatch.score;
    scores.softSkills = softSkillsMatch.score;
    scores.education = educationScore(resume, jd.educationRequirement);
    scores.experience = experienceYearsScore(
      resumeYears,
      jd.experienceYearsRequired,
    );

    matchBreakdown = {
      hardSkills: hardSkillsMatch,
      softSkills: softSkillsMatch,
      actionVerbs: actionVerbsMatch,
    };

    if (hardSkillsMatch.missing.length > 0) {
      suggestions.push(
        `Add missing required skills: ${hardSkillsMatch.missing.slice(0, 5).join(", ")}`,
      );
    }

    if (softSkillsMatch.missing.length > 0) {
      suggestions.push(
        `Job expects soft skills you can highlight: ${softSkillsMatch.missing.slice(0, 5).join(", ")}`,
      );
    }

    if (actionVerbsMatch.missing.length > 0) {
      suggestions.push(
        `Use action verbs the job description emphasizes: ${actionVerbsMatch.missing.slice(0, 5).join(", ")}`,
      );
    }

    if (jd.experienceYearsRequired > 0 && resumeYears < jd.experienceYearsRequired) {
      suggestions.push(
        `Job requires ${jd.experienceYearsRequired}+ years; your resume shows ${resumeYears} years.`,
      );
    }

    if (jd.educationRequirement && scores.education < 60) {
      suggestions.push(
        `Job expects ${jd.educationRequirement.replace("|", " in ")}. Highlight your education.`,
      );
    }
  } else {
    scores.hardSkills =
      resumeSkills.length > 0
        ? Math.min(100, 55 + resumeSkills.length * 3)
        : 20;
    scores.actionVerbs =
      resumeActionVerbs.length > 0
        ? Math.min(100, 55 + resumeActionVerbs.length * 3)
        : 20;
    scores.softSkills = 70;
    scores.education =
      (resume.education || []).length > 0 ? 80 : 50;
    scores.experience = resumeYears >= 1 ? 80 : 50;

    if ((resume.experience || []).length === 0) {
      suggestions.push("Add work experience with detailed descriptions.");
    }
  }

  if ((resume.skills || []).length < 5) {
    suggestions.push("Add a dedicated skills section with at least 5 technical skills.");
  }
  if (measurable.count < 5) {
    suggestions.push(
      `Add at least ${5 - measurable.count} more measurable results to your work experience (e.g. "reduced load time by 40%", "increased sales by 30%", "saved 10 hours/week").`,
    );
  }
  if (resumeActionVerbs.length < 5) {
    suggestions.push(
      `Use at least ${5 - resumeActionVerbs.length} more action verbs (e.g. "developed", "implemented", "led", "optimized") when describing your experience.`,
    );
  }
  if (!resume.summary || resume.summary.split(/\s+/).length < 30) {
    suggestions.push("Add a professional summary of at least 30 words.");
  }
  if ((resume.projects || []).length === 0) {
    suggestions.push("Add a projects section to showcase practical work.");
  }

  const totalWeight = Object.values(WEIGHTS).reduce((sum, w) => sum + w, 0);
  const overallScore = Math.round(
    Object.entries(WEIGHTS).reduce(
      (sum, [key, weight]) => sum + scores[key as keyof typeof WEIGHTS] * weight,
      0,
    ) / totalWeight,
  );

  const summaryWords = (resume.summary || "").split(/\s+/).filter(Boolean).length;
  const summaryScore =
    summaryWords >= 50 ? 90 : summaryWords >= 30 ? 75 : summaryWords > 0 ? 55 : 20;

  const experienceCount = (resume.experience || []).length;
  const experienceSectionScore =
    experienceCount >= 2
      ? Math.max(scores.experience, 70)
      : experienceCount === 1
        ? Math.max(scores.experience, 55)
        : 25;

  const projectCount = (resume.projects || []).length;
  const projectsScore =
    projectCount >= 2 ? 85 : projectCount === 1 ? 70 : 40;

  const contact = resume.personalInfo?.contact || {};
  const hasContactInfo = !!(
    contact.email ||
    (resume.personalInfo as any)?.phone ||
    contact.phone ||
    contact.linkedIn
  );
  const contactScore = hasContactInfo
    ? contact.email
      ? 90
      : 70
    : 40;

  const spellingGrammar = checkSpellingGrammar(resumeText);

  const structureFactors = [
    summaryWords >= 30,
    (resume.skills || []).length >= 5,
    experienceCount > 0,
    (resume.education || []).length > 0,
    hasContactInfo,
  ];
  const presentCount = structureFactors.filter(Boolean).length;
  const atsFriendliness = Math.round(40 + presentCount * 12);

  return {
    overallScore,
    sectionScores: {
      summary: {
        score: summaryScore,
        feedback:
          summaryWords >= 30
            ? `Summary present with ${summaryWords} words.`
            : summaryWords > 0
              ? "Summary is too short. Expand to at least 30 words."
              : "No professional summary found.",
        wordCount: summaryWords,
      },
      experience: {
        score: experienceSectionScore,
        feedback:
          experienceCount > 0
            ? `${experienceCount} position(s), ${resumeYears} year(s) total.`
            : "No work experience listed.",
      },
      projects: {
        score: projectsScore,
        feedback:
          projectCount > 0
            ? `${projectCount} project(s) found.`
            : "No projects section found.",
      },
      skills: {
        score: Math.round(scores.hardSkills),
        feedback: jd
          ? `${jd.hardSkills.length} required hard skills from the job description matched.`
          : `${resumeHardSkills.length} hard skills identified on resume.`,
      },
      contactInfo: {
        score: contactScore,
        feedback: hasContactInfo
          ? "Contact information found."
          : "Contact information is missing.",
        hasContactInfo,
      },
      measurableResults: {
        score: measurableScore,
        count: measurable.count,
        found: measurable.found,
        feedback:
          measurable.count >= 5
            ? `${measurable.count} measurable results found. Great impact evidence!`
            : measurable.count > 0
              ? `${measurable.count} of 5+ recommended measurable results found in work experience.`
              : "No measurable results found. Quantify achievements with numbers (e.g. %, $, time saved).",
      },
    },
    spellingGrammar,
    atsFriendliness,
    suggestions: [...new Set(suggestions)].slice(0, 8),
    ...(matchBreakdown ? { matchBreakdown } : {}),
  };
};
