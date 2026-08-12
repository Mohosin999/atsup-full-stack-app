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
import { MEASURABLE_RESULT_RE, ACTION_VERBS } from "./constants";
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
// Years of experience from parsed field
// ============================================================
export const parseYearsOfExperience = (raw?: string | number): number => {
  if (raw == null || raw === "") return 0;
  if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
  const matches = String(raw).match(/\d+/g);
  if (!matches) return 0;
  return Math.max(...matches.map(Number));
};

export const countMeasurableResults = (resume: ResumeContent) => {
  const highlights = (resume.experience || [])
    .flatMap((exp) => exp.responsibilities || [])
    .filter((h) => MEASURABLE_RESULT_RE.test(h));
  return { count: highlights.length, found: highlights.slice(0, 5) };
};

export const measurableResultsScore = (count: number): number =>
  count >= 3 ? 100 : count === 2 ? 80 : count === 1 ? 60 : 0;

const ACTION_VERBS_RE = new RegExp(
  `\\b(?:${ACTION_VERBS.map((v) =>
    v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})\\b`,
  "gi",
);

const countActionVerbs = (resume: ResumeContent) => {
  const highlights = (resume.experience || []).flatMap(
    (exp) => exp.responsibilities || [],
  );
  const text = highlights.join(" ");

  const matched = new Set<string>();
  ACTION_VERBS_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ACTION_VERBS_RE.exec(text))) {
    matched.add(m[0].toLowerCase());
  }

  return { count: matched.size, found: [...matched].slice(0, 5) };
};

const actionVerbsScore = (count: number): number =>
  count >= 3 ? 100 : count === 2 ? 80 : count === 1 ? 60 : 0;

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
  resume.education?.forEach((edu) => push((edu as any).date));
  return dates;
};

export {
  extractSkillsFromResume,
  getSkillVariants,
  countVariantsInText,
  countActionVerbs,
  actionVerbsScore,
};
