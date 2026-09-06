import {
  MatchCategoryResult,
  CategoryCheck,
  CategorySubgroup,
  jdEducationType,
} from "./types";
import {
  extractSkillsFromResume,
  getSkillVariants,
  countVariantsInText,
} from "./keywords";
import { ResumeContent } from "../types";

export const toResumeText = (resume: ResumeContent): string => {
  const parts: string[] = [];

  if (resume.personalInfo?.fullName) parts.push(resume.personalInfo.fullName);
  if (resume.personalInfo?.jobTitle) parts.push(resume.personalInfo.jobTitle);
  if (resume.summary) parts.push(resume.summary);

  resume.experience?.forEach((exp) => {
    parts.push(`${exp.role || ""} at ${exp.company || ""}`);
    parts.push((exp.responsibilities || []).join(" "));
  });

  if (resume.skills?.hardSkills?.length)
    parts.push(resume.skills.hardSkills.join(" "));
  if (resume.skills?.softSkills?.length)
    parts.push(resume.skills.softSkills.join(" "));

  resume.education?.forEach((edu) => {
    parts.push(`${edu.degree || ""} || ""}`);
  });

  resume.projects?.forEach((proj) => {
    parts.push(`${proj.name || ""}: ${(proj.description || []).join(" ")}`);
  });

  return parts.filter(Boolean).join("\n");
};

export const buildMatchCategory = (
  resumeText: string,
  items: string[],
  isPresent: (text: string, item: string) => boolean,
): MatchCategoryResult => {
  if (!items?.length) {
    return { score: 0, matched: [], missing: [], items: [] };
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
    missing: results.filter((r) => r.status === "missing").map((r) => r.item),
    items: results.map(({ item, status, jdCount, resumeCount }) => ({
      item,
      status,
      jdCount,
      resumeCount,
    })),
  };
};

// ============================================================
// Score from checks
// ============================================================
export const scoreFromChecks = (checks: CategoryCheck[]): number => {
  let earned = 0,
    total = 0;
  for (const c of checks) {
    if (c.status === "not-applicable" || c.weight <= 0) continue;
    total += c.weight;
    if (c.status === "passed") earned += c.weight;
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
};

export const scoreFromSubgroups = (subgroups: CategorySubgroup[]): number => {
  let earned = 0,
    total = 0;
  for (const s of subgroups) {
    const allNotApplicable = s.checks.every((c) => c.status === "not-applicable");
    if (allNotApplicable) continue;
    total += s.weight;
    earned += (s.score / 100) * s.weight;
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
};

export const deriveFeedback = (checks: CategoryCheck[]) => {
  const strengths: string[] = [];
  const improvements: string[] = [];
  for (const c of checks) {
    if (c.status === "not-applicable" || c.weight <= 0) continue;
    if (c.status === "passed") strengths.push(c.detail);
    else improvements.push(`${c.label}: ${c.detail}`);
  }
  return { strengths, improvements };
};


// ============================================================
// Education match score
// ============================================================
export const educationScore = (
  resume: ResumeContent,
  jdEducation?: jdEducationType | null,
): number => {
  const resumeEdu = resume.education || [];
  const LEVEL_RANK: Record<string, number> = {
    "high school": 1,
    secondary: 1,
    diploma: 2,
    associate: 2,
    "associate's degree": 2,
    bachelor: 3,
    "bachelor's": 3,
    "bachelor's degree": 3,
    undergraduate: 3,
    bsc: 3,
    ba: 3,
    master: 4,
    "master's": 4,
    "master's degree": 4,
    msc: 4,
    ma: 4,
    mba: 4,
    postgraduate: 4,
    phd: 5,
    doctorate: 5,
    doctoral: 5,
  };

  const getRank = (text: string): number => {
    const t = text.toLowerCase();
    let bestRank = 0;
    for (const key in LEVEL_RANK) {
      if (t.includes(key)) {
        bestRank = Math.max(bestRank, LEVEL_RANK[key]);
      }
    }
    return bestRank;
  };

  if (!jdEducation || !jdEducation.education_level) {
    return 0;
  }
  if (!resumeEdu.length) return 0;
  const jdRank = getRank(jdEducation.education_level);

  const resumeRanks = resumeEdu.map((edu) =>
    getRank(`${edu.degree} ${edu.field} ${edu.education_level}`),
  );
  const resumeMaxRank = Math.max(...resumeRanks, 0);
  if (jdRank === 0) {
    const eduText = resumeEdu
      .map((edu) => `${edu.degree} ${edu.field} ${edu.education_level}`)
      .join(" ")
      .toLowerCase();
    const jdLevel = jdEducation.education_level.toLowerCase().trim();
    return eduText.includes(jdLevel) ? 100 : 45;
  }

  if (resumeMaxRank === 0) return 45;
  if (resumeMaxRank === jdRank) return 100;
  if (resumeMaxRank > jdRank) return 95;
  if (resumeMaxRank === jdRank - 1) return 55; 
  return 30;
};

// ============================================================
// Years of experience from parsed field - senior-grade unit-aware
// Handles: "6 months" => 0.5, "1 year 6 months" => 1.5, "1.5 years" => 1.5, "18 months" => 1.5
// ============================================================
export const parseYearsOfExperience = (raw?: string | number | null): number => {
  if (raw == null || raw === "") return 0;
  if (typeof raw === "number") return isNaN(raw) ? 0 : Math.round(raw * 10) / 10;
  const str = String(raw).toLowerCase().trim();
  if (!str) return 0;

  let totalYears = 0;
  let foundUnit = false;

  // Match years: 1 year, 2 years, 1.5 years, 3 yrs, 2 yr, 1 y (word boundary)
  const yearRe = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\b/g;
  let m: RegExpExecArray | null;
  while ((m = yearRe.exec(str)) !== null) {
    totalYears += parseFloat(m[1]);
    foundUnit = true;
  }

  // Match months: 6 months, 18 months, 6 mos, 6 mo
  const monthRe = /(\d+(?:\.\d+)?)\s*(?:months?|mos?)\b/g;
  while ((m = monthRe.exec(str)) !== null) {
    totalYears += parseFloat(m[1]) / 12;
    foundUnit = true;
  }

  if (foundUnit) return Math.round(totalYears * 10) / 10;

  // Fallback: no unit found — treat bare numbers as years (legacy) e.g. "3" or "1-2"
  const nums = str.match(/\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
};

// Fallback: compute years from experience date ranges when yearsOfExperience is empty/0
export const computeYearsFromExperienceDates = (resume: ResumeContent): number => {
  if (!resume.experience?.length) return 0;

  const MONTH_MAP: Record<string, number> = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8,
    oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
  };

  const parseDate = (raw: string): Date | null => {
    const s = raw.trim().toLowerCase();
    if (!s || /^(present|current|now|ongoing|till date)$/.test(s)) return new Date();
    // Try native parse first for ISO like 2020-01, 01/2020
    const native = new Date(raw);
    if (!isNaN(native.getTime()) && /\d{4}/.test(raw)) return native;
    // Try "MMM YYYY" / "MMMM YYYY"
    const mmmY = s.match(/^([a-z]+)\s+(\d{4})$/);
    if (mmmY) {
      const mon = MONTH_MAP[mmmY[1]];
      const yr = parseInt(mmmY[2], 10);
      if (mon !== undefined && !isNaN(yr)) return new Date(yr, mon, 1);
    }
    // Try "MM/YYYY" or "MM-YYYY"
    const mmY = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (mmY) {
      const mon = parseInt(mmY[1], 10) - 1;
      const yr = parseInt(mmY[2], 10);
      if (mon >= 0 && mon < 12) return new Date(yr, mon, 1);
    }
    return null;
  };

  let totalMonths = 0;
  for (const exp of resume.experience) {
    const start = exp.startDate ? parseDate(exp.startDate) : null;
    const end = exp.endDate ? parseDate(exp.endDate) : new Date();
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) continue;
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months > 0 && months < 600) totalMonths += months; // sanity cap 50y per role
  }
  if (totalMonths <= 0) return 0;
  return Math.round((totalMonths / 12) * 10) / 10;
};

