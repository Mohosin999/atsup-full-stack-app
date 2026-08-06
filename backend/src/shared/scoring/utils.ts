import {
  LocalSpellingError,
  MatchCategoryResult,
  CategoryCheck,
  CategorySubgroup,
} from "./types";
import {
  extractSkillsFromResume,
  getSkillVariants,
  countVariantsInText,
  matchActionVerbs,
  countActionVerbInText,
} from "./keywords";
import { ATS_DATE_RE, MEASURABLE_RESULT_RE } from "./constants";
import { ResumeContent } from "../types";

export const toResumeText = (resume: ResumeContent): string => {
  const parts: string[] = [];

  if (resume.personalInfo?.fullName) parts.push(resume.personalInfo.fullName);
  if (resume.personalInfo?.jobTitle) parts.push(resume.personalInfo.jobTitle);
  if (resume.summary) parts.push(resume.summary);

  resume.experience?.forEach((exp) => {
    parts.push(`${exp.title || ""} at ${exp.company || ""}`);
    parts.push((exp.highlights || []).join(" "));
  });

  parts.push((resume.skills || []).join(" "));
  if (resume.hardSkills?.length) parts.push(resume.hardSkills.join(" "));
  if (resume.softSkills?.length) parts.push(resume.softSkills.join(" "));
  if (resume.keywords?.length) parts.push(resume.keywords.join(" "));
  if (resume.actionVerbs?.length) parts.push(resume.actionVerbs.join(" "));

  resume.projects?.forEach((proj) => {
    parts.push(`${proj.name || ""}: ${(proj.highlights || []).join(" ")}`);
  });

  resume.education?.forEach((edu) => {
    parts.push(`${edu.degree || ""} from ${edu.institution || ""}`);
  });

  return parts.filter(Boolean).join("\n");
};

export const buildMatchCategory = (
  resumeText: string,
  items: string[],
  isPresent: (text: string, item: string) => boolean,
): MatchCategoryResult => {
  if (!items?.length) {
    return { score: 0, matched: [], partial: [], missing: [], items: [] };
  }

  const results = items.map((item) => {
    const present = isPresent(resumeText, item);
    return {
      item,
      status: present ? ("matched" as const) : ("missing" as const),
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

export const scoreFromChecks = (checks: CategoryCheck[]): number => {
  let earned = 0,
    total = 0;
  for (const c of checks) {
    if (c.status === "na" || c.weight <= 0) continue;
    total += c.weight;
    if (c.status === "passed") earned += c.weight;
    else if (c.status === "partial") earned += c.weight * 0.5;
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
};

export const scoreFromSubgroups = (subgroups: CategorySubgroup[]): number => {
  let earned = 0,
    total = 0;
  for (const s of subgroups) {
    total += s.weight;
    earned += (s.score / 100) * s.weight;
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
};

export const deriveFeedback = (checks: CategoryCheck[]) => {
  const strengths: string[] = [];
  const improvements: string[] = [];
  for (const c of checks) {
    if (c.status === "na") continue;
    if (c.status === "passed") strengths.push(c.detail);
    else improvements.push(`${c.label}: ${c.detail}`);
  }
  return { strengths, improvements };
};

export const educationScore = (
  resume: ResumeContent,
  educationRequirement?: string | null,
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
  if (!parts.length) return 70;

  let matchedParts = 0;
  for (const part of parts) {
    const keywords = part
      .replace(/['']s\b/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);
    if (!keywords.length) {
      if (eduText.includes(part)) matchedParts++;
    } else if (keywords.some((w) => eduText.includes(w))) {
      matchedParts++;
    }
  }

  if (matchedParts >= parts.length) return 100;
  if (matchedParts >= 1) return 70;
  return 30;
};

export const calculateYearsOfExperience = (resume: ResumeContent): number => {
  let totalMonths = 0;
  resume.experience?.forEach((exp) => {
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

export const countMeasurableResults = (resume: ResumeContent) => {
  const highlights = (resume.experience || [])
    .flatMap((exp) => exp.highlights || [])
    .filter((h) => MEASURABLE_RESULT_RE.test(h));
  return { count: highlights.length, found: highlights.slice(0, 5) };
};

export const measurableResultsScore = (count: number): number =>
  count >= 5 ? 100 : Math.round((count / 5) * 100);

export const checkSpellingGrammar = (text: string) => {
  const errors: LocalSpellingError[] = [];

  const repeated = text.match(/\b([a-zA-Z]{3,})\s+\1\b/g);
  repeated?.slice(0, 10).forEach((match) => {
    errors.push({
      type: "grammar",
      message: `Repeated word detected: "${match}"`,
      suggestion: "Remove the duplicated word.",
    });
  });

  const doubleSpaces = text.match(/[.!?]\s{3,}[A-Z]/g);
  doubleSpaces?.slice(0, 5).forEach(() => {
    errors.push({
      type: "punctuation",
      message: "Multiple consecutive spaces found after punctuation.",
      suggestion: "Use a single space after punctuation.",
    });
  });

  return {
    score: errors.length === 0 ? 100 : Math.max(60, 100 - errors.length * 8),
    errors,
  };
};

export const collectResumeDates = (resume: ResumeContent): string[] => {
  const dates: string[] = [];
  const push = (raw?: string) => {
    if (!raw) return;
    raw
      .split(/\s*(?:–|-|to)\s*/i)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => dates.push(p));
  };
  resume.experience?.forEach((exp) => {
    push(exp.startDate);
    if (!exp.current) push(exp.endDate);
  });
  resume.projects?.forEach((proj) => {
    push(proj.startDate);
    if (!proj.current) push(proj.endDate);
  });
  resume.education?.forEach((edu) => push((edu as any).date));
  return dates;
};

export {
  extractSkillsFromResume,
  getSkillVariants,
  countVariantsInText,
  matchActionVerbs,
  countActionVerbInText,
};