export const getResumeYears = (resume: ResumeContent): number => {
  const parsed = parseYearsOfExperience(resume.yearsOfExperience as any);
  if (parsed > 0) return parsed;
  return computeYearsFromExperienceDates(resume);
};

export const countMeasurableResults = (resume: ResumeContent) => {
  const found = Array.isArray(resume.measurableResults)
    ? resume.measurableResults
    : [];
  return { count: found.length, found: found.slice(0, 5) };
};

export const measurableResultsScore = (count: number): number =>
  count >= 5
    ? 100
    : count === 4
      ? 80
      : count === 3
        ? 60
        : count === 2
          ? 40
          : count === 1
            ? 20
            : 0;

const countActionVerbs = (resume: ResumeContent) => {
  const found = Array.isArray(resume.actionVerbs) ? resume.actionVerbs : [];
  return { count: found.length, found: found.slice(0, 5) };
};

const actionVerbsScore = (count: number): number =>
  count >= 5
    ? 100
    : count === 4
      ? 80
      : count === 3
        ? 60
        : count === 2
          ? 40
          : count === 1
            ? 20
            : 0;

export const summaryScore = (summaryWords: number): number =>
  summaryWords >= 30 && summaryWords <= 80
    ? 100
    : summaryWords >= 80
      ? 60
      : summaryWords >= 10
        ? 40
        : summaryWords > 0
          ? 20
          : 0;

// ============================================================
// 
// ============================================================
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
    if (exp.endDate) push(exp.endDate);
  });
  resume.education?.forEach((edu) => {
    push(edu.startDate);
    if (edu.endDate) push(edu.endDate);
  });
  resume.projects?.forEach((p) => {
    push(p.startDate);
    if (p.endDate) push(p.endDate);
  });
  return dates;
};

export {
  extractSkillsFromResume,
  getSkillVariants,
  countVariantsInText,
  countActionVerbs,
  actionVerbsScore,
};
